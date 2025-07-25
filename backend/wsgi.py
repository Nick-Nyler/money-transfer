# backend/wsgi.py

import os
from app import create_app
from extensions import socketio
from database.db_init import init_db

# Create & configure the Flask app
app = create_app()

# Ensure the database schema exists before serving
with app.app_context():
    init_db(app)

# Expose the Flask app to Gunicorn (use this name in your Render start command)
application = app
