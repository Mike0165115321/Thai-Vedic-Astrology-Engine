from .d3 import calculate_drekkana
from .d9 import calculate_navamsa
from .d12 import calculate_dwadasamsa

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
    
    for name, data in planets_data.items():
        lon = data["longitude"]
        div_data[name] = {
            "sign": rule_func(lon),
            "longitude": lon 
        }
    
    div_lagna = None
    if lagna_data:
        lon = lagna_data["longitude"]
        div_lagna = {
            "sign": rule_func(lon),
            "longitude": lon
        }

    return div_data, div_lagna
