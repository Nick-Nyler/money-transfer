# Money Transfer App

**TL;DR:** Build a fast, secure, low‑fee wallet app that levels up financial inclusion. 🚀

## 🧩 Project Overview

Money transfers should be painless and cheap. We’re tackling high fees, clunky onboarding, and bank‑only gatekeeping so everyone, everywhere, can send cash without headache or hefty charges.

## 🚧 Key Challenges

1. **High transaction fees** – Keep fees under 1% (min \$0.50) to stay wallet‑friendly.
2. **Onboarding friction** – Streamline sign‑ups: basic info + KYC only when needed.
3. **Unbanked access** – Wallet top‑ups via MPesa (or local rails) for non‑bank users.
4. **Security & fraud** – JWT auth + transaction limits + basic rate‑limits.
5. **Interoperability** – API pluggable for future cross‑border rails, crypto, or other providers.

## 🎯 MVP Features

### For Users

* **Sign Up / Login** (email + password + JWT)
* **Profile**: view & update personal details
* **Wallet**: view balance + add funds
* **Beneficiaries**: add/delete contacts
* **Send Money**: pick beneficiary, send, see fee & balance update
* **Transaction History**: list of past transfers

### For Admins

* **User CRUD**: view/edit/delete any account
* **Transactions Dashboard**: filter, export, profit trends
* **Analytics**: global wallet stats & fee revenue insights

## 🛠️ Tech Stack

* **Backend:** Flask
* **Database:** PostgreSQL + SQLAlchemy
* **Auth:** JWT tokens
* **Frontend:** React + Redux Toolkit
* **Styling:** Regular CSS (or your fave)
* **Wireframes:** Figma mobile-first
* **Tests:** Minitest (Flask) & Jest (React)

## ⚙️ Getting Started

1. **Clone the repo**

   ```bash
   git clone https://github.com/YourOrg/Money-Transfer-App.git
   cd Money-Transfer-App
   ```

2. **Backend setup**

   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   # configure DATABASE_URL in config.py or env var
   python app.py  # spins up on http://localhost:5000
   ```

3. **Frontend setup**

   ```bash
   cd ../frontend
   npm install
   npm run dev  # or npm start
   ```

4. **.env files**

   * `frontend/.env.development` → `VITE_API_URL=http://localhost:5000`
   * `frontend/.env.production` → `VITE_API_URL=https://api.yourdomain.com`

## 📁 File Structure

```
Money-Transfer-App/
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── admin.py
│   ├── config.py
│   ├── models.py
│   ├── routes.py
│   └── requirements.txt
└── frontend/
    ├── .env.development
    ├── .env.production
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── api.jsx        # API_URL setup
        ├── App.jsx
        ├── index.jsx
        ├── app/store.js
        ├── features/...   # redux slices
        └── components/...
```

## ✅ Testing

* **Backend**: run Minitest in `backend/tests/`
* **Frontend**: run `npm test` for Jest flows

## 🚀 Next Steps

* 2FA, advanced fraud detection, currency conversion, cross‑border rails, mobile APK wrapper.

---

*Keep it lean. Keep it mean. Let’s make money moves without the BS.*
## test details 
```bash
 # Demo Users
        admin_user = User(
            email="admin@example.com",
            password_hash=generate_password_hash("admin123"),
            first_name="Admin",
            last_name="User",
            phone="+254712345678",
            role="admin",
            created_at=datetime.datetime.utcnow()
        )
        john_doe = User(
            email="john@example.com",
            password_hash=generate_password_hash("password123"),
            first_name="John",
            last_name="Doe",
            phone="+254723456789",
            role="user",
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=10)
        )
        ```