def calculate_navamsa(longitude):
    """
    Mapping Rule: นวางค์จักร (Navamsa D9)
    ตามกฎ: จร-นิ่ง-คู่
    - ราศีจร (1,4,7,10): เริ่มจาก ราศีเดิม
    - ราศีคงที่ (2,5,8,11): เริ่มจาก ราศีที่ 9 จากเดิม
    - ราศีคู่ (3,6,9,12): เริ่มจาก ราศีที่ 5 จากเดิม
    """
    sign = int(longitude / 30) + 1       # 1-12
    degree_in_sign = longitude % 30      # 0-30
    part = int(degree_in_sign / (30/9))  # 0-8
    
    if sign in [1, 4, 7, 10]:      # จรราศี (movable)
        start = sign
    elif sign in [2, 5, 8, 11]:    # ราศีคงที่ (fixed)
        start = (sign + 8 - 1) % 12 + 1
    else:                          # ราศีคู่ (dual)
        start = (sign + 4 - 1) % 12 + 1

    return ((start + part - 1) % 12) + 1
