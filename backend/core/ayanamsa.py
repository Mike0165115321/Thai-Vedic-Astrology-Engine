import swisseph as swe

# Mapping of Ayanamsa names to Swiss Ephemeris IDs
AYANAMSA_MODES = {
    "LAHIRI": swe.SIDM_LAHIRI,
    "RAMAN": swe.SIDM_RAMAN,
    "KRISHNAMURTI": swe.SIDM_KRISHNAMURTI,
    "FAGAN_BRADLEY": swe.SIDM_FAGAN_BRADLEY,
    "JN_BHASIN": swe.SIDM_JN_BHASIN,
    "YUKTESHWAR": swe.SIDM_YUKTESHWAR,
    "SURYASIDDHANTA": swe.SIDM_SURYASIDDHANTA,
    "CUSTOM": -1 # Special flag for custom offset
}

def set_ayanamsa(mode_name="LAHIRI", custom_offset=None):
    """
    Sets the sidereal mode for Swiss Ephemeris.
    If mode_name is "CUSTOM", custom_offset (in degrees) must be provided.
    """
    mode_key = mode_name.upper()

    if mode_key == "CUSTOM" and custom_offset is not None:
        # Use J2000.0 (JD 2451545.0) as the reference date for the custom offset
        swe.set_sid_mode(swe.SIDM_USER, 2451545.0, custom_offset)
    else:
        mode = AYANAMSA_MODES.get(mode_key, swe.SIDM_LAHIRI)
        swe.set_sid_mode(mode)

def get_ayanamsa_value(jd):
    """Returns the ayanamsa value (in degrees) for a given Julian Date."""
    return swe.get_ayanamsa_ut(jd)
