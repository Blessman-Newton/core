from flask import Blueprint, jsonify, request
from src.models.user import CoreInterval, CoreRun, db
from datetime import datetime
import json

core_interval_bp = Blueprint('core_interval', __name__)

@core_interval_bp.route('/core-intervals', methods=['GET'])
def get_core_intervals():
    """Get all core intervals with optional filtering"""
    core_run_id = request.args.get('core_run_id', type=int)
    lithology = request.args.get('lithology')
    
    query = CoreInterval.query
    if core_run_id:
        query = query.filter(CoreInterval.core_run_id == core_run_id)
    if lithology:
        query = query.filter(CoreInterval.lithology.ilike(f'%{lithology}%'))
    
    core_intervals = query.order_by(CoreInterval.from_depth).all()
    return jsonify([interval.to_dict() for interval in core_intervals])

@core_interval_bp.route('/core-intervals', methods=['POST'])
def create_core_interval():
    """Create a new core interval"""
    try:
        data = request.json
        
        # Validate core run exists
        core_run = CoreRun.query.get(data['core_run_id'])
        if not core_run:
            return jsonify({'error': 'Core run not found'}), 404
        
        # Calculate interval length
        interval_length = data['to_depth'] - data['from_depth']
        
        # Parse logged date if provided
        logged_date = None
        if data.get('logged_date'):
            logged_date = datetime.strptime(data['logged_date'], '%Y-%m-%d').date()
        
        # Handle JSON fields
        ore_minerals = data.get('ore_minerals')
        if isinstance(ore_minerals, (list, dict)):
            ore_minerals = json.dumps(ore_minerals)
        
        structural_features = data.get('structural_features')
        if isinstance(structural_features, (list, dict)):
            structural_features = json.dumps(structural_features)
        
        core_interval = CoreInterval(
            core_run_id=data['core_run_id'],
            from_depth=data['from_depth'],
            to_depth=data['to_depth'],
            interval_length=interval_length,
            lithology=data.get('lithology'),
            lithology_code=data.get('lithology_code'),
            rock_type=data.get('rock_type'),
            color=data.get('color'),
            grain_size=data.get('grain_size'),
            texture=data.get('texture'),
            alteration_type=data.get('alteration_type'),
            alteration_intensity=data.get('alteration_intensity'),
            alteration_style=data.get('alteration_style'),
            mineralization_type=data.get('mineralization_type'),
            mineralization_style=data.get('mineralization_style'),
            mineral_abundance=data.get('mineral_abundance'),
            ore_minerals=ore_minerals,
            fracture_frequency=data.get('fracture_frequency'),
            fracture_orientation=data.get('fracture_orientation'),
            bedding_orientation=data.get('bedding_orientation'),
            foliation_orientation=data.get('foliation_orientation'),
            structural_features=structural_features,
            rock_strength=data.get('rock_strength'),
            weathering_grade=data.get('weathering_grade'),
            recovery_percentage=data.get('recovery_percentage'),
            rqd_contribution=data.get('rqd_contribution', 0),
            comments=data.get('comments'),
            logged_by=data.get('logged_by'),
            logged_date=logged_date
        )
        
        db.session.add(core_interval)
        db.session.commit()
        return jsonify(core_interval.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@core_interval_bp.route('/core-intervals/<int:interval_id>', methods=['GET'])
def get_core_interval(interval_id):
    """Get a specific core interval"""
    core_interval = CoreInterval.query.get_or_404(interval_id)
    return jsonify(core_interval.to_dict())

@core_interval_bp.route('/core-intervals/<int:interval_id>', methods=['PUT'])
def update_core_interval(interval_id):
    """Update a core interval"""
    try:
        core_interval = CoreInterval.query.get_or_404(interval_id)
        data = request.json
        
        # Update fields if provided
        if 'from_depth' in data:
            core_interval.from_depth = data['from_depth']
        if 'to_depth' in data:
            core_interval.to_depth = data['to_depth']
        if 'lithology' in data:
            core_interval.lithology = data['lithology']
        if 'lithology_code' in data:
            core_interval.lithology_code = data['lithology_code']
        if 'rock_type' in data:
            core_interval.rock_type = data['rock_type']
        if 'color' in data:
            core_interval.color = data['color']
        if 'grain_size' in data:
            core_interval.grain_size = data['grain_size']
        if 'texture' in data:
            core_interval.texture = data['texture']
        if 'alteration_type' in data:
            core_interval.alteration_type = data['alteration_type']
        if 'alteration_intensity' in data:
            core_interval.alteration_intensity = data['alteration_intensity']
        if 'alteration_style' in data:
            core_interval.alteration_style = data['alteration_style']
        if 'mineralization_type' in data:
            core_interval.mineralization_type = data['mineralization_type']
        if 'mineralization_style' in data:
            core_interval.mineralization_style = data['mineralization_style']
        if 'mineral_abundance' in data:
            core_interval.mineral_abundance = data['mineral_abundance']
        if 'ore_minerals' in data:
            ore_minerals = data['ore_minerals']
            if isinstance(ore_minerals, (list, dict)):
                ore_minerals = json.dumps(ore_minerals)
            core_interval.ore_minerals = ore_minerals
        if 'fracture_frequency' in data:
            core_interval.fracture_frequency = data['fracture_frequency']
        if 'fracture_orientation' in data:
            core_interval.fracture_orientation = data['fracture_orientation']
        if 'bedding_orientation' in data:
            core_interval.bedding_orientation = data['bedding_orientation']
        if 'foliation_orientation' in data:
            core_interval.foliation_orientation = data['foliation_orientation']
        if 'structural_features' in data:
            structural_features = data['structural_features']
            if isinstance(structural_features, (list, dict)):
                structural_features = json.dumps(structural_features)
            core_interval.structural_features = structural_features
        if 'rock_strength' in data:
            core_interval.rock_strength = data['rock_strength']
        if 'weathering_grade' in data:
            core_interval.weathering_grade = data['weathering_grade']
        if 'recovery_percentage' in data:
            core_interval.recovery_percentage = data['recovery_percentage']
        if 'rqd_contribution' in data:
            core_interval.rqd_contribution = data['rqd_contribution']
        if 'comments' in data:
            core_interval.comments = data['comments']
        if 'logged_by' in data:
            core_interval.logged_by = data['logged_by']
        if 'logged_date' in data:
            core_interval.logged_date = datetime.strptime(data['logged_date'], '%Y-%m-%d').date()
        
        # Recalculate interval length
        core_interval.interval_length = core_interval.to_depth - core_interval.from_depth
        core_interval.updated_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify(core_interval.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@core_interval_bp.route('/core-intervals/<int:interval_id>', methods=['DELETE'])
def delete_core_interval(interval_id):
    """Delete a core interval"""
    try:
        core_interval = CoreInterval.query.get_or_404(interval_id)
        db.session.delete(core_interval)
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@core_interval_bp.route('/core-intervals/bulk', methods=['POST'])
def create_bulk_intervals():
    """Create multiple core intervals in bulk"""
    try:
        data = request.json
        intervals_data = data.get('intervals', [])
        
        if not intervals_data:
            return jsonify({'error': 'No intervals provided'}), 400
        
        created_intervals = []
        
        for interval_data in intervals_data:
            # Validate core run exists
            core_run = CoreRun.query.get(interval_data['core_run_id'])
            if not core_run:
                return jsonify({'error': f'Core run {interval_data["core_run_id"]} not found'}), 404
            
            # Calculate interval length
            interval_length = interval_data['to_depth'] - interval_data['from_depth']
            
            # Parse logged date if provided
            logged_date = None
            if interval_data.get('logged_date'):
                logged_date = datetime.strptime(interval_data['logged_date'], '%Y-%m-%d').date()
            
            # Handle JSON fields
            ore_minerals = interval_data.get('ore_minerals')
            if isinstance(ore_minerals, (list, dict)):
                ore_minerals = json.dumps(ore_minerals)
            
            structural_features = interval_data.get('structural_features')
            if isinstance(structural_features, (list, dict)):
                structural_features = json.dumps(structural_features)
            
            core_interval = CoreInterval(
                core_run_id=interval_data['core_run_id'],
                from_depth=interval_data['from_depth'],
                to_depth=interval_data['to_depth'],
                interval_length=interval_length,
                lithology=interval_data.get('lithology'),
                lithology_code=interval_data.get('lithology_code'),
                rock_type=interval_data.get('rock_type'),
                color=interval_data.get('color'),
                grain_size=interval_data.get('grain_size'),
                texture=interval_data.get('texture'),
                alteration_type=interval_data.get('alteration_type'),
                alteration_intensity=interval_data.get('alteration_intensity'),
                alteration_style=interval_data.get('alteration_style'),
                mineralization_type=interval_data.get('mineralization_type'),
                mineralization_style=interval_data.get('mineralization_style'),
                mineral_abundance=interval_data.get('mineral_abundance'),
                ore_minerals=ore_minerals,
                fracture_frequency=interval_data.get('fracture_frequency'),
                fracture_orientation=interval_data.get('fracture_orientation'),
                bedding_orientation=interval_data.get('bedding_orientation'),
                foliation_orientation=interval_data.get('foliation_orientation'),
                structural_features=structural_features,
                rock_strength=interval_data.get('rock_strength'),
                weathering_grade=interval_data.get('weathering_grade'),
                recovery_percentage=interval_data.get('recovery_percentage'),
                rqd_contribution=interval_data.get('rqd_contribution', 0),
                comments=interval_data.get('comments'),
                logged_by=interval_data.get('logged_by'),
                logged_date=logged_date
            )
            
            db.session.add(core_interval)
            created_intervals.append(core_interval)
        
        db.session.commit()
        return jsonify({
            'message': f'Successfully created {len(created_intervals)} intervals',
            'intervals': [interval.to_dict() for interval in created_intervals]
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

