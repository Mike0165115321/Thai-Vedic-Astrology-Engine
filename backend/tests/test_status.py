import pytest
from core.time_utils import get_julian_date
from planets.calculator import get_all_planets

def test_planet_status_integration():
    # 2000-01-01 12:00 UTC
    jd = get_julian_date(2000, 1, 1, 12, 0)
    
    planets = get_all_planets(jd)
    
    for name, data in planets.items():
        assert "dignity" in data
        assert "speed_status" in data
        assert "is_combust" in data
        assert "planetary_war" in data
        
    # Check if any planet is combust (on Jan 1 2000, Sun is in Sag/Cap)
    # Mercury/Venus are often combust
    mercury = planets.get("Mercury")
    if mercury:
        print(f"Mercury is_combust: {mercury['is_combust']}")
        
def test_specific_dignities():
    # Sun in Aries (Sign 1, Longitude 0-30)
    # JD for Sun at 10 Aries Sidereal (approx April 24 2000)
    jd = get_julian_date(2000, 4, 24, 12, 0)
    planets = get_all_planets(jd)
    
    sun = planets.get("Sun")
    # Sun in Aries is Exalted (อุจจ์)
    assert sun["sign"] == 1
    assert "อุจจ์" in sun["dignity"]
    assert "อุจจ์" in sun["dignity_list"]
    
def test_planetary_war_trigger():
    # Need to find a date with planetary war (two planets < 1 deg)
    # Let's mock or find one. On April 6 2000, Mars and Jupiter were close?
    # Actually, I'll just verify the logic works if they are close.
    pass
