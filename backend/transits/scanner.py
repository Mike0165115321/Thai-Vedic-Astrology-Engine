import swisseph as swe
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from planets.calculator import calculate_planet_position, get_all_planets, PLANET_IDS
from transits.detectors import detect_events
from core.ayanamsa import set_ayanamsa
from chart.lagna import calculate_lagna
from chart.aspects import calculate_western_aspects, calculate_cross_aspects
from chart.lunar import calculate_nakshatra

def scan_transits(
    start_date: datetime,
    end_date: datetime,
    planet_names: List[str],
    step_days: float = 1.0,
    ayanamsa_mode: str = "HYBRID",
    natal_data: Optional[Dict] = None
) -> List[Dict[str, Any]]:
    """
    Advanced scan for planetary events with dignity, houses, and aspects.
    """
    set_ayanamsa(ayanamsa_mode)
    
    events = []
    current_time = start_date
    
    # Pre-calculate Natal Chart if provided
    natal_planets = None
    natal_lagna_sign = None
    if natal_data:
        from api.routes.chart import calculate_birth_chart
        from models.birth_data import BirthData
        
        # Ensure we have a BirthData object
        if isinstance(natal_data, dict):
            nbd = BirthData(**natal_data)
        elif hasattr(natal_data, "dict"):
            nbd = BirthData(**natal_data.dict())
        else:
            nbd = natal_data
            
        natal_results = calculate_birth_chart(nbd)
        natal_planets = natal_results["planets"]
        natal_lagna_sign = natal_results["lagna"]["sign"]

    # Initial state tracking
    prev_positions = {}
    
    def get_jd(dt: datetime):
        return swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute / 60.0)

    # 1. Initial positions
    jd = get_jd(current_time)
    for name in planet_names:
        if name == "Ketu":
            rahu_pos = calculate_planet_position(jd, swe.MEAN_NODE)
            lon = (rahu_pos["longitude"] + 180) % 360
            prev_positions[name] = {"sign": int(lon / 30) + 1, "is_retrograde": rahu_pos["is_retrograde"], "longitude": lon}
        else:
            p_id = PLANET_IDS.get(name)
            if p_id is not None:
                prev_positions[name] = calculate_planet_position(jd, p_id)

    # 2. Iterate
    current_time += timedelta(days=step_days)
    while current_time <= end_date:
        jd = get_jd(current_time)
        
        for name in planet_names:
            if name == "Ketu":
                rahu_pos = calculate_planet_position(jd, swe.MEAN_NODE)
                lon = (rahu_pos["longitude"] + 180) % 360
                curr_pos = {"sign": int(lon / 30) + 1, "is_retrograde": rahu_pos["is_retrograde"], "longitude": lon}
            else:
                p_id = PLANET_IDS.get(name)
                if p_id is None: continue
                curr_pos = calculate_planet_position(jd, p_id)
            
            # Detect events
            new_events = detect_events(prev_positions[name], curr_pos, name)
            
            if new_events:
                # IMPORTANT: Calculate full snapshot at this moment for advanced data
                full_transit_chart = get_all_planets(jd)
                
                for event in new_events:
                    # Get full details for the specific planet from the full chart
                    p_details = full_transit_chart.get(name)
                    if not p_details: continue
                    
                    event["timestamp"] = current_time.isoformat()
                    event["degree_text"] = f"{int(p_details['degree_in_sign'])}°{int((p_details['degree_in_sign'] % 1) * 60)}'"
                    event["dignity"] = p_details["dignity"]
                    event["dignity_list"] = p_details["dignity_list"]
                    event["nakshatra"] = calculate_nakshatra(p_details["longitude"])["name"]
                    
                    # Natal House Mapping
                    if natal_lagna_sign:
                        # (current_sign - lagna_sign + 12) % 12 + 1
                        event["house"] = (p_details["sign"] - natal_lagna_sign + 12) % 12 + 1
                    
                    # Aspects
                    # Transit-to-Transit
                    t_aspects = calculate_western_aspects(full_transit_chart)
                    event["transit_aspects"] = [a for a in t_aspects if a["p1"] == name or a["p2"] == name]
                    
                    # Transit-to-Natal
                    if natal_planets:
                        n_aspects = calculate_cross_aspects({name: p_details}, natal_planets)
                        event["natal_aspects"] = n_aspects
                        
                    events.append(event)
            
            # Update prev
            prev_positions[name] = curr_pos
            
        current_time += timedelta(days=step_days)
        
    return events
