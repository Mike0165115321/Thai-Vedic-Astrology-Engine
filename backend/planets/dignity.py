# Thai Traditional Planetary Dignities (มาตรฐานดาวไทยดั้งเดิม)

# Planet IDs: 0:Sun, 1:Moon, 2:Mars, 3:Merc, 4:Jup, 5:Ven, 6:Sat, 7:Rahu
# Sign Indices: 0:Aries, 1:Taurus, 2:Gemini, 3:Cancer, 4:Leo, 5:Virgo, 
# 6:Libra, 7:Scorpio, 8:Sagittarius, 9:Capricorn, 10:Aquarius, 11:Pisces

THAI_TRADITIONAL_DIGNITIES = {

    # ☉ Sun
    0: {
        'เกษตร': [4],
        'ประ': [10],
        'อุจจ์': [0],
        'นิจ': [6],
        'มูลตรีโกณ': {'sign': 4, 'start': 0, 'end': 20},

        'มหาอุจจ์': {0: 10},
        'มหานิจ': {6: 10},

        'มหาจักร': [3],
        'จุลจักร': [8],
        'ราชาโชค': [2],
        'เทวีโชค': [7],

        'มิตร': [3, 0, 8],
        'ศัตรู': [5, 6],
        'สม': [2, 4, 7, 9, 10, 11]
    },

    # ☽ Moon
    1: {
        'เกษตร': [3],
        'ประ': [9],
        'อุจจ์': [1],
        'นิจ': [7],
        'มูลตรีโกณ': {'sign': 1, 'start': 4, 'end': 30},

        'มหาอุจจ์': {1: 3},
        'มหานิจ': {7: 3},

        'มหาจักร': [4],
        'จุลจักร': [9],
        'ราชาโชค': [3],
        'เทวีโชค': [8],

        'มิตร': [4, 3],
        'ศัตรู': [],
        'สม': [0,2,5,6,7,8,9,10,11]
    },

    # ♂ Mars
    2: {
        'เกษตร': [0, 7],
        'ประ': [6, 1],
        'อุจจ์': [9],
        'นิจ': [3],

        'มูลตรีโกณ': {'sign': 0, 'start': 0, 'end': 12},

        'มหาอุจจ์': {9: 28},
        'มหานิจ': {3: 28},

        'มหาจักร': [2],
        'จุลจักร': [11],
        'ราชาโชค': [1],
        'เทวีโชค': [9],

        'มิตร': [0,3,4,8],
        'ศัตรู': [3,5],
        'สม': [1,2,6,7,9,10,11]
    },

    # ☿ Mercury
    3: {
        'เกษตร': [2,5],
        'ประ': [8,11],
        'อุจจ์': [5],
        'นิจ': [11],

        'มูลตรีโกณ': {'sign': 5, 'start': 16, 'end': 20},

        'มหาอุจจ์': {5: 15},
        'มหานิจ': {11: 15},

        'มหาจักร': [1],
        'จุลจักร': [0],
        'ราชาโชค': [4],
        'เทวีโชค': [6],

        'มิตร': [0,5],
        'ศัตรู': [1],
        'สม': [2,3,4,6,7,8,9,10,11]
    },

    # ♃ Jupiter
    4: {
        'เกษตร': [8,11],
        'ประ': [2,5],
        'อุจจ์': [3],
        'นิจ': [9],

        'มูลตรีโกณ': {'sign': 8, 'start': 0, 'end': 10},

        'มหาอุจจ์': {3: 5},
        'มหานิจ': {9: 5},

        'มหาจักร': [7],
        'จุลจักร': [2],
        'ราชาโชค': [0],
        'เทวีโชค': [10],

        'มิตร': [0,1,2,7],
        'ศัตรู': [3,5],
        'สม': [4,6,8,9,10,11]
    },

    # ♀ Venus
    5: {
        'เกษตร': [1,6],
        'ประ': [7,0],
        'อุจจ์': [11],
        'นิจ': [5],

        'มูลตรีโกณ': {'sign': 6, 'start': 0, 'end': 15},

        'มหาอุจจ์': {11: 27},
        'มหานิจ': {5: 27},

        'มหาจักร': [10],
        'จุลจักร': [3],
        'ราชาโชค': [8],
        'เทวีโชค': [5],

        'มิตร': [2,5,6],
        'ศัตรู': [0,1],
        'สม': [3,4,7,8,9,10,11]
    },

    # ♄ Saturn
    6: {
        'เกษตร': [9,10],
        'ประ': [3,4],
        'อุจจ์': [6],
        'นิจ': [0],

        'มูลตรีโกณ': {'sign': 10, 'start': 0, 'end': 20},

        'มหาอุจจ์': {6: 20},
        'มหานิจ': {0: 20},

        'มหาจักร': [8],
        'จุลจักร': [4],
        'ราชาโชค': [7],
        'เทวีโชค': [0],

        'มิตร': [2,5,10],
        'ศัตรู': [0,1,3],
        'สม': [4,6,7,8,9,11]
    },

    # ☊ Rahu
    7: {
        'เกษตร': [10],
        'ประ': [4],
        'อุจจ์': [1],
        'นิจ': [7],
        'มหาจักร': [3],
        'จุลจักร': [8],
        'ราชาโชค': [11],
        'เทวีโชค': [7],
        'มิตร': [4,6,10],
        'ศัตรู': [0,1],
        'สม': [2,3,5,7,8,9,11]
    },

    # ☋ Ketu (Vedic Ketu in Thai Context)
    8: {
        'เกษตร': [7],
        'ประ': [1],
        'อุจจ์': [7],
        'นิจ': [1],
        'มหาจักร': [9],
        'จุลจักร': [3],
        'ราชาโชค': [5],
        'เทวีโชค': [11],
        'มิตร': [4,6],
        'ศัตรู': [0,1,3],
        'สม': [2,5,7,8,9,10]
    }
}

