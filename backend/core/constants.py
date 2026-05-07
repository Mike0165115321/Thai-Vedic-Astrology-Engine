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

# Ayanamsa Types (Swiss Ephemeris)
# 1 = Lahiri
# 3 = Raman
# 5 = Krishnamurti
DEFAULT_AYANAMSA = 1 

# House System
# 'W' = Whole Sign
DEFAULT_HOUSE_SYSTEM = 'W'

# Ketu Mode
# "vedic" = (Rahu + 180) % 360
# "thai" = Thai Ketu (9) - Requires separate calculation
DEFAULT_KETU_MODE = "vedic"

