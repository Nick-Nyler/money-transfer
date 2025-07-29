from app import create_app
from database.db_init import init_db  # your init logic

# Create app
app = create_app()

# Ensure DB schema is created before serving traffic
with app.app_context():
    init_db(app)

# Gunicorn will serve app