"""
ไฟล์สำหรับปรับจูนองศาดาวรายดวง (Manual Planet Tuning Presets)
"""

# สูตร ลาหิรีผสมสุริยาต (HYBRID)
PLANET_HYBRID = {
    "Sun": -0.41,
    "Moon": 2.95,
    "Mars": 0.17,
    "Mercury": 6.17,
    "Jupiter": 1.19,
    "Venus": -2.15,
    "Saturn": 0.0,
    "Rahu": -0.68,
    "Ketu": 6.22
}

# สูตร มายโหรรา (MYHORO)
PLANET_MYHORO = {
    "Sun": -0.41,
    "Moon": 2.95,
    "Mars": 0.17,
    "Mercury": 6.17,
    "Jupiter": 1.19,
    "Venus": -2.15,
    "Saturn": -3.29,
    "Rahu": -0.68,
    "Ketu": 6.22
}

def get_preset_correction(mode, planet_name):
    """
    ดึงค่าปรับแก้ตามโหมดปฏิทินและชื่อดาว
    """
    if mode == "HYBRID":
        return PLANET_HYBRID.get(planet_name, 0.0)
    if mode == "MYHORO":
        return PLANET_MYHORO.get(planet_name, 0.0)
    return 0.0

def apply_correction(mode, planet_name, longitude):
    """
    นำค่าปรับแก้จาก Preset มาคำนวณ
    """
    offset = get_preset_correction(mode, planet_name)
    return (longitude + offset) % 360
