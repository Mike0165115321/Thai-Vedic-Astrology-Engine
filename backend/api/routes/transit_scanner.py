from fastapi import APIRouter, HTTPException
from datetime import datetime
from models.transit_scanner import TransitScanRequest, TransitScanResponse
from transits.scanner import scan_transits

router = APIRouter()

@router.post("/scan", response_model=TransitScanResponse)
def scan_transits_endpoint(data: TransitScanRequest):
    try:
        start_date = datetime(data.start_year, data.start_month, data.start_day)
        end_date = datetime(data.end_year, data.end_month, data.end_day)
        
        if end_date <= start_date:
            raise HTTPException(status_code=400, detail="End date must be after start date")
            
        # Limit scan range to prevent abuse (e.g., max 150 years)
        diff = end_date - start_date
        if diff.days > 365 * 150:
             raise HTTPException(status_code=400, detail="Scan range limited to 150 years")

        events = scan_transits(
            start_date=start_date,
            end_date=end_date,
            planet_names=data.planets,
            step_days=data.step_days,
            ayanamsa_mode=data.ayanamsa_mode,
            natal_data=data.natal_data
        )
        
        return {
            "events": events,
            "total_events": len(events),
            "scan_period_days": diff.days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
