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
    d3_western_aspects: List[Dict[str, Any]] | None = None
    d9_western_aspects: List[Dict[str, Any]] | None = None
    vedic_aspects: List[Dict[str, Any]]
    d3: Dict[str, Any]
    d9: Dict[str, Any]
    d3_lagna: Dict[str, Any] | None = None
    d9_lagna: Dict[str, Any] | None = None
    lunar_data: Dict[str, Any]
    dasha_timeline: List[Dict[str, Any]]
    house_lords: Dict[int, Any] | None = None
    d3_house_lords: Dict[int, Any] | None = None
    d9_house_lords: Dict[int, Any] | None = None
    yogas: List[Dict[str, Any]] | None = None
    d3_yogas: List[Dict[str, Any]] | None = None
    d9_yogas: List[Dict[str, Any]] | None = None



