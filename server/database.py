import os
import uuid
from datetime import datetime, timezone
import bcrypt
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.exc import IntegrityError

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db(target_engine=None):
    from server import models  # noqa: F401

    eng = target_engine or engine
    Base.metadata.create_all(bind=eng)


def _hash_pw(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8")[:72], salt).decode("utf-8")


def seed_data(db: Session = None):
    from server.models import User, Account, Transaction, AuditLog  # noqa: F401

    close_after = False
    if db is None:
        db = SessionLocal()
        close_after = True

    try:
        # Seed test user
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            test_user = User(
                id=str(uuid.uuid4()),
                username="testuser",
                email="test@example.com",
                password_hash=_hash_pw("testpassword"),
                full_name="Test User",
                status="ACTIVE",
                is_active=True,
                failed_login_attempts=0,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(test_user)
            db.commit()
            db.refresh(test_user)

        # Seed admin user
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin_user:
            admin_user = User(
                id=str(uuid.uuid4()),
                username="adminuser",
                email="admin@example.com",
                password_hash=_hash_pw("adminpassword"),
                full_name="Admin User",
                status="ACTIVE",
                is_active=True,
                failed_login_attempts=0,
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        # Seed accounts for test user
        acc_checking = (
            db.query(Account).filter(Account.account_number == "ACC-1001").first()
        )
        if not acc_checking:
            acc_checking = Account(
                id=str(uuid.uuid4()),
                user_id=test_user.id,
                account_number="ACC-1001",
                account_type="CHECKING",
                balance=5000.00,
                currency="USD",
                status="ACTIVE",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(acc_checking)
            db.commit()
            db.refresh(acc_checking)

            # Add sample transactions for checking
            tx1 = Transaction(
                id=str(uuid.uuid4()),
                account_id=acc_checking.id,
                transaction_type="CREDIT",
                amount=5000.00,
                balance_after=5000.00,
                description="Initial Account Deposit",
                created_at=datetime.now(timezone.utc),
            )
            db.add(tx1)
            db.commit()

        acc_savings = (
            db.query(Account).filter(Account.account_number == "ACC-2002").first()
        )
        if not acc_savings:
            acc_savings = Account(
                id=str(uuid.uuid4()),
                user_id=test_user.id,
                account_number="ACC-2002",
                account_type="SAVINGS",
                balance=12500.00,
                currency="USD",
                status="ACTIVE",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(acc_savings)
            db.commit()
            db.refresh(acc_savings)

            tx2 = Transaction(
                id=str(uuid.uuid4()),
                account_id=acc_savings.id,
                transaction_type="CREDIT",
                amount=12500.00,
                balance_after=12500.00,
                description="Initial Savings Deposit",
                created_at=datetime.now(timezone.utc),
            )
            db.add(tx2)
            db.commit()

        # Seed destination recipient account under admin user
        acc_dest = (
            db.query(Account).filter(Account.account_number == "ACC-3003").first()
        )
        if not acc_dest:
            acc_dest = Account(
                id=str(uuid.uuid4()),
                user_id=admin_user.id,
                account_number="ACC-3003",
                account_type="CHECKING",
                balance=1000.00,
                currency="USD",
                status="ACTIVE",
                created_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc),
            )
            db.add(acc_dest)
            db.commit()
            db.refresh(acc_dest)

    except IntegrityError:
        db.rollback()
    finally:
        if close_after:
            db.close()
