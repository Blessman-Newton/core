import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory

from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.drill_hole import drill_hole_bp
from src.routes.core_run import core_run_bp
from src.routes.core_tray import core_tray_bp
from src.routes.core_interval import core_interval_bp
from src.routes.qaqc import qaqc_bp
from src.routes.analytics import analytics_bp
from src.routes.export import export_bp


app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'asdf#FGSgvasgf$5$WGT'

# Enable CORS for all routes
CORS(app)

# Register all blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(drill_hole_bp, url_prefix='/api')
app.register_blueprint(core_run_bp, url_prefix='/api')
app.register_blueprint(core_tray_bp, url_prefix='/api')
app.register_blueprint(core_interval_bp, url_prefix='/api')
app.register_blueprint(qaqc_bp, url_prefix='/api')
app.register_blueprint(analytics_bp, url_prefix='/api')
app.register_blueprint(export_bp)

# Database configuration
# app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_DATABASE_URI'] = "mysql+pymysql://root:New%40bless123@localhost:3306/core_logging_db"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
            return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return {'status': 'healthy', 'message': 'Core Logging API is running'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
