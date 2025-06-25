from flask import Blueprint, jsonify, request
from src.models.user import DrillHole, CoreRun, CoreInterval, db
from sqlalchemy import func
import csv
import io

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics/recovery-trends', methods=['GET'])
def get_recovery_trends():
    """Get core recovery trends"""
    drill_hole_id = request.args.get('drill_hole_id', type=int)
    project_name = request.args.get('project_name')
    
    query = db.session.query(
        CoreRun.drill_hole_id,
        DrillHole.hole_id,
        DrillHole.project_name,
        func.avg(CoreRun.total_core_recovery).label('avg_recovery'),
        func.avg(CoreRun.rqd_percentage).label('avg_rqd'),
        func.min(CoreRun.total_core_recovery).label('min_recovery'),
        func.max(CoreRun.total_core_recovery).label('max_recovery'),
        func.count(CoreRun.id).label('total_runs')
    ).join(DrillHole, CoreRun.drill_hole_id == DrillHole.id)
    
    if drill_hole_id:
        query = query.filter(CoreRun.drill_hole_id == drill_hole_id)
    if project_name:
        query = query.filter(DrillHole.project_name.ilike(f'%{project_name}%'))
    
    results = query.group_by(CoreRun.drill_hole_id, DrillHole.hole_id, DrillHole.project_name).all()
    
    trends = []
    for result in results:
        trends.append({
            'drill_hole_id': result.drill_hole_id,
            'hole_id': result.hole_id,
            'project_name': result.project_name,
            'avg_recovery': round(result.avg_recovery, 2) if result.avg_recovery else 0,
            'avg_rqd': round(result.avg_rqd, 2) if result.avg_rqd else 0,
            'min_recovery': round(result.min_recovery, 2) if result.min_recovery else 0,
            'max_recovery': round(result.max_recovery, 2) if result.max_recovery else 0,
            'total_runs': result.total_runs
        })
    
    return jsonify(trends)

