from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import chart, compare, transit, realtime

app = FastAPI(title="Thai-Vedic Astrology Engine")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chart.router, prefix="/calculate/chart", tags=["Chart"])
app.include_router(compare.router, prefix="/calculate/compare", tags=["Synastry"])
app.include_router(transit.router, prefix="/calculate/transit", tags=["Transit"])
app.include_router(realtime.router, prefix="/sky/realtime", tags=["Sky"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Thai-Vedic Astrology API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
