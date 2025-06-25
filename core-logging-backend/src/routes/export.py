from flask import Blueprint, jsonify, request, send_file, current_app
import csv
import io
import json
from datetime import datetime
from src.models.user import db, DrillHole, CoreRun, CoreTray, CoreInterval, QAQCItem

export_bp = Blueprint('export', __name__)

@export_bp.route('/api/export/csv', methods=['GET'])
def export_csv():
    """Export core logging data to CSV format"""
    try:
        
        export_type = request.args.get('type', 'intervals')
        drill_hole_id = request.args.get('drill_hole_id')
        
        if export_type == 'intervals':
            # Export core intervals data
            query = CoreInterval.query
            if drill_hole_id:
                query = query.join(CoreRun).filter(CoreRun.drill_hole_id == drill_hole_id)
            
            intervals = query.all()
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Write header
            writer.writerow([
                'Drill_Hole', 'Core_Run', 'From_Depth', 'To_Depth', 'Length',
                'Lithology', 'Lithology_Code', 'Alteration', 'Alteration_Code',
                'Mineralization', 'Mineralization_Code', 'Structure', 'Structure_Code',
                'Recovery_Percentage', 'RQD', 'Comments', 'Logged_Date', 'Logged_By'
            ])
            
            # Write data
            for interval in intervals:
                core_run = CoreRun.query.get(interval.core_run_id)
                drill_hole = DrillHole.query.get(core_run.drill_hole_id)
                
                writer.writerow([
                    drill_hole.hole_id,
                    f"Run {core_run.run_number}",
                    interval.from_depth,
                    interval.to_depth,
                    interval.to_depth - interval.from_depth,
                    interval.lithology,
                    interval.lithology_code,
                    interval.alteration_type,
                    interval.alteration_type,  # Using alteration_type as code
                    interval.mineralization_type,
                    interval.mineralization_type,  # Using mineralization_type as code
                    interval.structural_features,
                    interval.structural_features,  # Using structural_features as code
                    interval.recovery_percentage,
                    interval.rqd_contribution,
                    interval.comments,
                    interval.logged_date,
                    interval.logged_by
                ])
            
            output.seek(0)
            
            # Create response
            return current_app.response_class(
                output.getvalue(),
                mimetype='text/csv',
                headers={'Content-Disposition': f'attachment; filename=core_intervals_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'}
            )
            
        elif export_type == 'drill_holes':
            # Export drill holes summary
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
            
        else:
            return jsonify({'error': 'Invalid export type'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@export_bp.route('/api/export/leapfrog', methods=['GET'])
def export_leapfrog():
    """Export data in Leapfrog-compatible format"""
    try:
        drill_hole_id = request.args.get('drill_hole_id')
        
        # Query intervals with spatial data
        query = CoreInterval.query
        if drill_hole_id:
            query = query.join(CoreRun).filter(CoreRun.drill_hole_id == drill_hole_id)
        
        intervals = query.all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Leapfrog format header
        writer.writerow([
            'BHID', 'FROM', 'TO', 'LITHOLOGY', 'ALTERATION', 'MINERALIZATION',
            'RECOVERY', 'RQD', 'STRUCTURE', 'COMMENTS'
        ])
        
        # Write data in Leapfrog format
        for interval in intervals:
            core_run = CoreRun.query.get(interval.core_run_id)
            drill_hole = DrillHole.query.get(core_run.drill_hole_id)
            
            writer.writerow([
                drill_hole.hole_id,
                interval.from_depth,
                interval.to_depth,
                interval.lithology_code or interval.lithology,
                interval.alteration_code or interval.alteration,
                interval.mineralization_code or interval.mineralization,
                interval.recovery_percentage,
                interval.rqd,
                interval.structure_code or interval.structure,
                interval.comments
            ])
        
        output.seek(0)
        
        response = send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'leapfrog_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@export_bp.route('/api/export/qaqc', methods=['GET'])
def export_qaqc():
    """Export QA/QC report"""
    try:
        qaqc_items = QAQCItem.query.all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'ID', 'Title', 'Description', 'Type', 'Priority', 'Status',
            'Assigned_To', 'Drill_Hole', 'Core_Run', 'Created_Date',
            'Due_Date', 'Resolved_Date', 'Comments_Count'
        ])
        
        # Write data
        for item in qaqc_items:
            writer.writerow([
                item.id,
                item.title,
                item.description,
                item.type,
                item.priority,
                item.status,
                item.assigned_to,
                item.drill_hole,
                item.core_run,
                item.created_date,
                item.due_date,
                item.resolved_date,
                item.comments_count or 0
            ])
        
        output.seek(0)
        
        response = send_file(
            io.BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'qaqc_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@export_bp.route('/api/import/csv', methods=['POST'])
def import_csv():
    """Import data from CSV file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        import_type = request.form.get('type', 'intervals')
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.csv'):
            return jsonify({'error': 'File must be CSV format'}), 400
        
        # Read CSV content
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        csv_input = csv.DictReader(stream)
        
        imported_count = 0
        errors = []
        
        if import_type == 'drill_holes':
            # Import drill holes
            for row_num, row in enumerate(csv_input, start=2):
                try:
                    # Check if drill hole already exists
                    existing_hole = DrillHole.query.filter_by(hole_id=row['Hole_ID']).first()
                    if existing_hole:
                        errors.append(f"Row {row_num}: Drill hole {row['Hole_ID']} already exists")
                        continue
                    
                    drill_hole = DrillHole(
                        hole_id=row['Hole_ID'],
                        project=row.get('Project', ''),
                        location=row.get('Location', ''),
                        collar_x=float(row.get('Collar_X', 0)) if row.get('Collar_X') else None,
                        collar_y=float(row.get('Collar_Y', 0)) if row.get('Collar_Y') else None,
                        collar_z=float(row.get('Collar_Z', 0)) if row.get('Collar_Z') else None,
                        total_depth=float(row.get('Total_Depth', 0)) if row.get('Total_Depth') else None,
                        azimuth=float(row.get('Azimuth', 0)) if row.get('Azimuth') else None,
                        dip=float(row.get('Dip', 0)) if row.get('Dip') else None,
                        start_date=row.get('Start_Date'),
                        end_date=row.get('End_Date'),
                        status=row.get('Status', 'active')
                    )
                    
                    db.session.add(drill_hole)
                    imported_count += 1
                    
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")
        
        elif import_type == 'intervals':
            # Import core intervals
            for row_num, row in enumerate(csv_input, start=2):
                try:
                    # Find drill hole and core run
                    drill_hole = DrillHole.query.filter_by(hole_id=row['Drill_Hole']).first()
                    if not drill_hole:
                        errors.append(f"Row {row_num}: Drill hole {row['Drill_Hole']} not found")
                        continue
                    
                    # Extract run number from Core_Run field
                    run_number = int(row['Core_Run'].replace('Run ', ''))
                    core_run = CoreRun.query.filter_by(
                        drill_hole_id=drill_hole.id,
                        run_number=run_number
                    ).first()
                    
                    if not core_run:
                        errors.append(f"Row {row_num}: Core run {row['Core_Run']} not found for drill hole {row['Drill_Hole']}")
                        continue
                    
                    interval = CoreInterval(
                        core_run_id=core_run.id,
                        from_depth=float(row['From_Depth']),
                        to_depth=float(row['To_Depth']),
                        lithology=row.get('Lithology', ''),
                        lithology_code=row.get('Lithology_Code', ''),
                        alteration=row.get('Alteration', ''),
                        alteration_code=row.get('Alteration_Code', ''),
                        mineralization=row.get('Mineralization', ''),
                        mineralization_code=row.get('Mineralization_Code', ''),
                        structure=row.get('Structure', ''),
                        structure_code=row.get('Structure_Code', ''),
                        recovery_percentage=float(row.get('Recovery_Percentage', 0)) if row.get('Recovery_Percentage') else None,
                        rqd=float(row.get('RQD', 0)) if row.get('RQD') else None,
                        comments=row.get('Comments', ''),
                        logged_by=row.get('Logged_By', 'Import'),
                        logged_date=datetime.now()
                    )
                    
                    db.session.add(interval)
                    imported_count += 1
                    
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")
        
        # Commit changes
        if imported_count > 0:
            db.session.commit()
        
        return jsonify({
            'success': True,
            'imported_count': imported_count,
            'errors': errors
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

