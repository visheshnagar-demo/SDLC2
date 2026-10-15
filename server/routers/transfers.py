from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from server.database import get_db
from server.models import User
from server.schemas import TransferRequest, TransferResponse
from server.security import get_current_user
from server.services.transfer_service import TransferService

router = APIRouter(prefix="/api/v1/transfers", tags=["Transfers"])


@router.post("", response_model=TransferResponse, status_code=status.HTTP_201_CREATED)
def execute_transfer(
    request: TransferRequest,
    req: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    client_ip = req.client.host if req.client else None
    user_agent = req.headers.get("user-agent")
    return TransferService.execute_transfer(
        db, current_user.id, request, ip_address=client_ip, user_agent=user_agent
    )


@router.get("/{id}", response_model=TransferResponse, status_code=status.HTTP_200_OK)
def get_transfer_by_id(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return TransferService.get_transfer_by_id(db, id, current_user.id)