@analytics_bp.route('/analytics/recovery-by-depth', methods=['GET'])
def get_recovery_by_depth():
    """Get recovery trends by depth intervals"""
    drill_hole_id = request.args.get('drill_hole_id', type=int)
    interval_size = request.args.get('interval_size', default=50, type=int)  # Default 50m intervals
    
    query = CoreRun.query.join(DrillHole)
    if drill_hole_id:
        query = query.filter(CoreRun.drill_hole_id == drill_hole_id)
    
    core_runs = query.all()
    
    # Group by depth intervals
    depth_intervals = {}
    for run in core_runs:
        # Calculate which interval this run belongs to
        interval_start = (int(run.from_depth) // interval_size) * interval_size
        interval_end = interval_start + interval_size
        interval_key = f"{interval_start}-{interval_end}m"
        
        if interval_key not in depth_intervals:
            depth_intervals[interval_key] = {
                'interval': interval_key,
                'from_depth': interval_start,
                'to_depth': interval_end,
                'runs': [],
                'avg_recovery': 0,
                'avg_rqd': 0,
                'total_runs': 0
            }
        
        depth_intervals[interval_key]['runs'].append(run)
    
    # Calculate averages for each interval
    for interval_key in depth_intervals:
        runs = depth_intervals[interval_key]['runs']
        total_runs = len(runs)
        
        if total_runs > 0:
            avg_recovery = sum(run.total_core_recovery for run in runs) / total_runs
            avg_rqd = sum(run.rqd_percentage for run in runs) / total_runs
            
            depth_intervals[interval_key]['avg_recovery'] = round(avg_recovery, 2)
            depth_intervals[interval_key]['avg_rqd'] = round(avg_rqd, 2)
            depth_intervals[interval_key]['total_runs'] = total_runs
        
        # Remove the runs list from the response
        del depth_intervals[interval_key]['runs']
    
    # Sort by depth
    sorted_intervals = sorted(depth_intervals.values(), key=lambda x: x['from_depth'])
    
    return jsonify(sorted_intervals)

@analytics_bp.route('/analytics/lithology-distribution', methods=['GET'])
def get_lithology_distribution():
    """Get lithology distribution statistics"""
    drill_hole_id = request.args.get('drill_hole_id', type=int)
    project_name = request.args.get('project_name')
    
    query = db.session.query(
        CoreInterval.lithology,
        func.count(CoreInterval.id).label('count'),
        func.sum(CoreInterval.interval_length).label('total_length'),
        func.avg(CoreInterval.recovery_percentage).label('avg_recovery')
    ).join(CoreRun).join(DrillHole)
    
    if drill_hole_id:
        query = query.filter(DrillHole.id == drill_hole_id)
    if project_name:
        query = query.filter(DrillHole.project_name.ilike(f'%{project_name}%'))
    
    results = query.filter(CoreInterval.lithology.isnot(None)).group_by(CoreInterval.lithology).all()
    
    distribution = []
    total_length = sum(result.total_length or 0 for result in results)
    
    for result in results:
        length = result.total_length or 0
        percentage = (length / total_length * 100) if total_length > 0 else 0
        
        distribution.append({
            'lithology': result.lithology,
            'count': result.count,
            'total_length': round(length, 2),
            'percentage': round(percentage, 2),
            'avg_recovery': round(result.avg_recovery, 2) if result.avg_recovery else 0
        })
    
    # Sort by total length descending
    distribution.sort(key=lambda x: x['total_length'], reverse=True)
    
    return jsonify(distribution)

@analytics_bp.route('/analytics/project-summary', methods=['GET'])
def get_project_summary():
    """Get overall project summary statistics"""
    project_name = request.args.get('project_name')
    
    # Base queries
    drill_holes_query = DrillHole.query
    if project_name:
        drill_holes_query = drill_holes_query.filter(DrillHole.project_name.ilike(f'%{project_name}%'))
    
    drill_holes = drill_holes_query.all()
    drill_hole_ids = [dh.id for dh in drill_holes]
    
    if not drill_hole_ids:
        return jsonify({
            'total_drill_holes': 0,
            'total_core_runs': 0,
            'total_intervals': 0,
            'total_core_length': 0,
            'avg_recovery': 0,
            'avg_rqd': 0,
            'projects': []
        })
    
    # Core runs statistics
    core_runs = CoreRun.query.filter(CoreRun.drill_hole_id.in_(drill_hole_ids)).all()
    core_intervals = CoreInterval.query.join(CoreRun).filter(CoreRun.drill_hole_id.in_(drill_hole_ids)).all()
    
    total_core_length = sum(run.core_recovered_length for run in core_runs)
    avg_recovery = sum(run.total_core_recovery for run in core_runs) / len(core_runs) if core_runs else 0
    avg_rqd = sum(run.rqd_percentage for run in core_runs) / len(core_runs) if core_runs else 0
    
    # Project breakdown
    projects = {}
    for dh in drill_holes:
        if dh.project_name not in projects:
            projects[dh.project_name] = {
                'project_name': dh.project_name,
                'drill_holes': 0,
                'total_depth': 0,
                'avg_recovery': 0,
                'avg_rqd': 0
            }
        
        projects[dh.project_name]['drill_holes'] += 1
        projects[dh.project_name]['total_depth'] += dh.total_depth or 0
        
        # Calculate project-specific recovery
        project_runs = [run for run in core_runs if run.drill_hole_id == dh.id]
        if project_runs:
            project_recovery = sum(run.total_core_recovery for run in project_runs) / len(project_runs)
            project_rqd = sum(run.rqd_percentage for run in project_runs) / len(project_runs)
            projects[dh.project_name]['avg_recovery'] = round(project_recovery, 2)
            projects[dh.project_name]['avg_rqd'] = round(project_rqd, 2)
    
    summary = {
        'total_drill_holes': len(drill_holes),
        'total_core_runs': len(core_runs),
        'total_intervals': len(core_intervals),
        'total_core_length': round(total_core_length, 2),
        'avg_recovery': round(avg_recovery, 2),
        'avg_rqd': round(avg_rqd, 2),
        'projects': list(projects.values())
    }
    
    return jsonify(summary)

@analytics_bp.route('/analytics/export-csv', methods=['GET'])
def export_csv():
    """Export core logging data to CSV format"""
    drill_hole_id = request.args.get('drill_hole_id', type=int)
    project_name = request.args.get('project_name')
    export_type = request.args.get('type', 'intervals')  # intervals, runs, holes
    
    output = io.StringIO()
    
    if export_type == 'intervals':
        # Export core intervals
        query = db.session.query(
            DrillHole.hole_id,
            DrillHole.project_name,
            CoreRun.run_number,
            CoreInterval.from_depth,
            CoreInterval.to_depth,
            CoreInterval.interval_length,
            CoreInterval.lithology,
            CoreInterval.lithology_code,
            CoreInterval.rock_type,
            CoreInterval.color,
            CoreInterval.alteration_type,
            CoreInterval.alteration_intensity,
            CoreInterval.mineralization_type,
            CoreInterval.mineral_abundance,
            CoreInterval.fracture_frequency,
            CoreInterval.rock_strength,
            CoreInterval.recovery_percentage,
            CoreInterval.rqd_contribution,
            CoreInterval.comments
        ).join(CoreRun).join(DrillHole)
        
        if drill_hole_id:
            query = query.filter(DrillHole.id == drill_hole_id)
        if project_name:
            query = query.filter(DrillHole.project_name.ilike(f'%{project_name}%'))
        
        results = query.order_by(DrillHole.hole_id, CoreInterval.from_depth).all()
        
        fieldnames = [
            'hole_id', 'project_name', 'run_number', 'from_depth', 'to_depth',
            'interval_length', 'lithology', 'lithology_code', 'rock_type', 'color',
            'alteration_type', 'alteration_intensity', 'mineralization_type',
            'mineral_abundance', 'fracture_frequency', 'rock_strength',
            'recovery_percentage', 'rqd_contribution', 'comments'
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for result in results:
            writer.writerow({
                'hole_id': result.hole_id,
                'project_name': result.project_name,
                'run_number': result.run_number,
                'from_depth': result.from_depth,
                'to_depth': result.to_depth,
                'interval_length': result.interval_length,
                'lithology': result.lithology,
                'lithology_code': result.lithology_code,
                'rock_type': result.rock_type,
                'color': result.color,
                'alteration_type': result.alteration_type,
                'alteration_intensity': result.alteration_intensity,
                'mineralization_type': result.mineralization_type,
                'mineral_abundance': result.mineral_abundance,
                'fracture_frequency': result.fracture_frequency,
                'rock_strength': result.rock_strength,
                'recovery_percentage': result.recovery_percentage,
                'rqd_contribution': result.rqd_contribution,
                'comments': result.comments
            })
    
    elif export_type == 'runs':
        # Export core runs
        query = db.session.query(
            DrillHole.hole_id,
            DrillHole.project_name,
            CoreRun.run_number,
            CoreRun.from_depth,
            CoreRun.to_depth,
            CoreRun.run_length,
            CoreRun.core_recovered_length,
            CoreRun.total_core_recovery,
            CoreRun.rqd_length,
            CoreRun.rqd_percentage,
            CoreRun.drilling_date
        ).join(DrillHole)
        
        if drill_hole_id:
            query = query.filter(DrillHole.id == drill_hole_id)
        if project_name:
            query = query.filter(DrillHole.project_name.ilike(f'%{project_name}%'))
        
        results = query.order_by(DrillHole.hole_id, CoreRun.from_depth).all()
        
        fieldnames = [
            'hole_id', 'project_name', 'run_number', 'from_depth', 'to_depth',
            'run_length', 'core_recovered_length', 'total_core_recovery',
            'rqd_length', 'rqd_percentage', 'drilling_date'
        ]
        
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        
        for result in results:
            writer.writerow({
                'hole_id': result.hole_id,
                'project_name': result.project_name,
                'run_number': result.run_number,
                'from_depth': result.from_depth,
                'to_depth': result.to_depth,
                'run_length': result.run_length,
                'core_recovered_length': result.core_recovered_length,
                'total_core_recovery': result.total_core_recovery,
                'rqd_length': result.rqd_length,
                'rqd_percentage': result.rqd_percentage,
                'drilling_date': result.drilling_date.isoformat() if result.drilling_date else ''
            })
    
    csv_content = output.getvalue()
    output.close()
    
    return jsonify({
        'csv_data': csv_content,
        'filename': f'core_logging_{export_type}_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
    })

@analytics_bp.route('/analytics/summary', methods=['GET'])
def get_analytics_summary():
    """Get overall analytics summary for dashboard"""
    total_drill_holes = DrillHole.query.count()
    total_core_runs = CoreRun.query.count()
    total_meters_logged = db.session.query(func.sum(CoreRun.core_recovered_length)).scalar() or 0
    average_recovery = db.session.query(func.avg(CoreRun.total_core_recovery)).scalar() or 0
    average_rqd = db.session.query(func.avg(CoreRun.rqd_percentage)).scalar() or 0
    active_projects = db.session.query(DrillHole.project_name).distinct().count()

    return jsonify({
        'summary': {
            'totalDrillHoles': total_drill_holes,
            'totalCoreRuns': total_core_runs,
            'totalMetersLogged': round(total_meters_logged, 2),
            'averageRecovery': round(average_recovery, 2),
            'averageRQD': round(average_rqd, 2),
            'activeProjects': active_projects
        }
    })

