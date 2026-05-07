from core.constants import WESTERN_ASPECTS

def calculate_western_aspects(planets_data, custom_orb=None):
    """
    Calculates Western aspects between planets.
    Returns a list of aspects.
    """
    aspect_list = []
    planet_names = list(planets_data.keys())
    
    for i in range(len(planet_names)):
        for j in range(i + 1, len(planet_names)):
            p1 = planet_names[i]
            p2 = planet_names[j]
            
            lon1 = planets_data[p1]["longitude"]
            lon2 = planets_data[p2]["longitude"]
            
            diff = abs(lon1 - lon2)
            if diff > 180:
                diff = 360 - diff
                
            for aspect_name, config in WESTERN_ASPECTS.items():
                angle = config["angle"]
                # Use custom orb if provided, otherwise use the default for the aspect type
                orb = custom_orb if custom_orb is not None else config["orb"]
                
                if abs(diff - angle) <= orb:
                    aspect_list.append({
                        "p1": p1,
                        "p2": p2,
                        "aspect": aspect_name,
                        "angle": angle,
                        "actual_diff": diff,
                        "orb_diff": abs(diff - angle)
                    })
                    
    return aspect_list

def calculate_vedic_aspects(planets_data):
    """
    Calculates Graha Drishti (Vedic Planetary Aspects).
    Vedic aspects are traditionally based on house/sign counts.
    All planets aspect the 7th house.
    Special aspects: Mars (4,8), Jupiter (5,9), Saturn (3,10).
    """
    vedic_aspects = []
    
    special_aspect_rules = {
        "Mars": [4, 7, 8],
        "Jupiter": [5, 7, 9],
        "Saturn": [3, 7, 10],
        # Others default to [7]
    }
    
    for p1_name, p1_data in planets_data.items():
        if p1_name == "Ketu": continue # Ketu traditionally doesn't have drishti or same as Rahu
        
        rules = special_aspect_rules.get(p1_name, [7])
        p1_house = p1_data["house"]
        
        for aspect_count in rules:
            # Targeted House = (P1_House + aspect_count - 2) % 12 + 1
            target_house = (p1_house + aspect_count - 2) % 12 + 1
            
            # Find planets in target house
            targets = [name for name, data in planets_data.items() if data["house"] == target_house and name != p1_name]
            
            vedic_aspects.append({
                "from": p1_name,
                "aspect_count": aspect_count,
                "target_house": target_house,
                "target_planets": targets
            })
            
    return vedic_aspects
