from fastapi import APIRouter, HTTPException
from models.compare import CompareRequest, CompareResponse
from .chart import calculate_birth_chart

router = APIRouter()

@router.post("/", response_model=CompareResponse)
def compare_charts_endpoint(data: CompareRequest):
    try:
        chart_a = calculate_birth_chart(data.person_a)
        chart_b = calculate_birth_chart(data.person_b)
        
        # Future: Add Kuta score calculation here
        
        return {
            "person_a_chart": chart_a,
            "person_b_chart": chart_b,
            "compatibility_summary": {
                "message": "Synastry calculation successful. Comparison logic coming soon."
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
