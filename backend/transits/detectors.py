from typing import Dict, List, Optional

def detect_events(prev_state: Dict, current_state: Dict, planet_name: str) -> List[Dict]:
    """
    Compares two planetary states and returns a list of detected events.
    """
    events = []
    
    # 1. Sign Ingress (ย้ายราศี)
    if prev_state["sign"] != current_state["sign"]:
        events.append({
            "type": "INGRESS",
            "planet": planet_name,
            "from_sign": prev_state["sign"],
            "to_sign": current_state["sign"],
            "description": f"{planet_name} moved from Sign {prev_state['sign']} to {current_state['sign']}"
        })
        
    # 2. Retrograde / Direct Change (พักร / เสริด / มนตรี)
    # We can refine this based on speed later
    if prev_state["is_retrograde"] != current_state["is_retrograde"]:
        status = "RETROGRADE" if current_state["is_retrograde"] else "DIRECT"
        events.append({
            "type": "MOTION_CHANGE",
            "planet": planet_name,
            "status": status,
            "description": f"{planet_name} is now {status}"
        })
        
    return events
