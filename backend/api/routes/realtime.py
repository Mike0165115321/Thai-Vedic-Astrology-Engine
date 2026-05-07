from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import swisseph as swe
from datetime import datetime
from core.time_utils import get_julian_date
from planets.calculator import get_all_planets
from core.ayanamsa import set_ayanamsa

router = APIRouter()

@router.websocket("/")
async def realtime_sky_websocket(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # 1. Get Current UTC Time
            now = datetime.utcnow()
            jd = get_julian_date(now.year, now.month, now.day, now.hour, now.minute, now.second)
            
            # 2. Set Default Ayanamsa (Lahiri)
            set_ayanamsa("LAHIRI")
            
            # 3. Calculate all planets
            planets = get_all_planets(jd)
            
            # 4. Push to client
            data = {
                "timestamp": now.isoformat(),
                "julian_date": jd,
                "planets": planets
            }
            await websocket.send_json(data)
            
            # 5. Wait for 60 seconds (Realtime update)
            await asyncio.sleep(60)
            
    except WebSocketDisconnect:
        print("Realtime sky client disconnected")
    except Exception as e:
        print(f"Error in realtime websocket: {e}")
        await websocket.close()
