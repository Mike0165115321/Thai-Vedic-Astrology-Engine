from pydantic import BaseModel
from models.birth_data import BirthData
from typing import Optional

class TransitRequest(BaseModel):
    birth_data: BirthData
    transit_year: int
    transit_month: int
    transit_day: int
    transit_hour: int
    transit_minute: int
    transit_timezone: Optional[str] = "UTC"
