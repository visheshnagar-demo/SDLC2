import math
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from server.models import Account, Transaction
from server.schemas import AccountDto, TransactionDto, TransactionPageResponse


class AccountService:
    @staticmethod
    def get_user_accounts(db: Session, user_id: str) -> List[AccountDto]:
        accounts = db.query(Account).filter(Account.user_id == user_id).all()
        return [
            AccountDto(
                accountId=acc.id,
                accountNumber=acc.account_number,
                type=acc.account_type,
                balance=acc.balance,
                currency=acc.currency,
                status=acc.status,
                createdAt=acc.created_at,
            )
            for acc in accounts
        ]

    @staticmethod
    def get_account_by_id(db: Session, account_id: str, user_id: str) -> AccountDto:
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account or account.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found",
            )
        return AccountDto(
            accountId=account.id,
            accountNumber=account.account_number,
            type=account.account_type,
            balance=account.balance,
            currency=account.currency,
            status=account.status,
            createdAt=account.created_at,
        )

    @staticmethod
    def get_account_transactions(
        db: Session,
        account_id: str,
        user_id: str,
        page: int = 0,
        size: int = 10,
        sort: str = "desc",
    ) -> TransactionPageResponse:
        account = db.query(Account).filter(Account.id == account_id).first()
        if not account or account.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found",
            )

        query = db.query(Transaction).filter(Transaction.account_id == account_id)
        if sort.lower() == "asc":
            query = query.order_by(Transaction.created_at.asc())
        else:
            query = query.order_by(Transaction.created_at.desc())

        total_elements = query.count()
        total_pages = math.ceil(total_elements / size) if total_elements > 0 else 1
        page_clamped = max(0, page)
        offset = page_clamped * size

        transactions = query.offset(offset).limit(size).all()

        content = [
            TransactionDto(
                transactionId=tx.id,
                accountId=tx.account_id,
                transferId=tx.transfer_id,
                type=tx.transaction_type,
                amount=tx.amount,
                balanceAfter=tx.balance_after,
                description=tx.description,
                timestamp=tx.created_at,
            )
            for tx in transactions
        ]

        return TransactionPageResponse(
            content=content,
            totalElements=total_elements,
            totalPages=total_pages,
            page=page_clamped,
            size=size,
        )
