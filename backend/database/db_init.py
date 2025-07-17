from extensions import db
from models.user import User
from models.wallet import Wallet
from models.beneficiary import Beneficiary
from models.transaction import Transaction
from werkzeug.security import generate_password_hash
import datetime

def init_db(app):
  with app.app_context():
      db.create_all()
      print("Database tables created.")
      seed_data()

def seed_data():
  # Check if users already exist to prevent duplicate seeding
  if User.query.count() == 0:
      print("Seeding initial data...")

      # Demo Users
      admin_user = User(
          email="admin@example.com",
          password_hash=generate_password_hash("admin123"),
          first_name="Admin",
          last_name="User",
          phone="+254712345678",
          is_admin=True, # Use is_admin instead of role
          created_at=datetime.datetime.utcnow()
      )
      john_doe = User(
          email="john@example.com",
          password_hash=generate_password_hash("password123"),
          first_name="John",
          last_name="Doe",
          phone="+254723456789",
          is_admin=False, # Use is_admin instead of role
          created_at=datetime.datetime.utcnow() - datetime.timedelta(days=10)
      )
      db.session.add_all([admin_user, john_doe])
      db.session.commit()

      # Demo Wallets
      admin_wallet = Wallet(user_id=admin_user.id, balance=50000, currency="KES")
      john_wallet = Wallet(user_id=john_doe.id, balance=25000, currency="KES")
      db.session.add_all([admin_wallet, john_wallet])
      db.session.commit()

      # Demo Beneficiaries for John Doe
      jane_smith = Beneficiary(
          user_id=john_doe.id,
          name="Jane Smith",
          phone="+254734567890",
          email="jane@example.com",
          account_number="123456789",
          bank_name="M-Pesa", # Added bank_name
          relationship="Friend",
          created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
      )
      michael_johnson = Beneficiary(
          user_id=john_doe.id,
          name="Michael Johnson",
          phone="+254745678901",
          email="michael@example.com",
          account_number="987654321",
          bank_name="Equity Bank", # Added bank_name
          relationship="Family",
          created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
      )
      db.session.add_all([jane_smith, michael_johnson])
      db.session.commit()

      # Demo Transactions
      transactions = [
          Transaction(
              user_id=john_doe.id, type="deposit", amount=10000, fee=0, status="completed",
              description="Deposit via M-Pesa", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=2)
          ),
          Transaction(
              user_id=john_doe.id, type="send", amount=5000, fee=50, status="completed",
              description="Payment for services", recipient_name="Jane Smith", recipient_phone="+254734567890",
              created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
          ),
          Transaction(
              user_id=john_doe.id, type="receive", amount=20000, fee=0, status="completed",
              description="Salary payment", recipient_name="John Doe", recipient_phone="+254723456789",
              created_at=datetime.datetime.utcnow()
          ),
          Transaction(
              user_id=admin_user.id, type="deposit", amount=50000, fee=0, status="completed",
              description="Initial deposit", created_at=datetime.datetime.utcnow() - datetime.timedelta(days=15)
          ),
      ]
      db.session.add_all(transactions)
      db.session.commit()
      print("Data seeding complete.")
  else:
      print("Users already exist. Skipping data seeding.")
