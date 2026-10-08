from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


VALID_COVERAGE_TYPES = {
    "Third Party",
    "Comprehensive",
    "Third Party Fire and Theft",
    "Third Party Fire & Theft"
}


class FactorBreakdownItem(BaseModel):
    id: Optional[str] = None
    factor_name: str
    amount: float
    category: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class QuoteCalculateRequest(BaseModel):
    vehicle_make: str = Field(..., description="Vehicle make (e.g. Toyota, Honda)")
    vehicle_year: int = Field(..., description="Vehicle manufacture year (e.g. 2022)")
    vehicle_value: float = Field(..., description="Estimated vehicle market value in USD")
    driver_age: int = Field(..., description="Driver age in years")
    driving_experience: int = Field(..., description="Years of driving experience")
    coverage_type: str = Field(..., description="Coverage type: Third Party, Comprehensive, or Third Party Fire and Theft")

    @field_validator("vehicle_make")
    @classmethod
    def validate_vehicle_make(cls, v: str) -> str:
        stripped = v.strip() if isinstance(v, str) else ""
        if not stripped:
            raise ValueError("Vehicle make must not be empty")
        return stripped

    @field_validator("vehicle_year")
    @classmethod
    def validate_vehicle_year(cls, v: int) -> int:
        current_year = datetime.now(timezone.utc).year
        if v < 1900:
            raise ValueError("Vehicle manufacture year cannot be prior to 1900")
        if v > current_year + 1:
            raise ValueError(f"Vehicle manufacture year cannot be in the future (max {current_year + 1})")
        return v

    @field_validator("vehicle_value")
    @classmethod
    def validate_vehicle_value(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Vehicle value must be greater than zero ($0.00)")
        return round(float(v), 2)

    @field_validator("driver_age")
    @classmethod
    def validate_driver_age(cls, v: int) -> int:
        if v < 16:
            raise ValueError("Driver age must be at least 16 years old")
        if v > 120:
            raise ValueError("Driver age cannot exceed 120 years")
        return v

    @field_validator("driving_experience")
    @classmethod
    def validate_driving_experience(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Driving experience cannot be negative")
        return v

    @field_validator("coverage_type")
    @classmethod
    def validate_coverage_type(cls, v: str) -> str:
        normalized = v.strip() if isinstance(v, str) else ""
        # Check case-insensitive matching against valid types
        for valid in VALID_COVERAGE_TYPES:
            if normalized.lower() == valid.lower():
                return valid
        raise ValueError(f"Invalid coverage type '{v}'. Allowed types: Third Party, Comprehensive, Third Party Fire and Theft")

    @model_validator(mode="after")
    def validate_experience_vs_age(self) -> "QuoteCalculateRequest":
        max_allowed_exp = self.driver_age - 16
        if self.driving_experience > max_allowed_exp:
            raise ValueError(
                f"Driving experience ({self.driving_experience} yrs) cannot exceed driver age minus minimum legal driving age of 16 (max {max_allowed_exp} yrs for age {self.driver_age})"
            )
        return self


class QuoteResponse(BaseModel):
    id: str
    quote_id: Optional[str] = None
    vehicle_make: str
    vehicle_year: int
    vehicle_value: float
    driver_age: int
    driving_experience: int
    coverage_type: str
    base_premium: float
    total_premium: float
    currency: str = "USD"
    status: str = "Calculated"
    calculated_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    breakdown: List[FactorBreakdownItem] = []
    factors: List[FactorBreakdownItem] = []

    model_config = ConfigDict(from_attributes=True)


class QuoteListResponse(BaseModel):
    items: List[QuoteResponse]
    total: int
    skip: int
    limit: int


class QuoteStatsResponse(BaseModel):
    total_quotes: int
    quotes_today: int
    avg_quote_value: float
    conversion_rate: float
