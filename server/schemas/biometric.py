from typing import Optional
from pydantic import BaseModel


class BiometricVerifyRequest(BaseModel):
    document_id: str
    selfie_image_base64: Optional[str] = None


class BiometricVerifyResponse(BaseModel):
    biometric_id: str
    liveness_passed: bool
    match_score: float
    status: str
    overall_status: Optional[str] = None
    flag_reason: Optional[str] = None


class BiometricStatusResponse(BaseModel):
    biometric_id: str
    status: str
    match_score: float
    liveness_passed: Optional[bool] = None
    document_id: Optional[str] = None
