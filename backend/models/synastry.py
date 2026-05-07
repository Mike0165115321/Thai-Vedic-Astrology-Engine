from pydantic import BaseModel
from models.birth_data import BirthData
from models.chart import BirthChart
from typing import Dict, List, Any

class SynastryRequest(BaseModel):
    person1: BirthData
    person2: BirthData

class SynastryResult(BaseModel):
    chart1: BirthChart
    chart2: BirthChart
    ashtakoota_score: float
    ashtakoota_details: Dict[str, Any]
    interaction_aspects: List[Dict[str, Any]]
