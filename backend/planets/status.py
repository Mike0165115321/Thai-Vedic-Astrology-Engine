from core.constants import PLANET_MEAN_SPEEDS, COMBUSTION_ORBS

def calculate_combustion(planets_data):
    """
    Checks if planets are combust (too close to the Sun).
    Modifies planets_data in-place or returns updated? 
    Rule 2 says don't mutate, so we'll return updated or let the caller handle.
    Actually, we'll return a dict of statuses.
    """
    sun_lon = planets_data.get("Sun", {}).get("longitude")
    if sun_lon is None:
        return {}
        
    statuses = {}
    for name, data in planets_data.items():
        if name == "Sun" or name == "Rahu" or name == "Ketu":
            continue
            
        p_id = data.get("id") # We might need to add ID to the planet data
        # If ID not available, we map by name
        name_to_id = {"Moon": 1, "Mars": 2, "Mercury": 3, "Jupiter": 4, "Venus": 5, "Saturn": 6}
        p_id = p_id or name_to_id.get(name)
        
        if p_id is None:
            continue
            
        orb = COMBUSTION_ORBS.get(p_id, 15)
        diff = abs(data["longitude"] - sun_lon)
        if diff > 180:
            diff = 360 - diff
            
        if diff <= orb:
            statuses[name] = True
            
    return statuses

def calculate_planetary_war(planets_data):
    """
    Checks if two planets (Mars to Saturn) are within 1 degree.
    """
    war_planets = ["Mars", "Mercury", "Jupiter", "Venus", "Saturn"]
    wars = []
    
    for i in range(len(war_planets)):
        for j in range(i + 1, len(war_planets)):
            p1 = war_planets[i]
            p2 = war_planets[j]
            
            lon1 = planets_data[p1]["longitude"]
            lon2 = planets_data[p2]["longitude"]
            
            diff = abs(lon1 - lon2)
            if diff > 180:
                diff = 360 - diff
                
            if diff <= 1.0:
                # Winner is the one with lower longitude (Vedic rule) 
                # or higher latitude (some traditions). 
                # For pure computation, we just mark the war.
                wars.append({"planets": [p1, p2], "diff": diff})
                
    return wars

def get_speed_status(planet_name, speed):
    """
    Compares current speed with mean speed.
    """
    name_to_id = {"Sun": 0, "Moon": 1, "Mars": 2, "Mercury": 3, "Jupiter": 4, "Venus": 5, "Saturn": 6, "Rahu": 7, "Ketu": 7}
    p_id = name_to_id.get(planet_name)
    
    if p_id is None:
        return "Normal"
        
    mean_speed = PLANET_MEAN_SPEEDS.get(p_id)
    if mean_speed is None:
        return "Normal"
        
    abs_speed = abs(speed)
    if abs_speed < 0.0001:
        return "Stationary (หยุด)"
    if abs_speed > mean_speed * 1.1:
        return "Fast (เร็ว)"
    if abs_speed < mean_speed * 0.9:
        return "Slow (ช้า)"
        
    return "Normal"
