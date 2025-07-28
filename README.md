# 💸 MoneyTransfer — Flask + React + Safaricom M‑Pesa STK Push

**TL;DR:** Build a fast, secure, low‑fee wallet app that levels up financial inclusion. 🚀  
**Backend:** Flask / SQLAlchemy | **Frontend:** React / Redux Toolkit

---

## 🧩 Project Overview

Money transfers should be painless and cheap. We’re tackling high fees, clunky onboarding, and bank‑only gatekeeping so everyone, everywhere, can send cash without headache or hefty charges.

---

## 🚧 Key Challenges

1. **High transaction fees** – Keep fees under 1% (min \$0.50) to stay wallet‑friendly.
2. **Onboarding friction** – Streamline sign‑ups: basic info + KYC only when needed.
3. **Unbanked access** – Wallet top‑ups via MPesa (or local rails) for non‑bank users.
4. **Security & fraud** – JWT auth + transaction limits + basic rate‑limits.
5. **Interoperability** – API pluggable for future cross‑border rails, crypto, or other providers.

---

## 🎯 MVP Features

### For Users

- **Sign Up / Login** (email + password + JWT)
- **Profile**: view & update personal details
- **Wallet**: view balance + add funds (via M‑Pesa STK Push)
- **Beneficiaries**: add/delete contacts
- **Send Money**: pick beneficiary, send, see fee & balance update
- **Transaction History**: list of past transfers

### For Admins

- **User CRUD**: view/edit/delete any account
- **Transactions Dashboard**: filter, export, profit trends
- **Analytics**: global wallet stats & fee revenue insights

---

## 🧰 Requirements

- Python 3.10+
- Node 18+
- PostgreSQL (or SQLite for quick starts)
- Safaricom Daraja credentials:
  - Consumer Key / Secret
  - ShortCode
  - Passkey
- Public HTTPS tunnel (e.g., Cloudflare Tunnel)

---

## 🗂 Repo Structure

Money-Transfer-App/
├── backend/
│ ├── app.py
│ ├── config.py
│ ├── extensions.py
│ ├── auth.py / routes.py / admin.py
│ ├── models/
│ │ ├── wallet.py
│ │ ├── transaction.py
│ ├── controllers/
│ │ └── wallet_controller.py
│ ├── services/
│ │ └── mpesa_service.py
│ ├── schemas/
│ │ └── wallet_schema.py
│ └── requirements.txt
└── frontend/
├── .env.*
├── public/
├── src/
│ ├── api/
│ │ └── index.js
│ ├── features/
│ │ ├── wallet/walletSlice.js
│ │ └── transactions/transactionsSlice.js
│ ├── components/
│ │ ├── AddFunds.jsx
│ │ └── common/WalletCard.jsx
│ ├── App.jsx
│ └── index.jsx


---

## 🔑 Demo / Test Accounts

Seeded automatically on first backend run.

**User:**

| Email            | Password   | Phone (sandbox) |
|------------------|------------|------------------|
| john@example.com | password123   | 0740000000       |

**Admin:**

| Email             | Password   |
|-------------------|------------|
| admin@example.com | admin123  |

> ⚠️ You can customize these in `app.py`'s seeding logic.

Example:
```python
admin_user = User(
    email="admin@example.com",
    password_hash=generate_password_hash("admin123"),
    first_name="Admin",
    last_name="User",
    phone="+254712345678",
    role="admin"
)
john_doe = User(
    email="john@example.com",
    password_hash=generate_password_hash("password123"),
    first_name="John",
    last_name="Doe",
    phone="+254723456789",
    role="user"
)
🚀 Setup
1. Clone the repo
git clone https://github.com/YourOrg/Money-Transfer-App.git
cd Money-Transfer-App

2. Backend Setup
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

Runs at http://localhost:5000.

3. Frontend Setup
cd ../frontend
npm install
npm run dev

Opens http://localhost:5173.

Environment Variables
backend/.env
FLASK_ENV=development
SECRET_KEY=super-secret-key

SQLALCHEMY_DATABASE_URI=sqlite:///money.db  # or postgres://...

# M-Pesa
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=xxxxxxxxxxxxxxxx
MPESA_CONSUMER_SECRET=xxxxxxxxxxxxxxxx
MPESA_SHORTCODE=174379
MPESA_PASSKEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MPESA_CALLBACK_URL=https://<your-tunnel>/api/wallet/mpesa/callback

frontend/.env
VITE_API_BASE=http://localhost:5000

Cloudflare Tunnel
cloudflared tunnel --url http://localhost:5000
Update MPESA_CALLBACK_URL to the printed tunnel URL, then restart the backend.

M‑Pesa STK Push Flow
User enters amount & phone → clicks Add Funds

Frontend POST /api/wallet/add-funds

Backend calls Safaricom STK Push, saves pending transaction

Safaricom calls /api/wallet/mpesa/callback on your tunnel URL

Backend confirms payment → credits wallet

Frontend polls /api/wallet/tx-status/<CheckoutRequestID> for result

 Key API Endpoints
Method	URL	Auth	Description
POST	/api/auth/login	                   ❌	Get JWT
GET	/api/wallet/balance	                ✅	Wallet info
POST	/api/wallet/add-funds	             ✅	Initiate M‑Pesa STK Push
POST	/api/wallet/mpesa/callback	          ❌	M‑Pesa Daraja callback
GET	/api/wallet/tx-status/:checkout_id	 ✅	Poll transaction status
GET	/api/wallet/statement	             ✅	Export CSV of transactions

 Testing
Backend: python -m unittest or pytest from /backend/tests/

Frontend: npm test — powered by Jest

Troubleshooting
Spinner stuck? Check polling path and Redux state

Wallet not updated? Confirm backend is receiving callback and committing

401 Unauthorized? Frontend is likely missing the JWT token

Cloudflared permission error? Reinstall via official .deb

 Production Tips
Use PostgreSQL + gunicorn + nginx for Flask

Use named Cloudflare tunnel or proper domain for callback URL

Store secrets in CI/CD vaults

Add idempotency for M‑Pesa callbacks

Next Steps
Add 2FA & advanced fraud checks

Enable cross-border payments

Mobile wrapper (e.g. via Cordova or Capacitor)

License
MIT