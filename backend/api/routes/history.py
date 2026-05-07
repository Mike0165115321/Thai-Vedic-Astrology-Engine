from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db, SavedChart
from pydantic import BaseModel
from typing import List
from datetime import datetime

router = APIRouter()

class HistoryCreate(BaseModel):
    name: str
    day: int
    month: int
    year: int
    hour: int
    minute: int
    lat: float
    lon: float
    timezone: str

class HistoryResponse(HistoryCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=HistoryResponse)
def create_history(data: HistoryCreate, db: Session = Depends(get_db)):
    # Check for duplicates (same name and birth date)
    existing = db.query(SavedChart).filter(
        SavedChart.name == data.name,
        SavedChart.day == data.day,
        SavedChart.month == data.month,
        SavedChart.year == data.year
    ).first()

    if existing:
        # Update existing record's time and location just in case
        existing.hour = data.hour
        existing.minute = data.minute
        existing.lat = data.lat
        existing.lon = data.lon
        existing.created_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing

    db_chart = SavedChart(**data.dict())
    db.add(db_chart)
    db.commit()
    db.refresh(db_chart)
    return db_chart

@router.get("/", response_model=List[HistoryResponse])
def get_history(db: Session = Depends(get_db)):
    return db.query(SavedChart).order_by(SavedChart.id.desc()).all()

@router.delete("/{chart_id}")
def delete_history(chart_id: int, db: Session = Depends(get_db)):
    db_chart = db.query(SavedChart).filter(SavedChart.id == chart_id).first()
    if not db_chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    db.delete(db_chart)
    db.commit()
    return {"message": "Deleted successfully"}
