import swisseph as swe
from core.time_utils import get_julian_date, to_utc
from core.ayanamsa import set_ayanamsa
from chart.lagna import calculate_lagna
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

# Calculate Lahiri
set_ayanamsa("LAHIRI")
ayanamsa_val = swe.get_ayanamsa_ut(jd)
lagna = calculate_lagna(jd, lat, lon, ayanamsa_mode="LAHIRI")
planets = get_all_planets(jd, ayanamsa_mode="LAHIRI")

print(f"Lahiri Ayanamsa: {ayanamsa_val:.4f} ({int(ayanamsa_val)} deg {int((ayanamsa_val%1)*60)} min)")
print(f"Lahiri Lagna: {lagna['longitude']:.4f} (Sign {lagna['sign']}, {lagna['degree_in_sign']:.4f} deg)")
for p in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu"]:
    pos = planets[p]
    print(f"{p:<10}: {pos['longitude']:.4f} ({pos['sign']}, {pos['degree_in_sign']:.4f})")
