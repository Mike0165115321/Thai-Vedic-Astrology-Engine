from pydantic import BaseModel
from typing import Dict

class HouseData(BaseModel):
    house_number: int
    sign: int # 1-12
