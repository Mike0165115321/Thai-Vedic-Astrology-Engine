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
    "SURYASIDDHANTA_MSUN": swe.SIDM_SURYASIDDHANTA_MSUN,
    "SURYAYART": swe.SIDM_SURYASIDDHANTA,  # Using Surya Siddhanta as the base for Suriyayart
    "TRUE_CITRA": swe.SIDM_TRUE_CITRA,
    "TROPICAL": -1, # Flag for Tropical (no sidereal mode)
}

def set_ayanamsa(mode_name="LAHIRI"):
    """
    Sets the sidereal mode for Swiss Ephemeris.
    """
    mode_key = mode_name.upper()

    if mode_key == "TROPICAL":
        # For Tropical, we don't call set_sid_mode, but we need to ensure 
        # subsequent calculations don't use the SIDEREAL flag.
        # However, the current engine uses the SIDEREAL flag in calc_ut.
        # We will handle TROPICAL by checking the mode in the calculator.
        pass
    else:
        mode = AYANAMSA_MODES.get(mode_key, swe.SIDM_LAHIRI)
        if mode != -1:
            swe.set_sid_mode(mode)

def get_ayanamsa_value(jd):
    """Returns the ayanamsa value (in degrees) for a given Julian Date."""
    return swe.get_ayanamsa_ut(jd)
