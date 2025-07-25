# backend/wsgi.py

import os
from app import create_app
from database.db_init import init_db

# Create & configure the Flask app
application = create_app()

# Ensure the database schema exists before serving
with application.app_context():
    init_db(application)
