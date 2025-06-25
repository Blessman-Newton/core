from flask import Blueprint, jsonify, request
from src.models.user import CoreRun, DrillHole, db
from datetime import datetime

core_run_bp = Blueprint('core_run', __name__)

@core_run_bp.route('/core-runs', methods=['GET'])
def get_core_runs():
    """Get all core runs with optional filtering"""
    drill_hole_id = request.args.get('drill_hole_id', type=int)
    
    query = CoreRun.query
    if drill_hole_id:
        query = query.filter(CoreRun.drill_hole_id == drill_hole_id)
    
    core_runs = query.order_by(CoreRun.from_depth).all()
    return jsonify([core_run.to_dict() for core_run in core_runs])

@core_run_bp.route('/core-runs', methods=['POST'])
def create_core_run():
    """Create a new core run"""
    try:
        data = request.json
        
        # Validate drill hole exists
        drill_hole = DrillHole.query.get(data['drill_hole_id'])
        if not drill_hole:
            return jsonify({'error': 'Drill hole not found'}), 404
        
        # Calculate run length
        run_length = data['to_depth'] - data['from_depth']
        
        # Calculate TCR percentage
        tcr_percentage = (data['core_recovered_length'] / run_length) * 100 if run_length > 0 else 0
        
        # Calculate RQD percentage
        rqd_percentage = (data.get('rqd_length', 0) / run_length) * 100 if run_length > 0 else 0
        
        # Parse drilling date if provided
        drilling_date = None
        if data.get('drilling_date'):
            drilling_date = datetime.strptime(data['drilling_date'], '%Y-%m-%d').date()
        
        core_run = CoreRun(
            drill_hole_id=data['drill_hole_id'],
            run_number=data['run_number'],
            from_depth=data['from_depth'],
            to_depth=data['to_depth'],
            run_length=run_length,
            core_recovered_length=data['core_recovered_length'],
            total_core_recovery=round(tcr_percentage, 2),
            rqd_length=data.get('rqd_length', 0),
            rqd_percentage=round(rqd_percentage, 2),
            drilling_date=drilling_date,
            logged_by=data.get('logged_by')
        )
        
        db.session.add(core_run)
        db.session.commit()
        return jsonify(core_run.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@core_run_bp.route('/core-runs/<int:core_run_id>', methods=['GET'])
def get_core_run(core_run_id):
    """Get a specific core run"""
    core_run = CoreRun.query.get_or_404(core_run_id)
    return jsonify(core_run.to_dict())

@core_run_bp.route('/core-runs/<int:core_run_id>', methods=['PUT'])
def update_core_run(core_run_id):
    """Update a core run"""
    try:
        core_run = CoreRun.query.get_or_404(core_run_id)
        data = request.json
        
        # Update fields if provided
        if 'run_number' in data:
            core_run.run_number = data['run_number']
        if 'from_depth' in data:
            core_run.from_depth = data['from_depth']
        if 'to_depth' in data:
            core_run.to_depth = data['to_depth']
        if 'core_recovered_length' in data:
            core_run.core_recovered_length = data['core_recovered_length']
        if 'rqd_length' in data:
            core_run.rqd_length = data['rqd_length']
        if 'drilling_date' in data:
            core_run.drilling_date = datetime.strptime(data['drilling_date'], '%Y-%m-%d').date()
        if 'logged_by' in data:
            core_run.logged_by = data['logged_by']
        
        # Recalculate derived fields
        core_run.run_length = core_run.to_depth - core_run.from_depth
        core_run.total_core_recovery = (core_run.core_recovered_length / core_run.run_length) * 100 if core_run.run_length > 0 else 0
        core_run.rqd_percentage = (core_run.rqd_length / core_run.run_length) * 100 if core_run.run_length > 0 else 0
        core_run.updated_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify(core_run.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@core_run_bp.route('/core-runs/<int:core_run_id>', methods=['DELETE'])
def delete_core_run(core_run_id):
    """Delete a core run"""
    try:
        core_run = CoreRun.query.get_or_404(core_run_id)
        db.session.delete(core_run)
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@core_run_bp.route('/core-runs/<int:core_run_id>/calculate-recovery', methods=['POST'])
def calculate_recovery(core_run_id):
    """Recalculate recovery metrics for a core run"""
    try:
        core_run = CoreRun.query.get_or_404(core_run_id)
        data = request.json
        
        # Update core lengths if provided
        if 'core_recovered_length' in data:
            core_run.core_recovered_length = data['core_recovered_length']
        if 'rqd_length' in data:
            core_run.rqd_length = data['rqd_length']
        
        # Recalculate percentages
        if core_run.run_length > 0:
            core_run.total_core_recovery = round((core_run.core_recovered_length / core_run.run_length) * 100, 2)
            core_run.rqd_percentage = round((core_run.rqd_length / core_run.run_length) * 100, 2)
        else:
            core_run.total_core_recovery = 0
            core_run.rqd_percentage = 0
        
        core_run.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'core_run_id': core_run.id,
            'total_core_recovery': core_run.total_core_recovery,
            'rqd_percentage': core_run.rqd_percentage,
            'message': 'Recovery metrics recalculated successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

