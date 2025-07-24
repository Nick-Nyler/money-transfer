import os

class Config:
    # ─── App & DB ─────────────────────────────────────────────────────────────────
    SECRET_KEY                = os.environ.get('SECRET_KEY') or 'a_very_secret_key_for_dev'
    SQLALCHEMY_DATABASE_URI   = os.environ.get('DATABASE_URL') or 'sqlite:///money_transfer.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ─── M‑Pesa Credentials & Settings ────────────────────────────────────────────
    MPESA_CONSUMER_KEY        = os.environ.get('MPESA_CONSUMER_KEY')
    MPESA_CONSUMER_SECRET     = os.environ.get('MPESA_CONSUMER_SECRET')
    MPESA_SHORTCODE           = os.environ.get('MPESA_SHORTCODE')
    MPESA_PASSKEY             = os.environ.get('MPESA_PASSKEY')
    MPESA_ENVIRONMENT         = os.environ.get('MPESA_ENVIRONMENT', 'sandbox')  # 'sandbox' or 'production'
    MPESA_CALLBACK_URL        = os.environ.get('MPESA_CALLBACK_URL') or 'https://vii-kb-edited-gained.trycloudflare.com/api/mpesa/callback'

