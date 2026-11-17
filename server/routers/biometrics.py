from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    UploadFile,
    Request,
    Query,
)
from sqlalchemy.orm import Session
from server.database import get_db
from server.models.user import User
from server.schemas.biometric import (
    BiometricVerifyResponse,
    BiometricStatusResponse,
)
from server.services.biometric_service import (
    verify_biometric_selfie,
    get_biometric_status_by_document,
)
from server.dependencies import get_current_user, get_client_ip

router = APIRouter(prefix="/api/v1/biometrics", tags=["Biometrics & Liveness"])


@router.post(
    "/verify", response_model=BiometricVerifyResponse, status_code=status.HTTP_200_OK
)
async def verify_biometrics_endpoint(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_type = request.headers.get("content-type", "")
    document_id = None
    selfie_bytes = None
    selfie_base64 = None

    if (
        "multipart/form-data" in content_type
        or "application/x-www-form-urlencoded" in content_type
    ):
        form = await request.form()
        document_id = form.get("document_id")
        selfie_file = form.get("selfie_image")
        if isinstance(selfie_file, UploadFile):
            selfie_bytes = await selfie_file.read()
        elif isinstance(selfie_file, bytes):
            selfie_bytes = selfie_file
        elif isinstance(selfie_file, str):
            selfie_base64 = selfie_file
    else:
        try:
            body = await request.json()
            document_id = body.get("document_id")
            selfie_base64 = body.get("selfie_image_base64") or body.get("selfie_image")
        except Exception:
            pass

    if not document_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Field 'document_id' is required for biometric verification.",
        )

    bio_record, app = verify_biometric_selfie(
        db=db,
        user_id=current_user.id,
        document_id=str(document_id),
        selfie_bytes=selfie_bytes,
        selfie_base64=selfie_base64,
        client_ip=get_client_ip(request),
    )

    return BiometricVerifyResponse(
        biometric_id=bio_record.id,
        liveness_passed=bio_record.liveness_passed,
        match_score=bio_record.match_score,
        status=bio_record.status,
        overall_status=app.overall_status,
        flag_reason=app.flag_reason,
    )


@router.get("/status", response_model=BiometricStatusResponse)
def get_biometric_status(
    document_id: str = Query(
        ..., description="Document UUID to query biometric status for"
    ),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    bio = get_biometric_status_by_document(db, document_id)
    if not bio:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Biometric record for document '{document_id}' not found.",
        )

    if current_user.role == "customer" and bio.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this biometric record.",
        )

    return BiometricStatusResponse(
        biometric_id=bio.id,
        status=bio.status,
        match_score=bio.match_score,
        liveness_passed=bio.liveness_passed,
        document_id=bio.document_id,
    )
