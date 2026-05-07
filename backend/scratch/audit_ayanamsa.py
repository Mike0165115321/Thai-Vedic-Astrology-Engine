import swisseph as swe
from datetime import datetime
import pytz

# ตั้งค่าเวลาทดสอบ (ณ ปัจจุบัน)
dt = datetime.now(pytz.UTC)
jd = swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute/60.0)

def check_ayanamsas(jd_val):
    modes = {
        "LAHIRI (Standard)": swe.SIDM_LAHIRI,
        "SURYASIDDHANTA": swe.SIDM_SURYASIDDHANTA,
        "RAMAN": swe.SIDM_RAMAN,
        "FAGAN_BRADLEY": swe.SIDM_FAGAN_BRADLEY,
        "JN_BHASIN": swe.SIDM_JN_BHASIN,
        "KRISHNAMURTI": swe.SIDM_KRISHNAMURTI
    }
    
    print(f"\n--- Ayanamsa Audit at JD {jd_val} ---")
    for name, mode in modes.items():
        swe.set_sid_mode(mode)
        val = swe.get_ayanamsa_ut(jd_val)
        # แปลงเป็น องศา:ลิปดา:ฟิลิปดา
        d = int(val)
        m = int((val - d) * 60)
        s = int(((val - d) * 60 - m) * 60)
        print(f"{name:20}: {val:.6f} deg ({d}d {m}m {s}s)")

if __name__ == "__main__":
    check_ayanamsas(jd)
