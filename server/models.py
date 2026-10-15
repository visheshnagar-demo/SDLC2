import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from server.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100), nullable=False)
    status = Column(
        String(20), default="ACTIVE", nullable=False
    )  # ACTIVE, LOCKED, SUSPENDED
    is_active = Column(Boolean, default=True, nullable=False)
    failed_login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(String(100), nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    accounts = relationship(
        "Account", back_populates="user", cascade="all, delete-orphan"
    )
    audit_logs = relationship(
        "AuditLog", back_populates="user", cascade="all, delete-orphan"
    )


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    account_number = Column(String(30), unique=True, index=True, nullable=False)
    account_type = Column(String(20), nullable=False)  # CHECKING, SAVINGS
    balance = Column(Float, default=0.00, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    status = Column(
        String(20), default="ACTIVE", nullable=False
    )  # ACTIVE, FROZEN, CLOSED
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="accounts")
    transactions = relationship(
        "Transaction", back_populates="account", cascade="all, delete-orphan"
    )


class Transfer(Base):
    __tablename__ = "transfers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference_number = Column(String(50), unique=True, index=True, nullable=False)
    source_account_id = Column(
        String(36), ForeignKey("accounts.id"), nullable=False, index=True
    )
    destination_account_id = Column(
        String(36), ForeignKey("accounts.id"), nullable=False, index=True
    )
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="USD", nullable=False)
    description = Column(String(255), nullable=True)
    status = Column(
        String(20), default="PENDING", nullable=False
    )  # PENDING, COMPLETED, FAILED
    idempotency_key = Column(String(100), unique=True, index=True, nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    transactions = relationship("Transaction", back_populates="transfer")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(
        String(36), ForeignKey("accounts.id"), nullable=False, index=True
    )
    transfer_id = Column(
        String(36), ForeignKey("transfers.id"), nullable=True, index=True
    )
    transaction_type = Column(String(20), nullable=False)  # DEBIT, CREDIT
    amount = Column(Float, nullable=False)
    balance_after = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    account = relationship("Account", back_populates="transactions")
    transfer = relationship("Transfer", back_populates="transactions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    event_type = Column(
        String(50), nullable=False
    )  # USER_LOGIN, LOGIN_FAILED, ACCOUNT_LOCKED, FUND_TRANSFER
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )

    user = relationship("User", back_populates="audit_logs")
