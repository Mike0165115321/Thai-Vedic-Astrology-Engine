import pytest
from core.time_utils import get_julian_date
from core.ayanamsa import set_ayanamsa
from chart.lagna import calculate_lagna
from chart.house_system import calculate_whole_sign_houses
from chart.zodiac_wheel import map_planets_to_houses

def test_lagna_calculation():
    # 2000-01-01 12:00 UTC at 15N, 100E (Near Bangkok)
    jd = get_julian_date(2000, 1, 1, 12, 0)
    lat = 15.0
    lon = 100.0
    
    set_ayanamsa("LAHIRI")
    res = calculate_lagna(jd, lat, lon)
    
    assert "longitude" in res
    assert "sign" in res
    assert 1 <= res["sign"] <= 12
    # For this date/time/loc, Sidereal Lagna is ~ Cancer (4)
    # 12:00 UTC = 19:00 Bangkok time.
    assert res["sign"] == 4 


def test_whole_sign_houses():
    # Lagna in Aries (1)
    houses = calculate_whole_sign_houses(1)
    
    assert houses["1"] == 1 # Aries
    assert houses["2"] == 2 # Taurus
    assert houses["12"] == 12 # Pisces
    
    # Lagna in Pisces (12)
    houses_pisces = calculate_whole_sign_houses(12)
    assert houses_pisces["1"] == 12
    assert houses_pisces["2"] == 1 # Aries

def test_planet_mapping():
    planets = {
        "Sun": {"sign": 1}, # Aries
        "Moon": {"sign": 2} # Taurus
    }
    lagna_sign = 1 # Aries
    
    mapped = map_planets_to_houses(planets, lagna_sign)
    
    assert mapped["Sun"]["house"] == 1
    assert mapped["Moon"]["house"] == 2
    
    # Lagna in Taurus (2)
    lagna_sign_2 = 2
    mapped_2 = map_planets_to_houses(planets, lagna_sign_2)
    assert mapped_2["Sun"]["house"] == 12 # Aries is 12th from Taurus
    assert mapped_2["Moon"]["house"] == 1 # Taurus is 1st from Taurus
