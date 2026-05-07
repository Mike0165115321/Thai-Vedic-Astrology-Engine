from fastapi import FastAPI
from api.routes import chart

app = FastAPI(title="Thai-Vedic Astrology Engine")

# Include routers
app.include_router(chart.router, prefix="/calculate/chart", tags=["Chart"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Thai-Vedic Astrology API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