def get_dignity(planet_id, longitude):
    """
    Calculates Thai Traditional Planetary Dignity including Deep Exaltation (มหาอุจจ์)
    """
    sign_index = int(longitude / 30)
    degree_in_sign = longitude % 30
    
    rules = THAI_TRADITIONAL_DIGNITIES.get(planet_id)
    if not rules:
        return ["ปกติ"]
        
    status_list = []
    
    # 1. มหาอุจจ์ (Deep Exaltation) - Check precise degree with 1 degree orb
    mahaucha = rules.get('มหาอุจจ์', {})
    if sign_index in mahaucha:
        target_deg = mahaucha[sign_index]
        if abs(degree_in_sign - target_deg) <= 1.0:
            status_list.append("มหาอุจจ์")

    # 2. มูลตรีโกณ (Moolatrikona)
    mool = rules.get('มูลตรีโกณ')
    if mool:
        if isinstance(mool, list):
            if sign_index in mool:
                status_list.append("มูลตรีโกณ")
        elif isinstance(mool, dict):
            if sign_index == mool['sign'] and mool['start'] <= degree_in_sign <= mool['end']:
                status_list.append("มูลตรีโกณ")

    # 3. มาตรฐานอื่นๆ
    if sign_index in rules.get('อุจจ์', []) and "มหาอุจจ์" not in status_list: 
        status_list.append("อุจจ์")
        
    if sign_index in rules.get('นิจ', []): status_list.append("นิจ")
    if sign_index in rules.get('เกษตร', []): status_list.append("เกษตร")
    if sign_index in rules.get('ประ', []): status_list.append("ประ")
    if sign_index in rules.get('มหาจักร', []): status_list.append("มหาจักร")
    if sign_index in rules.get('จุลจักร', []): status_list.append("จุลจักร")
    if sign_index in rules.get('ราชาโชค', []): status_list.append("ราชาโชค")
    if sign_index in rules.get('เทวีโชค', []): status_list.append("เทวีโชค")

    # 4. เกษตรจากเจ้าเรือน (SIGN_LORDS fallback)
    SIGN_LORDS = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4]
    lord_id = SIGN_LORDS[sign_index]
    if planet_id == lord_id and "เกษตร" not in status_list:
        status_list.append("เกษตร")

    if not status_list:
        return ["ปกติ"]

    return status_list
