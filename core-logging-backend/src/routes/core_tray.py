from flask import Blueprint, jsonify, request
from src.models.user import CoreTray, DrillHole, db
from datetime import datetime

core_tray_bp = Blueprint('core_tray', __name__)

@core_tray_bp.route('/core-trays', methods=['GET'])
def get_core_trays():
    """Get all core trays with optional filtering"""
    drill_hole_id = request.args.get('drill_hole_id', type=int)
    status = request.args.get('status')
    location = request.args.get('location')
    
    query = CoreTray.query
    if drill_hole_id:
        query = query.filter(CoreTray.drill_hole_id == drill_hole_id)
    if status:
        query = query.filter(CoreTray.status == status)
    if location:
        query = query.filter(CoreTray.location.ilike(f'%{location}%'))
    
    core_trays = query.order_by(CoreTray.from_depth).all()
    return jsonify([core_tray.to_dict() for core_tray in core_trays])

@core_tray_bp.route('/core-trays', methods=['POST'])
def create_core_tray():
    """Create a new core tray"""
    try:
        data = request.json
        
        # Validate drill hole exists
        drill_hole = DrillHole.query.get(data['drill_hole_id'])
        if not drill_hole:
            return jsonify({'error': 'Drill hole not found'}), 404
        
        core_tray = CoreTray(
            tray_id=data['tray_id'],
            drill_hole_id=data['drill_hole_id'],
            from_depth=data['from_depth'],
            to_depth=data['to_depth'],
            barcode=data.get('barcode'),
            rfid_tag=data.get('rfid_tag'),
            photo_path=data.get('photo_path'),
            location=data.get('location', 'Core Shed'),
            status=data.get('status', 'active')
        )
        
        db.session.add(core_tray)
        db.session.commit()
        return jsonify(core_tray.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@core_tray_bp.route('/core-trays/<int:core_tray_id>', methods=['GET'])
def get_core_tray(core_tray_id):
    """Get a specific core tray"""
    core_tray = CoreTray.query.get_or_404(core_tray_id)
    return jsonify(core_tray.to_dict())

@core_tray_bp.route('/core-trays/by-barcode/<barcode>', methods=['GET'])
def get_core_tray_by_barcode(barcode):
    """Get a core tray by barcode"""
    core_tray = CoreTray.query.filter_by(barcode=barcode).first()
    if not core_tray:
        return jsonify({'error': 'Core tray not found'}), 404
    return jsonify(core_tray.to_dict())

@core_tray_bp.route('/core-trays/by-rfid/<rfid_tag>', methods=['GET'])
def get_core_tray_by_rfid(rfid_tag):
    """Get a core tray by RFID tag"""
    core_tray = CoreTray.query.filter_by(rfid_tag=rfid_tag).first()
    if not core_tray:
        return jsonify({'error': 'Core tray not found'}), 404
    return jsonify(core_tray.to_dict())

@core_tray_bp.route('/core-trays/<int:core_tray_id>', methods=['PUT'])
def update_core_tray(core_tray_id):
    """Update a core tray"""
    try:
        core_tray = CoreTray.query.get_or_404(core_tray_id)
        data = request.json
        
        # Update fields if provided
        if 'tray_id' in data:
            core_tray.tray_id = data['tray_id']
        if 'from_depth' in data:
            core_tray.from_depth = data['from_depth']
        if 'to_depth' in data:
            core_tray.to_depth = data['to_depth']
        if 'barcode' in data:
            core_tray.barcode = data['barcode']
        if 'rfid_tag' in data:
            core_tray.rfid_tag = data['rfid_tag']
        if 'photo_path' in data:
            core_tray.photo_path = data['photo_path']
        if 'location' in data:
            core_tray.location = data['location']
        if 'status' in data:
            core_tray.status = data['status']
        
        core_tray.updated_at = datetime.utcnow()
        db.session.commit()
        return jsonify(core_tray.to_dict())
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@core_tray_bp.route('/core-trays/<int:core_tray_id>', methods=['DELETE'])
def delete_core_tray(core_tray_id):
    """Delete a core tray"""
    try:
        core_tray = CoreTray.query.get_or_404(core_tray_id)
        db.session.delete(core_tray)
        db.session.commit()
        return '', 204
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@core_tray_bp.route('/core-trays/<int:core_tray_id>/update-location', methods=['POST'])
def update_tray_location(core_tray_id):
    """Update the location of a core tray"""
    try:
        core_tray = CoreTray.query.get_or_404(core_tray_id)
        data = request.json
        
        if 'location' not in data:
            return jsonify({'error': 'Location is required'}), 400
        
        old_location = core_tray.location
        core_tray.location = data['location']
        core_tray.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'core_tray_id': core_tray.id,
            'tray_id': core_tray.tray_id,
            'old_location': old_location,
            'new_location': core_tray.location,
            'message': 'Location updated successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

