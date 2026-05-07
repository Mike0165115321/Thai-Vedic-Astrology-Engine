# Thai-Vedic Planet Dignities

DIGNITY_RULES = {
    # Planet: { 'exalted': sign_index, 'debilitated': sign_index, 'own': [sign_indices] }
    0: {'exalted': 0, 'debilitated': 6, 'own': [4]}, # Sun: Ex in Aries, Deb in Libra, Own in Leo
    1: {'exalted': 1, 'debilitated': 7, 'own': [3]}, # Moon: Ex in Taurus, Deb in Scorpio, Own in Cancer
    2: {'exalted': 9, 'debilitated': 3, 'own': [0, 7]}, # Mars: Ex in Cap, Deb in Cancer, Own in Aries/Scorpio
    3: {'exalted': 5, 'debilitated': 11, 'own': [2, 5]}, # Mercury: Ex in Virgo, Deb in Pisces, Own in Gemini/Virgo
    4: {'exalted': 3, 'debilitated': 9, 'own': [8, 11]}, # Jupiter: Ex in Cancer, Deb in Cap, Own in Sag/Pisces
    5: {'exalted': 11, 'debilitated': 5, 'own': [1, 6]}, # Venus: Ex in Pisces, Deb in Virgo, Own in Taurus/Libra
    6: {'exalted': 6, 'debilitated': 0, 'own': [9, 10]}, # Saturn: Ex in Libra, Deb in Aries, Own in Cap/Aquarius
    7: {'exalted': 1, 'debilitated': 7, 'own': [10]}, # Rahu: Ex in Taurus, Deb in Scorpio, Own in Aquarius (Vedic)
}

def get_dignity(planet_id, longitude):
    sign_index = int(longitude / 30)
    rules = DIGNITY_RULES.get(planet_id)
    
    if not rules:
        return "Normal"
    
    if sign_index == rules['exalted']:
        return "Exalted (อุจจ์)"
    if sign_index == rules['debilitated']:
        return "Debilitated (นิจ)"
    if sign_index in rules['own']:
        return "Own Sign (เกษตร)"
    
    return "Normal"
