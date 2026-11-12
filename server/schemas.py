from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=255, description="Task title")

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        if v is None or not v.strip():
            raise ValueError("Task title cannot be empty or whitespace only")
        if len(v.strip()) > 255:
            raise ValueError("Task title must be at most 255 characters")
        return v.strip()


class TaskUpdateRequest(BaseModel):
    title: Optional[str] = Field(None, max_length=255, description="Updated task title")
    completed: Optional[bool] = Field(None, description="Updated completion status")

    @field_validator("title")
    @classmethod
    def validate_update_title(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.strip():
                raise ValueError("Task title cannot be empty or whitespace only")
            if len(v.strip()) > 255:
                raise ValueError("Task title must be at most 255 characters")
            return v.strip()
        return v


class TaskResponse(BaseModel):
    id: str
    title: str
    completed: bool
    created_at: datetime
    updated_at: datetime
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    @model_validator(mode="before")
    @classmethod
    def populate_fields(cls, data: Any) -> Any:
        if hasattr(data, "created_at"):
            c_at = getattr(data, "created_at")
            u_at = getattr(data, "updated_at")
            return {
                "id": str(getattr(data, "id")),
                "title": getattr(data, "title"),
                "completed": getattr(data, "completed"),
                "created_at": c_at,
                "updated_at": u_at,
                "createdAt": c_at,
                "updatedAt": u_at,
            }
        elif isinstance(data, dict):
            c_at = data.get("created_at") or data.get("createdAt")
            u_at = data.get("updated_at") or data.get("updatedAt")
            data["created_at"] = c_at
            data["updated_at"] = u_at
            data["createdAt"] = c_at
            data["updatedAt"] = u_at
            return data
        return data

    model_config = ConfigDict(from_attributes=True)
