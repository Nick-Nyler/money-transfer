# backend/services/mpesa_service.py
import requests
from requests.auth import HTTPBasicAuth
import base64, datetime, json
from config import Config

class MpesaService:
    @staticmethod
    def _normalize_phone(phone: str) -> str:
        p = phone.strip()
        # Strip leading + if present
        if p.startswith('+'):
            p = p[1:]
        # Convert 07xxxx to 2547xxxx
        if p.startswith('07'):
            p = '254' + p[1:]
        return p

    @staticmethod
    def get_access_token():
        url = (
            'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
            if Config.MPESA_ENVIRONMENT == 'production'
            else 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        )
        res = requests.get(url, auth=HTTPBasicAuth(
            Config.MPESA_CONSUMER_KEY, Config.MPESA_CONSUMER_SECRET
        ))
        res.raise_for_status()
        return res.json().get('access_token')

    @staticmethod
    def lipa_na_mpesa(phone_number, amount, account_reference, transaction_desc):
        phone = MpesaService._normalize_phone(phone_number)

        token = MpesaService.get_access_token()
        url = (
            'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
            if Config.MPESA_ENVIRONMENT == 'production'
            else 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        )

        timestamp = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(
            f"{Config.MPESA_SHORTCODE}{Config.MPESA_PASSKEY}{timestamp}".encode()
        ).decode()

        payload = {
            "BusinessShortCode": Config.MPESA_SHORTCODE,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": Config.MPESA_SHORTCODE,
            "PhoneNumber": phone,
            "CallBackURL": Config.MPESA_CALLBACK_URL,
            "AccountReference": str(account_reference),
            "TransactionDesc": transaction_desc
        }

        # dump to console so you can debug
        print("STK PUSH PAYLOAD →", json.dumps(payload, indent=2))

        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        res = requests.post(url, json=payload, headers=headers)
        res.raise_for_status()
        return res.json()
