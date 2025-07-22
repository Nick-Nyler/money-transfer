# backend/services/mpesa_service.py
import requests
from requests.auth import HTTPBasicAuth
import base64
import datetime
import json
from config import Config


class MpesaService:
    @staticmethod
    def _normalize_phone(phone: str) -> str:
        """
        Ensure phone is in 2547xxxxxxx format.
        Accepts: +2547xxxx, 07xxxx, 2547xxxx
        """
        p = phone.strip()
        if p.startswith('+'):
            p = p[1:]
        if p.startswith('0'):
            p = '254' + p[1:]
        return p

    @staticmethod
    def _timestamp() -> str:
        return datetime.datetime.now().strftime('%Y%m%d%H%M%S')

    @staticmethod
    def _password(shortcode: str, passkey: str, timestamp: str) -> str:
        raw = f"{shortcode}{passkey}{timestamp}"
        return base64.b64encode(raw.encode()).decode()

    @staticmethod
    def _base_url(path: str) -> str:
        if getattr(Config, "MPESA_ENVIRONMENT", "sandbox") == "production":
            return f"https://api.safaricom.co.ke{path}"
        return f"https://sandbox.safaricom.co.ke{path}"

    @staticmethod
    def get_access_token() -> str:
        url = MpesaService._base_url("/oauth/v1/generate?grant_type=client_credentials")
        res = requests.get(
            url,
            auth=HTTPBasicAuth(Config.MPESA_CONSUMER_KEY, Config.MPESA_CONSUMER_SECRET)
        )
        res.raise_for_status()
        return res.json().get("access_token")

    @classmethod
    def lipa_na_mpesa(cls, phone_number: str, amount: int, account_reference, transaction_desc: str):
        """
        Initiate STK Push.
        Returns minimal dict (CheckoutRequestID etc.) for frontend tracking.
        """
        phone = cls._normalize_phone(phone_number)
        timestamp = cls._timestamp()
        password = cls._password(Config.MPESA_SHORTCODE, Config.MPESA_PASSKEY, timestamp)
        token = cls.get_access_token()

        url = cls._base_url("/mpesa/stkpush/v1/processrequest")

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

        # For debugging
        print("STK PUSH PAYLOAD →", json.dumps(payload, indent=2))

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        res = requests.post(url, json=payload, headers=headers)
        res.raise_for_status()
        data = res.json()

        # Return only what we need
        return {
            "MerchantRequestID": data.get("MerchantRequestID"),
            "CheckoutRequestID": data.get("CheckoutRequestID"),
            "ResponseCode": data.get("ResponseCode"),
            "ResponseDescription": data.get("ResponseDescription"),
            "CustomerMessage": data.get("CustomerMessage"),
        }
