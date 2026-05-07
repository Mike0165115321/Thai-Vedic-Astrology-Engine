import pytest
from chart.aspects import calculate_western_aspects, calculate_vedic_aspects

def test_western_aspects():
    planets = {
        "Sun": {"longitude": 0},
        "Moon": {"longitude": 120} # Trine
    }
    
    aspects = calculate_western_aspects(planets)
    assert len(aspects) == 1
    assert aspects[0]["aspect"] == "Trine"

def test_vedic_aspects_special():
    # Mars in 1st house (Aries) aspects 4, 7, 8
    planets = {
        "Mars": {"house": 1, "longitude": 10},
        "Jupiter": {"house": 4, "longitude": 100}, # Aspect 4
        "Venus": {"house": 8, "longitude": 220},  # Aspect 8
        "Saturn": {"house": 7, "longitude": 190}  # Aspect 7
    }
    
    aspects = calculate_vedic_aspects(planets)
    
    mars_aspects = [a for a in aspects if a["from"] == "Mars"]
    assert len(mars_aspects) == 3
    
    # Check if target planets are caught
    house_4_aspect = [a for a in mars_aspects if a["target_house"] == 4][0]
    assert "Jupiter" in house_4_aspect["target_planets"]
    
    house_8_aspect = [a for a in mars_aspects if a["target_house"] == 8][0]
    assert "Venus" in house_8_aspect["target_planets"]
