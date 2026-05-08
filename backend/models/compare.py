from pydantic import BaseModel
from typing import Dict, Any, List
from .birth_data import BirthData
from .chart import BirthChart

class CompareRequest(BaseModel):
    person_a: BirthData
    person_b: BirthData

class CompareResponse(BaseModel):
    person_a_chart: BirthChart
    person_b_chart: BirthChart
    synastry_aspects: List[Dict[str, Any]] | None = None
    compatibility_summary: Dict[str, Any] = {}
