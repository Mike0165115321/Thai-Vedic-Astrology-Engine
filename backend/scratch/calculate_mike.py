import swisseph as swe
from core.time_utils import get_julian_date, to_utc
from core.ayanamsa import set_ayanamsa
from planets.calculator import get_all_planets
from datetime import datetime

# Birth Data
year, month, day = 2006, 8, 6
hour, minute = 17, 15
lat, lon = 18.78, 100.78
timezone = "Asia/Bangkok"

# Convert to UTC
dt_local = datetime(year, month, day, hour, minute)
dt_utc = to_utc(dt_local, timezone)

# Get JD
jd = get_julian_date(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour, dt_utc.minute, dt_utc.second)

def get_positions(mode):
    set_ayanamsa(mode)
    planets = get_all_planets(jd, ayanamsa_mode=mode)
    return planets

# Calculate both
lahiri = get_positions("LAHIRI")
suriyayart = get_positions("SURYAYART")

# Print Comparison
ZODIAC = ["เมษ", "พฤษภ", "เมถุน", "กรกฎ", "สิงห์", "กันย์", "ตุลย์", "พิจิก", "ธนู", "มังกร", "กุมภ์", "มีน"]

print(f"{'Planet':<10} | {'Lahiri (Vedic)':<20} | {'Suryayart (Thai)':<20}")
print("-" * 55)

for p_name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"]:
    l = lahiri[p_name]
    s = suriyayart[p_name]
    
    l_text = f"{ZODIAC[l['sign']-1]} {l['degree_in_sign']:>5.2f} deg"
    s_text = f"{ZODIAC[s['sign']-1]} {s['degree_in_sign']:>5.2f} deg"
    
    print(f"{p_name:<10} | {l_text:<20} | {s_text:<20}")
