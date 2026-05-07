# Thai-Vedic Astrology Constants

# Zodiac Signs
ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

# Planets (Thai Names & IDs)
PLANETS = {
    0: {"name": "Sun", "thai_name": "อาทิตย์", "symbol": "๑"},
    1: {"name": "Moon", "thai_name": "จันทร์", "symbol": "๒"},
    2: {"name": "Mars", "thai_name": "อังคาร", "symbol": "๓"},
    3: {"name": "Mercury", "thai_name": "พุธ", "symbol": "๔"},
    4: {"name": "Jupiter", "thai_name": "พฤหัสบดี", "symbol": "๕"},
    5: {"name": "Venus", "thai_name": "ศุกร์", "symbol": "๖"},
    6: {"name": "Saturn", "thai_name": "เสาร์", "symbol": "๗"},
    7: {"name": "Rahu", "thai_name": "ราหู", "symbol": "๘"},
    8: {"name": "Ketu", "thai_name": "เกตุ", "symbol": "๙"},
}

# Ayanamsa — default mode (must match keys in core/ayanamsa.py AYANAMSA_MODES)
DEFAULT_AYANAMSA = "LAHIRI"

# House System
# 'W' = Whole Sign
DEFAULT_HOUSE_SYSTEM = 'W'

# Node type for Rahu: MEAN (traditional Vedic) or TRUE
DEFAULT_NODE_TYPE = "MEAN"

# Ketu calculation mode: "vedic" = Rahu + 180°, "thai" = not yet implemented
DEFAULT_KETU_MODE = "vedic"


