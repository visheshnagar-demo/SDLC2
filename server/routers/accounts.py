from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import User
from server.schemas import AccountDto, TransactionPageResponse
from server.security import get_current_user
from server.services.account_service import AccountService

router = APIRouter(prefix="/api/v1/accounts", tags=["Accounts"])


@router.get("", response_model=List[AccountDto], status_code=status.HTTP_200_OK)
def get_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AccountService.get_user_accounts(db, current_user.id)


@router.get("/{id}", response_model=AccountDto, status_code=status.HTTP_200_OK)
def get_account_by_id(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AccountService.get_account_by_id(db, id, current_user.id)


@router.get(
    "/{id}/transactions",
    response_model=TransactionPageResponse,
    status_code=status.HTTP_200_OK,
)
def get_account_transactions(
    id: str,
    page: int = Query(default=0, ge=0),
    size: int = Query(default=10, ge=1, le=100),
    sort: str = Query(default="desc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AccountService.get_account_transactions(
        db, id, current_user.id, page=page, size=size, sort=sort
    )
