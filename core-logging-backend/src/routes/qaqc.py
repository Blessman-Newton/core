from flask import Blueprint, jsonify, request
from src.models.user import QAQCRecord, DrillHole, db
from datetime import datetime

qaqc_bp = Blueprint('qaqc', __name__)

@qaqc_bp.route('/qaqc-records', methods=['GET'])
def get_qaqc_records():
    """Get all QA/QC records with optional filtering"""
    drill_hole_id = request.args.get('drill_hole_id', type=int)
    record_type = request.args.get('record_type')
    status = request.args.get('status')
    
    query = QAQCRecord.query
    if drill_hole_id:
        query = query.filter(QAQCRecord.drill_hole_id == drill_hole_id)
    if record_type:
        query = query.filter(QAQCRecord.record_type == record_type)
    if status:
        query = query.filter(QAQCRecord.status == status)
    
    qaqc_records = query.order_by(QAQCRecord.created_at.desc()).all()
    return jsonify([record.to_dict() for record in qaqc_records])

@qaqc_bp.route('/qaqc-records', methods=['POST'])
def create_qaqc_record():
    """Create a new QA/QC record"""
    try:
        data = request.json
        
        # Validate drill hole exists
        drill_hole = DrillHole.query.get(data['drill_hole_id'])
        if not drill_hole:
            return jsonify({'error': 'Drill hole not found'}), 404
        
        # Calculate variance if both expected and actual values are provided
        variance = None
        if data.get('expected_value') is not None and data.get('actual_value') is not None:
            expected = data['expected_value']
            actual = data['actual_value']
            if expected != 0:
                variance = ((actual - expected) / expected) * 100
            else:
                variance = 0 if actual == 0 else float('inf')
        
        # Determine status based on variance (if applicable)
        status = data.get('status', 'pass')
        if variance is not None:
            if abs(variance) <= 5:  # Within 5% tolerance
                status = 'pass'
            elif abs(variance) <= 10:  # Within 10% tolerance
                status = 'warning'
            else:
                status = 'fail'
        
        qaqc_record = QAQCRecord(
            drill_hole_id=data['drill_hole_id'],
            record_type=data['record_type'],
            sample_id=data.get('sample_id'),
            from_depth=data.get('from_depth'),
            to_depth=data.get('to_depth'),
            expected_value=data.get('expected_value'),
            actual_value=data.get('actual_value'),
            variance=variance,
            status=status,
            comments=data.get('comments')
        )
        
        db.session.add(qaqc_record)
        db.session.commit()
        return jsonify(qaqc_record.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@qaqc_bp.route('/qaqc-records/<int:record_id>', methods=['GET'])
def get_qaqc_record(record_id):
    """Get a specific QA/QC record"""
    qaqc_record = QAQCRecord.query.get_or_404(record_id)
    return jsonify(qaqc_record.to_dict())

@qaqc_bp.route('/qaqc-records/<int:record_id>', methods=['PUT'])
def update_qaqc_record(record_id):
    """Update a QA/QC record"""
    try:
        qaqc_record = QAQCRecord.query.get_or_404(record_id)
        data = request.json
        
        # Update fields if provided
        if 'record_type' in data:
            qaqc_record.record_type = data['record_type']
        if 'sample_id' in data:
            qaqc_record.sample_id = data['sample_id']
        if 'from_depth' in data:
            qaqc_record.from_depth = data['from_depth']
        if 'to_depth' in data:
            qaqc_record.to_depth = data['to_depth']
        if 'expected_value' in data:
            qaqc_record.expected_value = data['expected_value']
        if 'actual_value' in data:
            qaqc_record.actual_value = data['actual_value']
        if 'status' in data:
            qaqc_record.status = data['status']
        if 'comments' in data:
            qaqc_record.comments = data['comments']
        
        # Recalculate variance if both values are present
        if qaqc_record.expected_value is not None and qaqc_record.actual_value is not None:
            expected = qaqc_record.expected_value
            actual = qaqc_record.actual_value
            if expected != 0:
                qaqc_record.variance = ((actual - expected) / expected) * 100
            else:
                qaqc_record.variance = 0 if actual == 0 else float('inf')
        
        db.session.commit()
        return jsonify(qaqc_record.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@qaqc_bp.route('/qaqc-records/<int:record_id>', methods=['DELETE'])
def delete_qaqc_record(record_id):
    """Delete a QA/QC record"""
    try:
        qaqc_record = QAQCRecord.query.get_or_404(record_id)
        db.session.delete(qaqc_record)
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@qaqc_bp.route('/qaqc-records/statistics', methods=['GET'])
def get_qaqc_statistics():
    """Get QA/QC statistics"""
    drill_hole_id = request.args.get('drill_hole_id', type=int)
    
    query = QAQCRecord.query
    if drill_hole_id:
        query = query.filter(QAQCRecord.drill_hole_id == drill_hole_id)
    
    all_records = query.all()
    
    if not all_records:
        return jsonify({
            'total_records': 0,
            'pass_rate': 0,
            'warning_rate': 0,
            'fail_rate': 0,
            'by_type': {}
        })
    
    total_records = len(all_records)
    pass_count = len([r for r in all_records if r.status == 'pass'])
    warning_count = len([r for r in all_records if r.status == 'warning'])
    fail_count = len([r for r in all_records if r.status == 'fail'])
    
    # Statistics by record type
    by_type = {}
    for record in all_records:
        if record.record_type not in by_type:
            by_type[record.record_type] = {'total': 0, 'pass': 0, 'warning': 0, 'fail': 0}
        
        by_type[record.record_type]['total'] += 1
        by_type[record.record_type][record.status] += 1
    
    # Calculate rates for each type
    for record_type in by_type:
        total = by_type[record_type]['total']
        if total > 0:
            by_type[record_type]['pass_rate'] = round((by_type[record_type]['pass'] / total) * 100, 2)
            by_type[record_type]['warning_rate'] = round((by_type[record_type]['warning'] / total) * 100, 2)
            by_type[record_type]['fail_rate'] = round((by_type[record_type]['fail'] / total) * 100, 2)
    
    statistics = {
        'total_records': total_records,
        'pass_count': pass_count,
        'warning_count': warning_count,
        'fail_count': fail_count,
        'pass_rate': round((pass_count / total_records) * 100, 2),
        'warning_rate': round((warning_count / total_records) * 100, 2),
        'fail_rate': round((fail_count / total_records) * 100, 2),
        'by_type': by_type
    }
    
    return jsonify(statistics)

