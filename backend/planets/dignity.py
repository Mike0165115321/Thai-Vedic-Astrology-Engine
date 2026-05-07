from core.constants import PLANET_RELATIONSHIPS

# Thai-Vedic Planet Dignities (Fixed Signs)
DIGNITY_RULES = {
    # Planet: { 'exalted': sign_idx, 'debilitated': sign_idx, 'own': [sign_indices], 'moolatrikona': {sign_idx: (start_deg, end_deg)} }
    0: {'exalted': 0, 'debilitated': 6, 'own': [4], 'moolatrikona': {4: (0, 20)}}, # Sun
    1: {'exalted': 1, 'debilitated': 7, 'own': [3], 'moolatrikona': {1: (3, 30)}}, # Moon
    2: {'exalted': 9, 'debilitated': 3, 'own': [0, 7], 'moolatrikona': {0: (0, 12)}}, # Mars
    3: {'exalted': 5, 'debilitated': 11, 'own': [2, 5], 'moolatrikona': {5: (15, 20)}}, # Mercury
    4: {'exalted': 3, 'debilitated': 9, 'own': [8, 11], 'moolatrikona': {8: (0, 10)}}, # Jupiter
    5: {'exalted': 11, 'debilitated': 5, 'own': [1, 6], 'moolatrikona': {6: (0, 15)}}, # Venus
    6: {'exalted': 6, 'debilitated': 0, 'own': [9, 10], 'moolatrikona': {10: (0, 20)}}, # Saturn
    7: {'exalted': 1, 'debilitated': 7, 'own': [10], 'moolatrikona': {}}, # Rahu (Ex/Deb vary)
}

def get_dignity(planet_id, longitude):
    """
    Calculates the dignity of a planet based on its position.
    Pure computation of status.
    """
    sign_index = int(longitude / 30)
    degree_in_sign = longitude % 30
    rules = DIGNITY_RULES.get(planet_id)
    
    if not rules:
        return "Normal"
    
    # 1. Exaltation / Debilitation
    if sign_index == rules['exalted']:
        return "Exalted (อุจจ์)"
    if sign_index == rules['debilitated']:
        return "Debilitated (นิจ)"
    
    # 2. Moolatrikona
    mt = rules.get('moolatrikona', {})
    if sign_index in mt:
        start, end = mt[sign_index]
        if start <= degree_in_sign <= end:
            return "Moolatrikona (มูลตรีโกณ)"
            
    # 3. Own Sign
    if sign_index in rules['own']:
        return "Own Sign (เกษตร)"
    
    # 4. Based on Relationships (Natural)
    # Note: Temporal relationships require the full chart, so we'll stick to Natural for now.
    # In Vedic, Sign Lord relationship determines status.
    # Sign Lords (0-11) -> Planet ID
    SIGN_LORDS = [0, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4] # Simplified
    # Correct Sign Lords: 0:Aries(Mars=2), 1:Taurus(Venus=5), 2:Gemini(Merc=3), 3:Cancer(Moon=1), 
    # 4:Leo(Sun=0), 5:Virgo(Merc=3), 6:Libra(Venus=5), 7:Scorpio(Mars=2), 
    # 8:Sag(Jup=4), 9:Cap(Sat=6), 10:Aqu(Sat=6), 11:Pis(Jup=4)
    SIGN_LORDS_ACTUAL = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4]
    
    lord_id = SIGN_LORDS_ACTUAL[sign_index]
    rel = PLANET_RELATIONSHIPS.get(planet_id, {})
    
    if lord_id in rel.get('friends', []):
        return "Friend (มิตร)"
    if lord_id in rel.get('enemies', []):
        return "Enemy (ศัตรู)"
    if lord_id in rel.get('neutrals', []):
        return "Neutral (กลาง)"
        
    return "Normal"

