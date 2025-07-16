import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'change_this')
    SQLALCHEMY_DATABASE_URI = os.getenv(
        'DATABASE_URL',
        'postgresql://user:pass@localhost/money_transfer'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False