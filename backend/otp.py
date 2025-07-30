import random
import smtplib
import datetime
import os
from dotenv import load_dotenv
from flask import current_app
from email.mime.text import MIMEText

# Load .env variables
load_dotenv()

# In-memory temporary store
otp_store = {}

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(email, otp):
    sender_email = os.getenv("EMAIL_ADDRESS", "").strip()
    sender_password = os.getenv("EMAIL_PASSWORD", "").strip()

    print(f"EMAIL_ADDRESS loaded: {repr(sender_email)}")
    print(f"EMAIL_PASSWORD present: {bool(sender_password)}")

    if not sender_email or not sender_password:
        raise RuntimeError("Missing or invalid email credentials from environment.")

    msg = MIMEText(f"Your login OTP is: {otp}")
    msg['Subject'] = "MoneyApp Login OTP"
    msg['From'] = sender_email
    msg['To'] = email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, [email], msg.as_string())
    except Exception as e:
        raise RuntimeError(f"Failed to send OTP email: {str(e)}")

def store_otp(user_id, otp):
    otp_store[user_id] = {
        'otp': otp,
        'expires_at': datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
    }

def validate_otp(user_id, otp):
    record = otp_store.get(user_id)
    if not record or record['otp'] != otp:
        return False
    if datetime.datetime.utcnow() > record['expires_at']:
        return False
    del otp_store[user_id]  # One-time use
    return True
