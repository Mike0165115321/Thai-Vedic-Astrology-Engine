def map_planets_to_houses(planets_data, lagna_sign):
    """
    Determines the house for each planet based on its sign and the Lagna sign.
    Uses Whole Sign House system.
    Both inputs should be 1-based indices (1-12).

    Returns a NEW dict — does not mutate the input.
    """
    result = {}
    for planet_name, data in planets_data.items():
        planet_sign = data["sign"]
        # House = (PlanetSign - LagnaSign) % 12 + 1
        house = (planet_sign - lagna_sign) % 12 + 1
        result[planet_name] = {**data, "house": house}

    return result
