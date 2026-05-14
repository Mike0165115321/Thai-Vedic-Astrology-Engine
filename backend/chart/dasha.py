from datetime import datetime, timedelta
import pytz

# Planet Order: Ketu, Venus, Sun, Moon, Mars, Rahu, Jupiter, Saturn, Mercury
DASHA_ORDER = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"]
DASHA_YEARS = {
    "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, 
    "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
}

def calculate_vimshottari_dasha(moon_longitude, birth_datetime):
    """
    Calculates the Vimshottari Dasha timeline from birth (Mahadasha & Antardasha).
    Uses high-precision floating point for durations to prevent date drift.
    """
    DAYS_IN_YEAR = 365.2422
    NAKS_DEG = 13.333333333333334
    
    naks_index = int(moon_longitude / NAKS_DEG)
    degree_in_naks = moon_longitude % NAKS_DEG
    
    start_planet_idx = naks_index % 9
    start_planet = DASHA_ORDER[start_planet_idx]
    total_years = DASHA_YEARS[start_planet]
    
    consumed_years = (degree_in_naks / NAKS_DEG) * total_years
    now_utc = datetime.now(pytz.UTC)
    
    # Start from the beginning of the first dasha in the cycle (no int truncation)
    cycle_start_date = birth_datetime - timedelta(days=consumed_years * DAYS_IN_YEAR)
    
    timeline = []
    temp_mahadasha_date = cycle_start_date
    
    for i in range(9):
        m_planet = DASHA_ORDER[(start_planet_idx + i) % 9]
        m_years = DASHA_YEARS[m_planet]
        m_end_date = temp_mahadasha_date + timedelta(days=m_years * DAYS_IN_YEAR)
        
        # Only process if this Mahadasha ends after birth
        if m_end_date > birth_datetime:
            # --- Calculate Antardashas for this Mahadasha ---
            antardashas = []
            temp_antardasha_date = temp_mahadasha_date
            
            # Antardasha starts with the same planet as Mahadasha and follows the order
            m_planet_order_idx = DASHA_ORDER.index(m_planet)
            
            for j in range(9):
                a_planet = DASHA_ORDER[(m_planet_order_idx + j) % 9]
                a_years = DASHA_YEARS[a_planet]
                # Formula: (Mahadasha Years * Antardasha Years) / 120
                a_duration_days = (m_years * a_years * DAYS_IN_YEAR) / 120
                a_end_date = temp_antardasha_date + timedelta(days=a_duration_days)
                
                # Only add Antardasha if it overlaps with post-birth period
                if a_end_date > birth_datetime:
                    antardashas.append({
                        "planet": a_planet,
                        "start": max(temp_antardasha_date, birth_datetime).isoformat(),
                        "end": a_end_date.isoformat(),
                        "is_current": max(temp_antardasha_date, birth_datetime) <= now_utc <= a_end_date
                    })
                
                temp_antardasha_date = a_end_date

            timeline.append({
                "planet": m_planet,
                "start": max(temp_mahadasha_date, birth_datetime).isoformat(),
                "end": m_end_date.isoformat(),
                "duration": m_years,
                "is_current": max(temp_mahadasha_date, birth_datetime) <= now_utc <= m_end_date,
                "antardashas": antardashas
            })
            
        temp_mahadasha_date = m_end_date
        
    return timeline
