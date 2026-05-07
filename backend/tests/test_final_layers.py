import pytest
import pytz
from datetime import datetime
from chart.divisional import calculate_navamsa, calculate_drekkana
from chart.lunar import calculate_nakshatra
from chart.dasha import calculate_vimshottari_dasha

def test_divisional_logic():
    # 5° Aries (sign 1, 0-30)
    # Navamsa 1st = 0 - 3°20', 2nd = 3°20' - 6°40'
    assert calculate_navamsa(5.0) == 2 # 2nd Navamsa
    
    # 15° Aries
    # Drekkana 1st = 0-10, 2nd = 10-20
    # 2nd Drekkana of Aries is Leo (5)
    assert calculate_drekkana(15.0) == 5

def test_nakshatra_logic():
    # 0° Aries = Ashwini
    naks = calculate_nakshatra(0.0)
    assert naks["name"] == "Ashwini"
    assert naks["index"] == 1
    assert naks["pada"] == 1
    
    # 14° Aries = Bharani (starts at 13°20')
    naks2 = calculate_nakshatra(14.0)
    assert naks2["name"] == "Bharani"
    assert naks2["index"] == 2

def test_dasha_logic():
    # If Moon is at 0° Aries, first dasha is Ketu
    birth_dt = datetime(2000, 1, 1, 12, 0, tzinfo=pytz.UTC)
    timeline = calculate_vimshottari_dasha(0.0, birth_dt)
    
    assert timeline[0]["planet"] == "Ketu"
    assert "2000-01-01" in timeline[0]["start"]
