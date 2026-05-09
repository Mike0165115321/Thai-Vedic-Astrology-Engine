from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from models.birth_data import BirthData

class TransitScanRequest(BaseModel):
    start_year: int
    start_month: int
    start_day: int
    start_hour: int = 0
    start_minute: int = 0
    end_year: int
    end_month: int
    end_day: int
    planets: List[str] = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu", "Uranus"]
    step_days: float = 1.0
    ayanamsa_mode: str = "LAHIRI"
    divisional_charts: List[str] = ["D1", "D3", "D9"]
    # Optional natal data to calculate houses and natal aspects
    natal_data: Optional[BirthData] = None

class TransitEvent(BaseModel):
    type: str
    planet: str
    timestamp: str
    description: str
    from_sign: Optional[int] = None
    to_sign: Optional[int] = None
    status: Optional[str] = None
    
    # Advanced Details
    degree_text: str
    dignity: str
    dignity_list: List[str]
    nakshatra: str
    
    # Natal-Relative Details (only if natal_data provided)
    house: Optional[int] = None
    natal_aspects: List[Dict[str, Any]] = []
    transit_aspects: List[Dict[str, Any]] = []
    yogas: List[str] = []

class TransitScanResponse(BaseModel):
    natal_chart: Optional[Dict[str, Any]] = None
    initial_transits: Optional[Dict[str, Any]] = None
    events: List[TransitEvent]
    total_events: int
    scan_period_days: int
