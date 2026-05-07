def calculate_navamsa(longitude):
    """
    Calculates the Navamsa sign index (1-12) for a given longitude.
    D9 chart logic.
    """
    total_navamsas = int(longitude / (30/9)) # 0-107
    nav_index = (total_navamsas % 12) + 1
    return nav_index

def calculate_drekkana(longitude):
    """
    Calculates the Drekkana sign index (1-12) for a given longitude.
    D3 chart logic.
    """
    sign_index = int(longitude / 30) + 1 # 1-12
    degree_in_sign = longitude % 30
    
    if degree_in_sign < 10:
        return sign_index
    elif degree_in_sign < 20:
        # 5th from itself
        return (sign_index + 5 - 2) % 12 + 1
    else:
        # 9th from itself
        return (sign_index + 9 - 2) % 12 + 1

def get_divisional_positions(planets_data, lagna_data=None, division="D9"):
    """
    Calculates divisional positions for all planets and lagna.
    Returns sign index (1-12).
    """
    div_data = {}
    for name, data in planets_data.items():
        lon = data["longitude"]
        if division == "D9":
            div_sign = calculate_navamsa(lon)
        elif division == "D3":
            div_sign = calculate_drekkana(lon)
        else:
            div_sign = int(lon / 30) + 1
            
        div_data[name] = {
            "sign": div_sign,
            "longitude": lon 
        }
    
    div_lagna = None
    if lagna_data:
        lon = lagna_data["longitude"]
        if division == "D9":
            div_sign = calculate_navamsa(lon)
        elif division == "D3":
            div_sign = calculate_drekkana(lon)
        else:
            div_sign = int(lon / 30) + 1
        
        div_lagna = {
            "sign": div_sign,
            "longitude": lon
        }

    return div_data, div_lagna
