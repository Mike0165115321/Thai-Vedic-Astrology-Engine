def map_planets_to_houses(planets_data, lagna_sign):
    """
    Determines the house for each planet based on its sign and the Lagna sign.
    Using Whole Sign House system.
    """
    for planet_name, data in planets_data.items():
        planet_sign = data["sign"]
        # House = (PlanetSign - LagnaSign) % 12 + 1
        house = (planet_sign - lagna_sign) % 12 + 1
        data["house"] = house
        
    return planets_data
