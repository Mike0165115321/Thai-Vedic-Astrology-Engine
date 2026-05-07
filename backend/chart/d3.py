def calculate_drekkana(longitude):
    """
    Mapping Rule: ตรียางค์ (Drekkana D3)
    ตามกฎ: 1-5-9
    - ตรียางค์ต้น (0-10°): ราศีเดิม
    - ตรียางค์กลาง (10-20°): ราศีที่ 5 จากเดิม
    - ตรียางค์ปลาย (20-30°): ราศีที่ 9 จากเดิม
    """
    sign = int(longitude / 30) + 1
    degree_in_sign = longitude % 30
    part = int(degree_in_sign / 10) # 0-2
    
    if part == 0:     # ตรียางค์ต้น
        return sign
    elif part == 1:   # ตรียางค์กลาง (5th sign)
        return (sign + 4 - 1) % 12 + 1
    else:             # ตรียางค์ปลาย (9th sign)
        return (sign + 8 - 1) % 12 + 1
