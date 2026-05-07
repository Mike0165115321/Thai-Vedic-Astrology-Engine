from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import chart, compare, transit, realtime, history
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
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(realtime.router, prefix="/sky", tags=["Realtime"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Thai-Vedic Astrology API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
