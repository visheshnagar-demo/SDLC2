from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenRefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    full_name: str
    is_active: bool = True
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
