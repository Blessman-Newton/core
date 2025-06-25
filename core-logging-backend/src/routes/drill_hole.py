from flask import Blueprint, jsonify, request
from src.models.user import DrillHole, db
from datetime import datetime

drill_hole_bp = Blueprint('drill_hole', __name__)

@drill_hole_bp.route('/drill-holes', methods=['GET'])
def get_drill_holes():
    """Get all drill holes with optional filtering"""
    project_name = request.args.get('project_name')
    
    query = DrillHole.query
    if project_name:
        query = query.filter(DrillHole.project_name.ilike(f'%{project_name}%'))
    
    drill_holes = query.all()
    return jsonify([drill_hole.to_dict() for drill_hole in drill_holes])

@drill_hole_bp.route('/drill-holes', methods=['POST'])
def create_drill_hole():
    """Create a new drill hole"""
    try:
        data = request.json
        
        # Parse dates if provided
        start_date = None
        end_date = None
        if data.get('start_date'):
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if data.get('end_date'):
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        drill_hole = DrillHole(
            hole_id=data['hole_id'],
            project_name=data['project_name'],
            location_x=data.get('location_x'),
            location_y=data.get('location_y'),
            elevation=data.get('elevation'),
            azimuth=data.get('azimuth'),
            dip=data.get('dip'),
            total_depth=data.get('total_depth'),
            start_date=start_date,
            end_date=end_date,
            drilling_company=data.get('drilling_company')
        )
        
        db.session.add(drill_hole)
        db.session.commit()
        return jsonify(drill_hole.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@drill_hole_bp.route('/drill-holes/<int:drill_hole_id>', methods=['GET'])
def get_drill_hole(drill_hole_id):
    """Get a specific drill hole"""
    drill_hole = DrillHole.query.get_or_404(drill_hole_id)
    return jsonify(drill_hole.to_dict())

@drill_hole_bp.route('/drill-holes/<int:drill_hole_id>', methods=['PUT'])
def update_drill_hole(drill_hole_id):
    """Update a drill hole"""
    try:
        drill_hole = DrillHole.query.get_or_404(drill_hole_id)
        data = request.json
        
        # Update fields if provided
        if 'hole_id' in data:
            drill_hole.hole_id = data['hole_id']
        if 'project_name' in data:
            drill_hole.project_name = data['project_name']
        if 'location_x' in data:
            drill_hole.location_x = data['location_x']
        if 'location_y' in data:
            drill_hole.location_y = data['location_y']
        if 'elevation' in data:
            drill_hole.elevation = data['elevation']
        if 'azimuth' in data:
            drill_hole.azimuth = data['azimuth']
        if 'dip' in data:
            drill_hole.dip = data['dip']
        if 'total_depth' in data:
            drill_hole.total_depth = data['total_depth']
        if 'start_date' in data:
            drill_hole.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'end_date' in data:
            drill_hole.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        if 'drilling_company' in data:
            drill_hole.drilling_company = data['drilling_company']
        
        db.session.commit()
        return jsonify(drill_hole.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@drill_hole_bp.route('/drill-holes/<int:drill_hole_id>', methods=['DELETE'])
def delete_drill_hole(drill_hole_id):
    """Delete a drill hole"""
    try:
        drill_hole = DrillHole.query.get_or_404(drill_hole_id)
        db.session.delete(drill_hole)
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@drill_hole_bp.route('/drill-holes/<int:drill_hole_id>/summary', methods=['GET'])
def get_drill_hole_summary(drill_hole_id):
    """Get summary statistics for a drill hole"""
    drill_hole = DrillHole.query.get_or_404(drill_hole_id)
    
    # Calculate summary statistics
    total_runs = len(drill_hole.core_runs)
    total_trays = len(drill_hole.core_trays)
    
    if drill_hole.core_runs:
        avg_recovery = sum(run.total_core_recovery for run in drill_hole.core_runs) / total_runs
        avg_rqd = sum(run.rqd_percentage for run in drill_hole.core_runs) / total_runs
        total_core_length = sum(run.core_recovered_length for run in drill_hole.core_runs)
    else:
        avg_recovery = 0
        avg_rqd = 0
        total_core_length = 0
    
    summary = {
        'drill_hole': drill_hole.to_dict(),
        'total_runs': total_runs,
        'total_trays': total_trays,
        'average_recovery': round(avg_recovery, 2),
        'average_rqd': round(avg_rqd, 2),
        'total_core_length': round(total_core_length, 2)
    }
    
    return jsonify(summary)



@drill_hole_bp.route('/api/drill-holes/export/csv', methods=['GET'])
def export_drill_holes_csv():
    """Export drill holes to CSV format"""
    try:
        import csv
        import io
        from datetime import datetime
        from flask import current_app
        
        drill_holes = DrillHole.query.all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Hole_ID', 'Project', 'Location', 'Collar_X', 'Collar_Y', 'Collar_Z',
            'Total_Depth', 'Azimuth', 'Dip', 'Start_Date', 'End_Date', 'Status'
        ])
        
        # Write data
        for hole in drill_holes:
            writer.writerow([
                hole.hole_id,
                hole.project,
                hole.location,
                hole.collar_x,
                hole.collar_y,
                hole.collar_z,
                hole.total_depth,
                hole.azimuth,
                hole.dip,
                hole.start_date,
                hole.end_date,
                hole.status
            ])
        
        output.seek(0)
        
        return current_app.response_class(
            output.getvalue(),
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename=drill_holes_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'}
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@drill_hole_bp.route('/api/drill-holes/export/leapfrog', methods=['GET'])
def export_drill_holes_leapfrog():
    """Export drill holes in Leapfrog-compatible format"""
    try:
        import csv
        import io
        from datetime import datetime
        from flask import current_app
        
        # Get all intervals with drill hole information
        intervals = db.session.query(CoreInterval, CoreRun, DrillHole).join(
            CoreRun, CoreInterval.core_run_id == CoreRun.id
        ).join(
            DrillHole, CoreRun.drill_hole_id == DrillHole.id
        ).all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Leapfrog format header
        writer.writerow([
            'BHID', 'FROM', 'TO', 'LITHOLOGY', 'ALTERATION', 'MINERALIZATION',
            'RECOVERY', 'RQD', 'STRUCTURE', 'COMMENTS'
        ])
        
        # Write data in Leapfrog format
        for interval, core_run, drill_hole in intervals:
            writer.writerow([
                drill_hole.hole_id,
                interval.from_depth,
                interval.to_depth,
                interval.lithology_code or interval.lithology,
                interval.alteration_type,
                interval.mineralization_type,
                interval.recovery_percentage,
                interval.rqd_contribution,
                interval.structural_features,
                interval.comments
            ])
        
        output.seek(0)
        
        return current_app.response_class(
            output.getvalue(),
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename=leapfrog_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'}
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

