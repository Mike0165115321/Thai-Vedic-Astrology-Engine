def calculate_navamsa(longitude):
    """
    Calculates the Navamsa sign index (1-12) for a given longitude.
    D9 chart logic.
    """
    sign_index = int(longitude / 30) # 0-11
    total_navamsas = int(longitude / (30/9)) # 0-107
    
    # Sign cycle: 1=Aries, ..., 12=Pisces
    # Navamsa index = (total_navamsas % 12) + 1
    # But wait, the starting point depends on the element of the sign.
    # Standard Navamsa calculation:
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

def get_divisional_positions(planets_data, division="D9"):
    """
    Calculates divisional positions for all planets.
    """
    div_data = {}
    for name, data in planets_data.items():
        lon = data["longitude"]
        if division == "D9":
            div_sign = calculate_navamsa(lon)
        elif division == "D3":
            div_sign = calculate_drekkana(lon)
        else:
            div_sign = data["sign"] # D1
            
        div_data[name] = {
            "sign": div_sign,
            "longitude": lon # Keeping original lon or should we calc relative?
        }
    return div_data
