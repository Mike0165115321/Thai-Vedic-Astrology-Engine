import swisseph as swe
import os
import sys

def init_ephemeris():
    """Initializes the ephemeris path."""
    # Look for ephemeris data in backend/data/ephemeris
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        # Running as compiled executable
        base_path = sys._MEIPASS
    else:
        # Running as script
        base_path = os.getcwd()
        
    ephe_path = os.path.join(base_path, 'data', 'ephemeris')
    
    # Optional: print for debugging
    print(f"Initializing Ephemeris at: {ephe_path}")
    
    if os.path.exists(ephe_path):
        swe.set_ephe_path(ephe_path)
    else:
        # Fallback to current dir or environment variable if needed
        print("Warning: Ephemeris directory not found.")
        pass

init_ephemeris()
