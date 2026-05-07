def calculate_dwadasamsa(longitude):
    """
    Mapping Rule: D12 - Starts from the sign itself
    """
    sign_index = int(longitude / 30) + 1
    degree_in_sign = longitude % 30
    part_index = int(degree_in_sign / 2.5) # 0-11
    
    return (sign_index + part_index - 1) % 12 + 1
