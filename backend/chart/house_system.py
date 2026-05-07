def calculate_whole_sign_houses(lagna_sign):
    """
    Given the sign index of the Lagna (1-12), 
    returns a list of signs for each house (1-12).
    House 1 is the sign of the Lagna.
    """
    houses = {}
    for house_num in range(1, 13):
        # Sign = (LagnaSign + house_num - 2) % 12 + 1
        sign = (lagna_sign + house_num - 2) % 12 + 1
        houses[house_num] = sign
        
    return houses
