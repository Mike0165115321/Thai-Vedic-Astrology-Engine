from pydantic import BaseModel
from typing import Optional

class BirthData(BaseModel):
    year: int
    month: int
    day: int
    hour: int
    minute: int
    second: Optional[int] = 0
    lat: float
    lon: float
    timezone: Optional[str] = "UTC"
    
    # Settings
    ayanamsa_mode: Optional[str] = "LAHIRI"
    custom_ayanamsa_offset: Optional[float] = None
    node_type: Optional[str] = "MEAN" # MEAN or TRUE
    ketu_mode: Optional[str] = "vedic" # vedic or thai

