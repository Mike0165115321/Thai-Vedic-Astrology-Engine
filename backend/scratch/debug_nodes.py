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
jd = get_julian_date(dt_utc.year, dt_utc.month, dt_utc.day, dt_utc.hour, dt_utc.minute, dt_utc.second)

ZODIAC = ["เมษ", "พฤษภ", "เมถุน", "กรกฎ", "สิงห์", "กันย์", "ตุลย์", "พิจิก", "ธนู", "มังกร", "กุมภ์", "มีน"]

# Test Case 1: MYHORO with Vedic Ketu (Should be opposite)
print("--- Case 1: MYHORO + Vedic Ketu ---")
planets_v = get_all_planets(jd, ayanamsa_mode="MYHORO", ketu_mode="vedic")
r = planets_v["Rahu"]
k = planets_v["Ketu"]
print(f"Rahu: {ZODIAC[r['sign']-1]} {r['degree_in_sign']:.2f} deg (Total: {r['longitude']:.2f})")
print(f"Ketu: {ZODIAC[k['sign']-1]} {k['degree_in_sign']:.2f} deg (Total: {k['longitude']:.2f})")
print(f"Diff: {abs(r['longitude'] - k['longitude']):.2f} deg")

print("\n--- Case 2: MYHORO + Thai Ketu (The 'Adjacent' problem) ---")
planets_t = get_all_planets(jd, ayanamsa_mode="MYHORO", ketu_mode="thai")
r2 = planets_t["Rahu"]
k2 = planets_t["Ketu"]
print(f"Rahu: {ZODIAC[r2['sign']-1]} {r2['degree_in_sign']:.2f} deg (Total: {r2['longitude']:.2f})")
print(f"Ketu: {ZODIAC[k2['sign']-1]} {k2['degree_in_sign']:.2f} deg (Total: {k2['longitude']:.2f})")
print(f"Diff: {abs(r2['longitude'] - k2['longitude']):.2f} deg")
