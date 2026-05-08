from fastapi import APIRouter, HTTPException
from models.compare import CompareRequest, CompareResponse
from .chart import calculate_birth_chart
from chart.aspects import calculate_cross_aspects

router = APIRouter()

@router.post("/", response_model=CompareResponse)
def compare_charts_endpoint(data: CompareRequest):
    try:
        chart_a = calculate_birth_chart(data.person_a)
        chart_b = calculate_birth_chart(data.person_b)
        
        # Calculate cross-chart aspects (Synastry)
        syn_aspects = calculate_cross_aspects(
            chart_a["planets"], 
            chart_b["planets"],
            custom_orb=5.0 # Default orb for synastry
        )
        
        return {
            "person_a_chart": chart_a,
            "person_b_chart": chart_b,
            "synastry_aspects": syn_aspects,
            "compatibility_summary": {
                "message": "วิเคราะห์ดวงสมพงษ์สำเร็จ"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
