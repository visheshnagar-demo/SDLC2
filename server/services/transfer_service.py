import uuid
import random
from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from server.models import Account, Transfer, Transaction, AuditLog
from server.schemas import TransferRequest, TransferResponse


class TransferService:
    @staticmethod
    def execute_transfer(
        db: Session,
        user_id: str,
        request: TransferRequest,
        ip_address: str = None,
        user_agent: str = None,
    ) -> TransferResponse:
        # Validate amount
        if request.amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Transfer amount must be greater than zero",
            )

        # Check idempotency
        if request.idempotency_key:
            existing_transfer = (
                db.query(Transfer)
                .filter(Transfer.idempotency_key == request.idempotency_key)
                .first()
            )
            if existing_transfer:
                source_acc = (
                    db.query(Account)
                    .filter(Account.id == existing_transfer.source_account_id)
                    .first()
                )
                return TransferResponse(
                    transferId=existing_transfer.id,
                    referenceNumber=existing_transfer.reference_number,
                    status=existing_transfer.status,
                    amount=existing_transfer.amount,
                    currency=existing_transfer.currency,
                    sourceBalanceAfter=source_acc.balance if source_acc else 0.0,
                    timestamp=existing_transfer.created_at,
                    sourceAccountId=existing_transfer.source_account_id,
                    destinationAccountId=existing_transfer.destination_account_id,
                    description=existing_transfer.description,
                )

        # Find source account and validate ownership & balance
        source_account = (
            db.query(Account).filter(Account.id == request.source_account_id).first()
        )
        if not source_account or source_account.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Source account not found or does not belong to user",
            )

        if source_account.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Source account is not active",
            )

        if source_account.balance < request.amount:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Insufficient funds: account balance is ${source_account.balance:.2f}, transfer amount is ${request.amount:.2f}",
            )

        # Find destination account
        dest_account = None
        if request.destination_account_number:
            dest_account = (
                db.query(Account)
                .filter(Account.account_number == request.destination_account_number)
                .first()
            )
        elif request.destination_account_id:
            dest_account = (
                db.query(Account)
                .filter(Account.id == request.destination_account_id)
                .first()
            )

        if not dest_account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Destination account not found",
            )

        if dest_account.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Destination account is not active",
            )

        if source_account.id == dest_account.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot transfer funds to the same account",
            )

        # Execute double-entry ledger transfer atomically
        ref_number = f"TRX-{random.randint(100000, 999999)}"
        transfer_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        # Update balances
        source_account.balance -= request.amount
        dest_account.balance += request.amount

        # Create transfer record
        transfer = Transfer(
            id=transfer_id,
            reference_number=ref_number,
            source_account_id=source_account.id,
            destination_account_id=dest_account.id,
            amount=request.amount,
            currency=request.currency or "USD",
            description=request.description or "Fund Transfer",
            status="COMPLETED",
            idempotency_key=request.idempotency_key,
            created_at=now,
        )
        db.add(transfer)

        # Create debit transaction for source
        debit_tx = Transaction(
            id=str(uuid.uuid4()),
            account_id=source_account.id,
            transfer_id=transfer_id,
            transaction_type="DEBIT",
            amount=request.amount,
            balance_after=source_account.balance,
            description=f"Transfer to {dest_account.account_number}: {request.description or ''}".strip(),
            created_at=now,
        )
        db.add(debit_tx)

        # Create credit transaction for destination
        credit_tx = Transaction(
            id=str(uuid.uuid4()),
            account_id=dest_account.id,
            transfer_id=transfer_id,
            transaction_type="CREDIT",
            amount=request.amount,
            balance_after=dest_account.balance,
            description=f"Transfer from {source_account.account_number}: {request.description or ''}".strip(),
            created_at=now,
        )
        db.add(credit_tx)

        # Add audit log
        audit = AuditLog(
            id=str(uuid.uuid4()),
            user_id=user_id,
            event_type="FUND_TRANSFER",
            ip_address=ip_address,
            user_agent=user_agent,
            details=f"Transferred ${request.amount:.2f} from {source_account.account_number} to {dest_account.account_number} (Ref: {ref_number})",
            created_at=now,
        )
        db.add(audit)

        db.commit()
        db.refresh(transfer)

        return TransferResponse(
            transferId=transfer.id,
            referenceNumber=transfer.reference_number,
            status=transfer.status,
            amount=transfer.amount,
            currency=transfer.currency,
            sourceBalanceAfter=source_account.balance,
            timestamp=transfer.created_at,
            sourceAccountId=source_account.id,
            destinationAccountId=dest_account.id,
            description=transfer.description,
        )

    @staticmethod
    def get_transfer_by_id(
        db: Session, transfer_id: str, user_id: str
    ) -> TransferResponse:
        transfer = db.query(Transfer).filter(Transfer.id == transfer_id).first()
        if not transfer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transfer not found",
            )

        source_acc = (
            db.query(Account).filter(Account.id == transfer.source_account_id).first()
        )
        dest_acc = (
            db.query(Account)
            .filter(Account.id == transfer.destination_account_id)
            .first()
        )

        # Ensure user is associated with source or destination account
        if (not source_acc or source_acc.user_id != user_id) and (
            not dest_acc or dest_acc.user_id != user_id
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transfer not found",
            )

        return TransferResponse(
            transferId=transfer.id,
            referenceNumber=transfer.reference_number,
            status=transfer.status,
            amount=transfer.amount,
            currency=transfer.currency,
            sourceBalanceAfter=source_acc.balance if source_acc else 0.0,
            timestamp=transfer.created_at,
            sourceAccountId=transfer.source_account_id,
            destinationAccountId=transfer.destination_account_id,
            description=transfer.description,
        )
