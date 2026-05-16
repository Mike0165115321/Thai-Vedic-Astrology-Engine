from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import chart, compare, transit, transit_scanner, realtime, history
from db.database import init_db

# Initialize database
init_db()

app = FastAPI(title="Thai-Vedic Astrology API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(chart.router, prefix="/calculate/chart", tags=["Natal"])
app.include_router(compare.router, prefix="/calculate/compare", tags=["Compare"])
app.include_router(transit.router, prefix="/calculate/transit", tags=["Transit"])
app.include_router(transit_scanner.router, prefix="/calculate/transit-scanner", tags=["Transit Scanner"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(realtime.router, prefix="/sky", tags=["Realtime"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Thai-Vedic Astrology API"}

if __name__ == "__main__":
    import uvicorn
    import sys
    import io
    
    # Fix for PyInstaller console=False mode where standard streams are None
    if sys.stdout is None:
        sys.stdout = io.StringIO()
    if sys.stderr is None:
        sys.stderr = io.StringIO()

    port = 8000
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    # Bind to localhost for security since it's a desktop app now
    uvicorn.run(app, host="127.0.0.1", port=port)
