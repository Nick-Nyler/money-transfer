# backend/wsgi.py

from app import create_app, socketio
from database.db_init import init_db

# Create Flask app
app = create_app()

# Ensure DB schema is created before serving traffic
with app.app_context():
    init_db(app)

# Expose a Socket‑IO–wrapped WSGI app for Gunicorn
application = socketio.WSGIApp(app)
