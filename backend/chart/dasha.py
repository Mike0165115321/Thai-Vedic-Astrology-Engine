from datetime import datetime, timedelta

# Planet Order: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury
DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
DASHA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, 
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
}

def calculate_vimshottari_dasha(moon_longitude, birth_datetime):
    """
    Calculates the Vimshottari Dasha timeline from birth.
    birth_datetime: python datetime object
    """
    # 13°20' = 800 minutes
    # Total cycle = 120 years
    naks_index = int(moon_longitude / (13 + 1/3))
    degree_in_naks = moon_longitude % (13 + 1/3)
    
    # Starting planet based on Nakshatra index (0-26)
    # 0, 9, 18 = Ketu
    # 1, 10, 19 = Venus, etc.
    start_planet_idx = naks_index % 9
    
    # Proportion of the first dasha remaining
    # (Total years * remaining distance) / Total distance
    total_naks_deg = 13 + 1/3
    start_planet = DASHA_ORDER[start_planet_idx]
    total_years = DASHA_YEARS[start_planet]
    
    consumed_years = (degree_in_naks / total_naks_deg) * total_years
    remaining_years = total_years - consumed_years
    
    timeline = []
    current_date = birth_datetime - timedelta(days=int(consumed_years * 365.25))
    
    # Generate the 120-year cycle
    # We might want to just start from birth for the UI
    temp_date = current_date
    for i in range(9):
        planet = DASHA_ORDER[(start_planet_idx + i) % 9]
        years = DASHA_YEARS[planet]
        
        end_date = temp_date + timedelta(days=int(years * 365.25))
        
        # Only add to timeline if it's after birth or partially after birth
        if end_date > birth_datetime:
            timeline.append({
                "planet": planet,
                "start": temp_date.isoformat(),
                "end": end_date.isoformat(),
                "is_current": temp_date <= datetime.now() <= end_date
            })
            
        temp_date = end_date
        
    return timeline
