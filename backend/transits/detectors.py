from typing import Dict, List, Optional

def detect_events(prev_state: Dict, current_state: Dict, planet_name: str) -> List[Dict]:
    """
    Compares two planetary states and returns a list of detected events.
    """
    events = []
    
    # 1. Sign Ingress (ย้ายราศี)
    planet_names_th = {
        "Sun": "อาทิตย์ (๑)", "Moon": "จันทร์ (๒)", "Mars": "อังคาร (๓)", 
        "Mercury": "พุธ (๔)", "Jupiter": "พฤหัสบดี (๕)", "Venus": "ศุกร์ (๖)", 
        "Saturn": "เสาร์ (๗)", "Rahu": "ราหู (๘)", "Ketu": "เกตุ (๙)", "Uranus": "มฤตยู (๐)"
    }
    sign_names_th = ["", "เมษ", "พฤษภ", "เมถุน", "กรกฎ", "สิงห์", "กันย์", "ตุลย์", "พิจิก", "ธนู", "มกร", "กุมภ์", "มีน"]

    if prev_state["sign"] != current_state["sign"]:
        p_th = planet_names_th.get(planet_name, planet_name)
        s_th = sign_names_th[current_state["sign"]]
        events.append({
            "type": "INGRESS",
            "planet": planet_name,
            "from_sign": prev_state["sign"],
            "to_sign": current_state["sign"],
            "description": f"{p_th} ย้ายเข้าสู่ราศี{s_th}"
        })
        
    # 2. Retrograde / Direct Change (พักร / เสริด / มนตรี)
    if prev_state["is_retrograde"] != current_state["is_retrograde"]:
        status = "RETROGRADE" if current_state["is_retrograde"] else "DIRECT"
        status_th = "พักร (ถอยหลัง)" if current_state["is_retrograde"] else "เสริด (เดินหน้าปกติ)"
        p_th = planet_names_th.get(planet_name, planet_name)
        events.append({
            "type": "MOTION_CHANGE",
            "planet": planet_name,
            "status": status,
            "description": f"{p_th} เปลี่ยนทิศการเดินเป็น {status_th}"
        })
        
    return events
