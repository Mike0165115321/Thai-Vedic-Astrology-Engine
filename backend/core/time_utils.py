import swisseph as swe
from datetime import datetime
import pytz

def get_julian_date(year, month, day, hour=0, minute=0, second=0):
    """Converts Gregorian date to Julian Date."""
    return swe.julday(year, month, day, hour + minute/60.0 + second/3600.0)

def get_delta_t(jd):
    """Returns Delta T for a given Julian Date."""
    return swe.deltat(jd)

def to_utc(dt, timezone_str):
    """Converts a local datetime to UTC."""
    local_tz = pytz.timezone(timezone_str)
    local_dt = local_tz.localize(dt)
    return local_dt.astimezone(pytz.UTC)
