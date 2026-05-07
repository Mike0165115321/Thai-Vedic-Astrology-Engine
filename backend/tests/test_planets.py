import pytest
import json
import os
from core.time_utils import get_julian_date
from planets.calculator import get_all_planets
import swisseph as swe

def load_fixtures():
    fixture_path = os.path.join(os.path.dirname(__file__), "fixtures", "known_charts.json")
    with open(fixture_path, "r") as f:
        return json.load(f)

def test_planet_positions_structure():
    """Verify that all 9 planets are returned with correct fields."""
    jd = get_julian_date(2024, 5, 7, 10, 0) # Some date
    planets = get_all_planets(jd)
    
    expected_planets = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]
    
    for p in expected_planets:
        assert p in planets
        assert "longitude" in planets[p]
        assert "is_retrograde" in planets[p]
        assert 0 <= planets[p]["longitude"] < 360

@pytest.mark.parametrize("chart", load_fixtures())
def test_accuracy_against_known_charts(chart):
    """Verify planetary positions against high-precision fixtures."""
    jd = chart["jd"]
    ayanamsa_mode = chart["ayanamsa_name"]
    expected_planets = chart["planets"]
    
    calculated_planets = get_all_planets(jd, ayanamsa_mode=ayanamsa_mode)
    
    for planet_name, expected_lon in expected_planets.items():
        calculated_lon = calculated_planets[planet_name]["longitude"]
        # Use approx for floating point comparisons with high precision
        assert pytest.approx(calculated_lon, abs=0.000001) == expected_lon

def test_custom_ayanamsa():
    """Verify that custom ayanamsa offset works correctly."""
    jd = get_julian_date(2000, 1, 1, 12, 0)
    
    # Calculate with LAHIRI (~23.857)
    lahiri_results = get_all_planets(jd, ayanamsa_mode="LAHIRI")
    
    # Calculate with CUSTOM offset (e.g., 20.0)
    custom_offset = 20.0
    custom_results = get_all_planets(jd, ayanamsa_mode="CUSTOM", custom_ayanamsa_offset=custom_offset)
    
    # The difference in longitude should be (Lahiri_Ayanamsa - Custom_Offset)
    # Tropical_Lon = Sidereal_Lon + Ayanamsa
    # So, Sidereal_Lon_1 + Ayanamsa_1 = Sidereal_Lon_2 + Ayanamsa_2
    # Sidereal_Lon_Custom = Sidereal_Lon_Lahiri + Lahiri_Ayanamsa - Custom_Offset
    
    lahiri_ayanamsa = 23.857092353708822
    expected_sun_custom = (lahiri_results["Sun"]["longitude"] + lahiri_ayanamsa - custom_offset) % 360
    
    assert pytest.approx(custom_results["Sun"]["longitude"], abs=0.000001) == expected_sun_custom

def test_ketu_opposite_rahu():
    """Verify Ketu is always exactly 180 degrees from Rahu in Vedic mode."""
    jd = get_julian_date(1995, 6, 15, 12, 0)
    # Default is vedic
    planets = get_all_planets(jd, ketu_mode="vedic")
    
    rahu = planets["Rahu"]["longitude"]
    ketu = planets["Ketu"]["longitude"]
    
    diff = abs(rahu - ketu)
    # Should be 180 or 180 (handling wrap around)
    assert pytest.approx(diff, abs=0.0001) == 180 or pytest.approx(diff, abs=0.0001) == 180

def test_thai_ketu_not_implemented():
    """Verify that Thai Ketu mode raises NotImplementedError."""
    jd = get_julian_date(2000, 1, 1, 12, 0)
    with pytest.raises(NotImplementedError, match="Thai Ketu"):
        get_all_planets(jd, ketu_mode="thai")


