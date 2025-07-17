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
    if User.query.first():
        print("Users already exist. Skipping data seeding.")
        return

    print("Seeding initial data...")

    # Create Admin User
    admin_user = User(
        first_name="Admin",
        last_name="User",
        email="admin@example.com",
        phone="+254700000000",
        password_hash=generate_password_hash("admin123"),
        is_admin=True,
        created_at=datetime.datetime.utcnow()
    )
    db.session.add(admin_user)
    db.session.commit() # Commit to get admin_user.id

    admin_wallet = Wallet(user_id=admin_user.id, balance=100000.00, currency="KES")
    db.session.add(admin_wallet)

    # Create Regular User
    john_user = User(
        first_name="John",
        last_name="Doe",
        email="john@example.com",
        phone="+254712345678",
        password_hash=generate_password_hash("password123"),
        is_admin=False,
        created_at=datetime.datetime.utcnow()
    )
    db.session.add(john_user)
    db.session.commit() # Commit to get john_user.id

    john_wallet = Wallet(user_id=john_user.id, balance=5000.00, currency="KES")
    db.session.add(john_wallet)

    # Create Beneficiaries for John Doe
    beneficiary1 = Beneficiary(
        user_id=john_user.id,
        name="Jane Smith",
        phone="+254734567890",
        bank_name="Equity Bank", # Added bank_name
        account_number="1234567890"
    )
    beneficiary2 = Beneficiary(
        user_id=john_user.id,
        name="Michael Johnson",
        phone="+254723456789",
        bank_name="KCB Bank", # Added bank_name
        account_number="0987654321"
    )
    db.session.add_all([beneficiary1, beneficiary2])
    db.session.commit() # Commit to get beneficiary IDs

    # Create Sample Transactions for John Doe
    transaction1 = Transaction(
        user_id=john_user.id,
        type="send",
        amount=500.00,
        fee=5.00,
        status="completed",
        description="Groceries",
        recipient_name="Jane Smith",
        recipient_phone="+254734567890",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5)
    )
    transaction2 = Transaction(
        user_id=john_user.id,
        type="receive",
        amount=1000.00,
        fee=0.00,
        status="completed",
        description="Freelance Payment",
        recipient_name="Client Co.",
        recipient_phone="+254787654321",
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=3)
    )
    transaction3 = Transaction(
        user_id=john_user.id,
        type="deposit",
        amount=2000.00,
        fee=0.00,
        status="completed",
        description="M-Pesa Deposit",
        recipient_name="Self",
        recipient_phone=john_user.phone,
        created_at=datetime.datetime.utcnow() - datetime.timedelta(days=1)
    )
    db.session.add_all([transaction1, transaction2, transaction3])
    db.session.commit()

    print("Data seeding complete.")
