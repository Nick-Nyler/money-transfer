
# 💸 MoneyTransfer — Flask + React + Safaricom M‑Pesa STK Push

Wallet top‑ups via M‑Pesa STK Push.  
**Backend:** Flask / SQLAlchemy | **Frontend:** React / Redux Toolkit

---

## 🧰 Requirements

- Python 3.10+
- Node 18+
- Safaricom Daraja (Sandbox or Prod) credentials:
  - Consumer Key / Secret
  - ShortCode
  - Passkey
- Public HTTPS tunnel for callbacks (we’ll use **Cloudflare Tunnel**)
- SQLite is bundled; switch to Postgres/MySQL if you want

---

## 🔑 Demo / Test Accounts

> These are seeded automatically on first backend run.  
> Change them or remove in `app.py` seeding logic.

**User (normal):**

| Email               | Password   | Phone (sandbox) |
|---------------------|------------|------------------|
| demo@example.com    | password   | 0740000000       |

**Admin:**

| Email               | Password   |
|---------------------|------------|
| admin@example.com   | adminpass  |

> ⚠️ If you changed seeds, update this section to reflect reality.

---

## 🗂 Repo Structure (key bits)

```

backend/
app.py
config.py
extensions.py
models/
wallet.py
transaction.py
controllers/
wallet\_controller.py
routes/
wallet\_routes.py
auth\_routes.py
services/
mpesa\_service.py
schemas/
wallet\_schema.py
frontend/
src/
api/
index.js
features/
wallet/walletSlice.js
transactions/transactionsSlice.js
components/
AddFunds.jsx
common/WalletCard.jsx
App.jsx
index.jsx

````

---

## 🚀 Setup

### 1. Clone

```bash
git clone <your-repo-url> money-transfer
cd money-transfer
````

### 2. Backend Install

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Install

```bash
cd ../frontend
npm install    # or pnpm/yarn
```

---

## ⚙️ Environment Variables

Create `backend/.env` (or set in your shell):

```env
FLASK_ENV=development
SECRET_KEY=super-secret-key

SQLALCHEMY_DATABASE_URI=sqlite:///money.db

# M-Pesa
MPESA_ENVIRONMENT=sandbox
MPESA_CONSUMER_KEY=xxxxxxxxxxxxxxxx
MPESA_CONSUMER_SECRET=xxxxxxxxxxxxxxxx
MPESA_SHORTCODE=174379
MPESA_PASSKEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MPESA_CALLBACK_URL=https://<your-tunnel>/api/wallet/mpesa/callback
```

Frontend (`frontend/.env` – optional, if you need to override base URL):

```env
VITE_API_BASE=http://localhost:5000
```

> **Important:** `MPESA_CALLBACK_URL` must be reachable from Safaricom (public tunnel). Update it each time the tunnel URL changes.

---

## ☁️ Cloudflare Tunnel (cloudflared)

### Install (Ubuntu/Debian)

```bash
# 1. Import Cloudflare GPG key
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
  | sudo gpg --dearmor -o /usr/share/keyrings/cloudflare-main.gpg

# 2. Add repo (Ubuntu 22.04 "jammy" – change if needed)
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main" \
  | sudo tee /etc/apt/sources.list.d/cloudflared.list

# 3. Install
sudo apt update
sudo apt install cloudflared
```

*Alternative: download the .deb from the GitHub releases and `sudo dpkg -i`.*

### Run the tunnel

```bash
cloudflared tunnel --url http://localhost:5000
```

It prints something like:

```
Your quick Tunnel has been created!
https://purple-otter-giggle.trycloudflare.com
```

Put that into `MPESA_CALLBACK_URL`:

```
MPESA_CALLBACK_URL=https://purple-otter-giggle.trycloudflare.com/api/wallet/mpesa/callback
```

Restart backend.

> Quick tunnels are ephemeral. If it changes, update the env and restart.

---

## 🏃 Run It

### Backend

```bash
cd backend
source venv/bin/activate
python app.py
```

Runs at `http://127.0.0.1:5000`.
First boot: creates DB + seeds demo/admin.

### Frontend

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`.

---

## 💸 M‑Pesa STK Push Flow

1. User clicks **Add Funds** → enters amount & phone.
2. Frontend `POST /api/wallet/add-funds`.
3. Backend calls Safaricom `/mpesa/stkpush/v1/processrequest`, stores **pending** `Transaction` with `CheckoutRequestID`.
4. Safaricom hits your `MPESA_CALLBACK_URL` (`/api/wallet/mpesa/callback`) with result.
5. Backend sets `Transaction.status` to `completed`/`failed` and credits wallet (if success).
6. Frontend polls `/api/wallet/tx-status/<CheckoutRequestID>` every 3 seconds (or detects a balance bump) → stops spinner and displays success.

---

## 🔌 Key Endpoints

| Method | URL                                  | Auth | Purpose                                    |
| ------ | ------------------------------------ | ---- | ------------------------------------------ |
| POST   | /api/auth/login                      | no   | Get JWT                                    |
| GET    | /api/wallet/balance                  | yes  | Wallet info                                |
| POST   | /api/wallet/add-funds                | yes  | Initiate STK Push `{amount, phone_number}` |
| POST   | /api/wallet/mpesa/callback           | no   | Daraja callback                            |
| GET    | /api/wallet/tx-status/\:checkout\_id | yes  | Poll tx status                             |
| GET    | /api/wallet/statement                | yes  | CSV of transactions                        |

---

## 🛠 Troubleshooting

### Spinner never stops

* Open DevTools → Network. Do you see repeated `GET /api/wallet/tx-status/<id>`?

  * **No?** Your `api.getTxnStatus` path is wrong / polling didn’t start.
* Check Redux: is `pendingCheckoutId` set?
* Balance increased but spinner still spins?

  * Ensure fallback cast: `Number(wallet.balance)`
* Add console logs (already included in `AddFunds.jsx` I gave you).

### Callback hits, but wallet not credited

* Check backend logs for `POST /api/wallet/mpesa/callback`.
* Make sure `handle_mpesa_callback` updates transaction + wallet and commits.

### 401 on `/tx-status`

* Route is protected. Frontend must send JWT.

### White page in React

* Open console → fix syntax error (common culprit: typo in a hook line).
* Remove `<React.StrictMode>` in `src/index.jsx` to avoid double useEffect calls.

### Cloudflared errors / permissions

* Don’t use `npm i -g cloudflared`.
* Use the deb or apt repo method above.
* If you see `NO_PUBKEY`, you didn’t import the right gpg key. Re-run the curl/gpg commands.

---

## 🧪 Quick Manual Test (Sandbox)

* Use 2547xxxxxxxx as phone (or 07xxxxxxxx); sandbox always “approves” if you simulate in Daraja portal.
* Watch backend logs:

  * `STK PUSH PAYLOAD → {...}`
  * `POST /api/wallet/mpesa/callback` should appear after approval.
* Check DB: `transaction.status` goes to `completed`, `wallet.balance` increases.

---

## 🔒 Production Tips

* Use gunicorn/uwsgi + nginx for Flask.
* Use a named Cloudflare tunnel or host behind a proper reverse proxy/domain.
* Move secrets to Vault/Env vars in CI/CD.
* Add idempotency keys; Daraja can retry callbacks.

---

## 📄 License

MIT (or whatever you choose).

---

## 🙋 Need help?

Ping with:

* `/api/wallet/add-funds` response JSON
* `/api/wallet/tx-status/<id>` response JSON
* Console + Network logs

and I’ll point out the bug in two lines.

Happy shipping! 🚀

```

---
```
