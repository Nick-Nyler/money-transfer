# backend/extensions.py

from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
from flask_socketio import SocketIO

db = SQLAlchemy()
ma = Marshmallow()
socketio = SocketIO(
    async_mode="threading",
    cors_allowed_origins=[
        "http://localhost:5173",
        "https://money-transfer-d.onrender.com"
    ]
)
