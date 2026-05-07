from pydantic import BaseModel, ConfigDict
from typing import Dict, Any, List

class BirthChart(BaseModel):
    """
    Immutable snapshot of a natal chart.
    Rule: Once created, this object must not be mutated.
    """
    model_config = ConfigDict(frozen=True)

    julian_date: float
    ayanamsa_name: str
    ayanamsa_value: float
    lagna: Dict[str, Any]
    planets: Dict[str, Any]
    houses: Dict[str, int] # House Number (str) → Sign (1-12)
    western_aspects: List[Dict[str, Any]]
    vedic_aspects: List[Dict[str, Any]]
    d3: Dict[str, Any]
    d9: Dict[str, Any]
    lunar_data: Dict[str, Any]
    dasha_timeline: List[Dict[str, Any]]



