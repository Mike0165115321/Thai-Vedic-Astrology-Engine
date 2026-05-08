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
            
        # Limit scan range to prevent abuse (e.g., max 120 years)
        diff = end_date - start_date
        if diff.days > 365 * 120:
             raise HTTPException(status_code=400, detail="Scan range limited to 120 years")

        # 1. Calculate Natal Chart (Axis 1)
        natal_chart = None
        if data.natal_data:
            from api.routes.chart import calculate_birth_chart
            natal_chart = calculate_birth_chart(data.natal_data)

        # 2. Calculate Initial Transits Snapshot (Axis 2)
        from api.routes.chart import calculate_birth_chart
        from models.birth_data import BirthData
        from chart.aspects import calculate_cross_aspects
        
        initial_transit_data = BirthData(
            year=start_date.year, month=start_date.month, day=start_date.day,
            hour=start_date.hour, minute=start_date.minute, second=0,
            lat=data.natal_data.lat if data.natal_data else 13.7563,
            lon=data.natal_data.lon if data.natal_data else 100.5018,
            timezone=data.natal_data.timezone if data.natal_data else "UTC"
        )
        initial_transits = calculate_birth_chart(initial_transit_data)
        
        # Enhance Axis 2 with Natal Relative Info
        if natal_chart:
            # Add Relative Houses to initial transits
            natal_lagna_sign = natal_chart["lagna"]["sign"]
            for name, p_data in initial_transits["planets"].items():
                p_data["natal_house"] = (p_data["sign"] - natal_lagna_sign + 12) % 12 + 1
            
            # Add Cross-Aspects (Transit at Start -> Natal)
            initial_transits["natal_aspects"] = calculate_cross_aspects(
                initial_transits["planets"], 
                natal_chart["planets"]
            )

        # 3. Scan for Timeline (Axis 3)
        events = scan_transits(
            start_date=start_date,
            end_date=end_date,
            planet_names=data.planets,
            step_days=data.step_days,
            ayanamsa_mode=data.ayanamsa_mode,
            natal_data=data.natal_data
        )
        
        return {
            "natal_chart": natal_chart,
            "initial_transits": initial_transits,
            "events": events,
            "total_events": len(events),
            "scan_period_days": diff.days
        }
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))
