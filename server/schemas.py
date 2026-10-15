from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# --- Auth Schemas ---


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: Optional[str] = Field(default=None, alias="fullName")

    model_config = ConfigDict(populate_by_name=True)


class LoginRequest(BaseModel):
    username: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str = Field(alias="refreshToken")

    model_config = ConfigDict(populate_by_name=True)


class MfaVerifyRequest(BaseModel):
    code: str
    user_id: Optional[str] = Field(default=None, alias="userId")

    model_config = ConfigDict(populate_by_name=True)


class MfaSetupResponse(BaseModel):
    secret: str
    qr_code_url: str = Field(alias="qrCodeUrl")
    message: str

    model_config = ConfigDict(populate_by_name=True)


class AuthUserDto(BaseModel):
    user_id: str = Field(alias="userId")
    username: str
    email: str
    full_name: str = Field(alias="fullName")
    status: str
    mfa_enabled: bool = Field(default=False, alias="mfaEnabled")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class AuthResponse(BaseModel):
    access_token: str = Field(alias="accessToken")
    token_type: str = Field(default="Bearer", alias="tokenType")
    expires_in: int = Field(default=900, alias="expiresIn")
    user: AuthUserDto
    refresh_token: Optional[str] = Field(default=None, alias="refreshToken")
    mfa_required: bool = Field(default=False, alias="mfaRequired")

    model_config = ConfigDict(populate_by_name=True)


class MessageResponse(BaseModel):
    message: str


# --- Account Schemas ---


class AccountDto(BaseModel):
    account_id: str = Field(alias="accountId")
    account_number: str = Field(alias="accountNumber")
    type: str
    balance: float
    currency: str = "USD"
    status: str = "ACTIVE"
    created_at: Optional[datetime] = Field(default=None, alias="createdAt")

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class TransactionDto(BaseModel):
    transaction_id: str = Field(alias="transactionId")
    account_id: Optional[str] = Field(default=None, alias="accountId")
    transfer_id: Optional[str] = Field(default=None, alias="transferId")
    type: str
    amount: float
    balance_after: float = Field(alias="balanceAfter")
    description: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class TransactionPageResponse(BaseModel):
    content: List[TransactionDto]
    total_elements: int = Field(alias="totalElements")
    total_pages: int = Field(alias="totalPages")
    page: int
    size: int

    model_config = ConfigDict(populate_by_name=True)


# --- Transfer Schemas ---


class TransferRequest(BaseModel):
    source_account_id: str = Field(alias="sourceAccountId")
    destination_account_number: Optional[str] = Field(
        default=None, alias="destinationAccountNumber"
    )
    destination_account_id: Optional[str] = Field(
        default=None, alias="destinationAccountId"
    )
    amount: float
    currency: str = "USD"
    description: Optional[str] = None
    idempotency_key: Optional[str] = Field(default=None, alias="idempotencyKey")

    model_config = ConfigDict(populate_by_name=True)


class TransferResponse(BaseModel):
    transfer_id: str = Field(alias="transferId")
    reference_number: str = Field(alias="referenceNumber")
    status: str
    amount: float
    currency: str = "USD"
    source_balance_after: float = Field(alias="sourceBalanceAfter")
    timestamp: datetime
    source_account_id: Optional[str] = Field(default=None, alias="sourceAccountId")
    destination_account_id: Optional[str] = Field(
        default=None, alias="destinationAccountId"
    )
    description: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)
