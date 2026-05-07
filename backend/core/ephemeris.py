import swisseph as swe
import os

def init_ephemeris():
    """Initializes the ephemeris path."""
    # Look for ephemeris data in backend/data/ephemeris
    # Current directory is backend
    ephe_path = os.path.join(os.getcwd(), 'data', 'ephemeris')
    if os.path.exists(ephe_path):
        swe.set_ephe_path(ephe_path)
    else:
        # Fallback to current dir or environment variable if needed
        pass

init_ephemeris()
