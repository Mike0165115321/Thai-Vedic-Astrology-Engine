from fastapi import APIRouter, HTTPException
from models.synastry import SynastryRequest, SynastryResult
from api.routes.chart import calculate_chart_endpoint
from chart.synastry import calculate_ashtakoota
from chart.aspects import calculate_western_aspects

router = APIRouter()

@router.post("/", response_model=SynastryResult)
def compare_charts_endpoint(data: SynastryRequest):
    try:
        # 1. Calculate individual charts
        chart1 = calculate_chart_endpoint(data.person1)
        chart2 = calculate_chart_endpoint(data.person2)
        
        # 2. Extract Moon data for Ashtakoota
        moon1 = {
            "longitude": chart1["planets"]["Moon"]["longitude"],
            "sign": chart1["planets"]["Moon"]["sign"],
            "nakshatra_index": chart1["lunar_data"]["moon_nakshatra"]["index"]
        }
        moon2 = {
            "longitude": chart2["planets"]["Moon"]["longitude"],
            "sign": chart2["planets"]["Moon"]["sign"],
            "nakshatra_index": chart2["lunar_data"]["moon_nakshatra"]["index"]
        }
        
        # 3. Calculate Ashtakoota
        ashtakoota = calculate_ashtakoota(moon1, moon2)
        
        # 4. Calculate Interaction Aspects (P1 planets to P2 planets)
        # We can reuse calculate_western_aspects by combining planets
        # but we need to identify which planet belongs to which person.
        # For now, let's keep it simple or implement a specific function.
        # Let's skip detailed interaction aspects for this MVP phase.
        interaction_aspects = [] 
        
        return {
            "chart1": chart1,
            "chart2": chart2,
            "ashtakoota_score": ashtakoota["total"],
            "ashtakoota_details": ashtakoota["details"],
            "interaction_aspects": interaction_aspects
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
