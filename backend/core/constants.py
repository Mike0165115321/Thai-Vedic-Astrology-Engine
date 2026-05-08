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
    9: {"name": "Uranus", "thai_name": "มฤตยู", "symbol": "๐"},
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

# Mean Daily Motion (degrees per day)
PLANET_MEAN_SPEEDS = {
    0: 0.9856,    # Sun
    1: 13.1764,   # Moon
    2: 0.5241,    # Mars
    3: 1.3833,    # Mercury
    4: 0.0831,    # Jupiter
    5: 1.2000,    # Venus
    6: 0.0335,    # Saturn
    7: 0.0529,    # Rahu/Ketu (Mean)
}

# Combustion Orbs (degrees) - Traditional Vedic
COMBUSTION_ORBS = {
    1: 12,    # Moon
    2: 17,    # Mars
    3: 13,    # Mercury (12 if Retrograde)
    4: 11,    # Jupiter
    5: 9,     # Venus (8 if Retrograde)
    6: 15,    # Saturn
}

# Natural Relationships (Vedic)
# Planet: { 'friends': [], 'enemies': [], 'neutrals': [] }
PLANET_RELATIONSHIPS = {
    0: {'friends': [1, 2, 4], 'enemies': [5, 6], 'neutrals': [3]}, # Sun
    1: {'friends': [0, 3], 'enemies': [], 'neutrals': [2, 4, 5, 6]}, # Moon
    2: {'friends': [0, 1, 4], 'enemies': [3], 'neutrals': [5, 6]}, # Mars
    3: {'friends': [0, 5], 'enemies': [1], 'neutrals': [2, 4, 6]}, # Mercury
    4: {'friends': [0, 1, 2], 'enemies': [3, 5], 'neutrals': [6]}, # Jupiter
    5: {'friends': [3, 6], 'enemies': [0, 1], 'neutrals': [2, 4]}, # Venus
    6: {'friends': [3, 5], 'enemies': [0, 1, 2], 'neutrals': [4]}, # Saturn
}

# Western Aspect Orbs (degrees)
WESTERN_ASPECTS = {
    "Conjunction": {"angle": 0, "orb": 8},
    "Sextile": {"angle": 60, "orb": 6},
    "Square": {"angle": 90, "orb": 7},
    "Trine": {"angle": 120, "orb": 8},
    "Opposition": {"angle": 180, "orb": 8},
}




