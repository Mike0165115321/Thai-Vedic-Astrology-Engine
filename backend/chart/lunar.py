NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", 
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", 
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", 
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", 
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

def calculate_nakshatra(longitude):
    """
    Calculates the Nakshatra index (1-27) and its name.
    """
    # 13°20' = 13.333333... degrees
    naks_index = int(longitude / (13 + 1/3))
    
    return {
        "index": naks_index + 1,
        "name": NAKSHATRAS[naks_index],
        "pada": int((longitude % (13 + 1/3)) / (3 + 1/3)) + 1
    }

def get_lunar_data(planets_data, lagna_lon):
    """
    Returns Nakshatra data for Moon, Lagna, and optionally all planets.
    """
    moon_lon = planets_data.get("Moon", {}).get("longitude")
    
    lunar_info = {
        "moon_nakshatra": calculate_nakshatra(moon_lon) if moon_lon is not None else None,
        "lagna_nakshatra": calculate_nakshatra(lagna_lon),
        "planet_nakshatras": {name: calculate_nakshatra(data["longitude"]) for name, data in planets_data.items()}
    }
    
    return lunar_info
