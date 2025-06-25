from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='geologist')  # geologist, supervisor, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<User {self.username}>'

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class DrillHole(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hole_id = db.Column(db.String(50), unique=True, nullable=False)
    project_name = db.Column(db.String(100), nullable=False)
    location_x = db.Column(db.Float)  # Easting coordinate
    location_y = db.Column(db.Float)  # Northing coordinate
    elevation = db.Column(db.Float)
    azimuth = db.Column(db.Float)  # Drill hole azimuth
    dip = db.Column(db.Float)  # Drill hole dip
    total_depth = db.Column(db.Float)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    drilling_company = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    core_runs = db.relationship('CoreRun', backref='drill_hole', lazy=True, cascade='all, delete-orphan')
    core_trays = db.relationship('CoreTray', backref='drill_hole', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<DrillHole {self.hole_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'hole_id': self.hole_id,
            'project_name': self.project_name,
            'location_x': self.location_x,
            'location_y': self.location_y,
            'elevation': self.elevation,
            'azimuth': self.azimuth,
            'dip': self.dip,
            'total_depth': self.total_depth,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'drilling_company': self.drilling_company,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class CoreRun(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    drill_hole_id = db.Column(db.Integer, db.ForeignKey('drill_hole.id'), nullable=False)
    run_number = db.Column(db.Integer, nullable=False)
    from_depth = db.Column(db.Float, nullable=False)
    to_depth = db.Column(db.Float, nullable=False)
    run_length = db.Column(db.Float, nullable=False)  # Calculated: to_depth - from_depth
    core_recovered_length = db.Column(db.Float, nullable=False)
    total_core_recovery = db.Column(db.Float, nullable=False)  # TCR percentage
    rqd_length = db.Column(db.Float, default=0.0)  # Length of pieces >= 10cm
    rqd_percentage = db.Column(db.Float, default=0.0)  # RQD percentage
    drilling_date = db.Column(db.Date)
    logged_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    # A core run can have multiple core intervals
    core_intervals = db.relationship('CoreInterval', backref='core_run', lazy=True, cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<CoreRun {self.drill_hole.hole_id}-{self.run_number}>'

    def to_dict(self):
        return {
            'id': self.id,
            'drill_hole_id': self.drill_hole_id,
            'run_number': self.run_number,
            'from_depth': self.from_depth,
            'to_depth': self.to_depth,
            'run_length': self.run_length,
            'core_recovered_length': self.core_recovered_length,
            'total_core_recovery': self.total_core_recovery,
            'rqd_length': self.rqd_length,
            'rqd_percentage': self.rqd_percentage,
            'drilling_date': self.drilling_date.isoformat() if self.drilling_date else None,
            'logged_by': self.logged_by,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CoreTray(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tray_id = db.Column(db.String(50), unique=True, nullable=False)
    drill_hole_id = db.Column(db.Integer, db.ForeignKey('drill_hole.id'), nullable=False)
    from_depth = db.Column(db.Float, nullable=False)
    to_depth = db.Column(db.Float, nullable=False)
    barcode = db.Column(db.String(100))
    rfid_tag = db.Column(db.String(100))
    photo_path = db.Column(db.String(255))
    location = db.Column(db.String(100))  
    status = db.Column(db.String(50), default='active')  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<CoreTray {self.tray_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'tray_id': self.tray_id,
            'drill_hole_id': self.drill_hole_id,
            'from_depth': self.from_depth,
            'to_depth': self.to_depth,
            'barcode': self.barcode,
            'rfid_tag': self.rfid_tag,
            'photo_path': self.photo_path,
            'location': self.location,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class CoreInterval(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    core_run_id = db.Column(db.Integer, db.ForeignKey('core_run.id'), nullable=False)
    from_depth = db.Column(db.Float, nullable=False)
    to_depth = db.Column(db.Float, nullable=False)
    interval_length = db.Column(db.Float, nullable=False)
    
    # Geological data
    lithology = db.Column(db.String(100))
    lithology_code = db.Column(db.String(20))
    rock_type = db.Column(db.String(100))
    color = db.Column(db.String(50))
    grain_size = db.Column(db.String(50))
    texture = db.Column(db.String(100))
    
    # Alteration data
    alteration_type = db.Column(db.String(100))
    alteration_intensity = db.Column(db.String(50))  
    alteration_style = db.Column(db.String(50))  
    
    # Mineralization data
    mineralization_type = db.Column(db.String(100))
    mineralization_style = db.Column(db.String(50))  
    mineral_abundance = db.Column(db.String(50))  
    ore_minerals = db.Column(db.Text)  
    
    # Structural data
    fracture_frequency = db.Column(db.Integer)  
    fracture_orientation = db.Column(db.String(100))
    bedding_orientation = db.Column(db.String(100))
    foliation_orientation = db.Column(db.String(100))
    structural_features = db.Column(db.Text)  
    
    # Geotechnical data
    rock_strength = db.Column(db.String(50)) 
    weathering_grade = db.Column(db.String(50))
    
    # Quality and metadata
    recovery_percentage = db.Column(db.Float)
    rqd_contribution = db.Column(db.Float, default=0.0)  
    comments = db.Column(db.Text)
    logged_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    logged_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<CoreInterval {self.from_depth}-{self.to_depth}m>'

    def to_dict(self):
        return {
            'id': self.id,
            'core_run_id': self.core_run_id,
            'from_depth': self.from_depth,
            'to_depth': self.to_depth,
            'interval_length': self.interval_length,
            'lithology': self.lithology,
            'lithology_code': self.lithology_code,
            'rock_type': self.rock_type,
            'color': self.color,
            'grain_size': self.grain_size,
            'texture': self.texture,
            'alteration_type': self.alteration_type,
            'alteration_intensity': self.alteration_intensity,
            'alteration_style': self.alteration_style,
            'mineralization_type': self.mineralization_type,
            'mineralization_style': self.mineralization_style,
            'mineral_abundance': self.mineral_abundance,
            'ore_minerals': self.ore_minerals,
            'fracture_frequency': self.fracture_frequency,
            'fracture_orientation': self.fracture_orientation,
            'bedding_orientation': self.bedding_orientation,
            'foliation_orientation': self.foliation_orientation,
            'structural_features': self.structural_features,
            'rock_strength': self.rock_strength,
            'weathering_grade': self.weathering_grade,
            'recovery_percentage': self.recovery_percentage,
            'rqd_contribution': self.rqd_contribution,
            'comments': self.comments,
            'logged_by': self.logged_by,
            'logged_date': self.logged_date.isoformat() if self.logged_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class QAQCRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    drill_hole_id = db.Column(db.Integer, db.ForeignKey('drill_hole.id'), nullable=False)
    record_type = db.Column(db.String(50), nullable=False)  
    sample_id = db.Column(db.String(100))
    from_depth = db.Column(db.Float)
    to_depth = db.Column(db.Float)
    expected_value = db.Column(db.Float)
    actual_value = db.Column(db.Float)
    variance = db.Column(db.Float)
    status = db.Column(db.String(50)) 
    comments = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<QAQCRecord {self.record_type}-{self.sample_id}>'

    def to_dict(self):
        return {
            'id': self.id,
            'drill_hole_id': self.drill_hole_id,
            'record_type': self.record_type,
            'sample_id': self.sample_id,
            'from_depth': self.from_depth,
            'to_depth': self.to_depth,
            'expected_value': self.expected_value,
            'actual_value': self.actual_value,
            'variance': self.variance,
            'status': self.status,
            'comments': self.comments,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }



class QAQCItem(db.Model):
    """QA/QC tracking items for quality assurance and control"""
    __tablename__ = 'qaqc_items'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    type = db.Column(db.String(50), nullable=False) 
    priority = db.Column(db.String(20), default='medium')  
    status = db.Column(db.String(30), default='open')  
    
    # Assignment and tracking
    assigned_to = db.Column(db.String(100))
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'))
    drill_hole = db.Column(db.String(50))
    core_run = db.Column(db.String(50))
    
    # Dates
    created_date = db.Column(db.Date, default=datetime.utcnow().date)
    due_date = db.Column(db.Date)
    resolved_date = db.Column(db.Date)
    
    # Additional tracking
    comments_count = db.Column(db.Integer, default=0)
    attachments_count = db.Column(db.Integer, default=0)
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<QAQCItem {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'type': self.type,
            'priority': self.priority,
            'status': self.status,
            'assigned_to': self.assigned_to,
            'drill_hole': self.drill_hole,
            'core_run': self.core_run,
            'created_date': self.created_date.isoformat() if self.created_date else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'resolved_date': self.resolved_date.isoformat() if self.resolved_date else None,
            'comments_count': self.comments_count,
            'attachments_count': self.attachments_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

