from .d3 import calculate_drekkana
from .d9 import calculate_navamsa
from .d12 import calculate_dwadasamsa
from planets.dignity import get_dignity

def get_divisional_positions(planets_data, lagna_data=None, division="D9"):
    """
    Division Rule Engine: แหล่งรวมกฎการ Mapping ของดวงชะตาแต่ละชั้น
    เรียกใช้ Logic แยกตามไฟล์ของแต่ละประเภทดวง
    """
    div_data = {}
    
    # Mapping Table สำหรับเลือกใช้ Rule ฟังก์ชันจากไฟล์แยก
    rules = {
        "D1": lambda lon: int(lon / 30) + 1,
        "D3": calculate_drekkana,
        "D9": calculate_navamsa,
        "D12": calculate_dwadasamsa,
    }
    
    rule_func = rules.get(division, rules["D1"])
    
    multiplier = {"D1": 1, "D3": 3, "D9": 9, "D12": 12}.get(division, 1)
    div_size = 30.0 / multiplier
    name_to_id = {"Sun": 0, "Moon": 1, "Mars": 2, "Mercury": 3, "Jupiter": 4, "Venus": 5, "Saturn": 6, "Rahu": 7, "Ketu": 8}
    
    for name, data in planets_data.items():
        lon = data["longitude"]
        sign = rule_func(lon)
        
        sign_base = (sign - 1) * 30
        relative_degree = (lon % div_size) * multiplier
        new_lon = (sign_base + relative_degree) % 360
        
        p_id = name_to_id.get(name)
        dignity = get_dignity(p_id, new_lon) if p_id is not None else ""
        
        div_data[name] = {
            "sign": sign,
            "longitude": new_lon,
            "dignity": dignity
        }
    
    div_lagna = None
    if lagna_data:
        lon = lagna_data["longitude"]
        sign = rule_func(lon)
        sign_base = (sign - 1) * 30
        relative_degree = (lon % div_size) * multiplier
        new_lon = (sign_base + relative_degree) % 360
        
        div_lagna = {
            "sign": sign,
            "longitude": new_lon
        }

    return div_data, div_lagna
