from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.get_fred_data import get_series_db, get_categories_with_series
from app.services.ml_service import predict_recession_prob

router = APIRouter(prefix="/api/v1/fred", tags=["FRED"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/series/{series_id}")
def series(series_id: str, start: str = None, end: str = None, db: Session = Depends(get_db)):
    try:
        data = get_series_db(series_id=series_id, start=start, end=end, session=db)
        return data
    except Exception as e:
        raise HTTPException(status_code = 500, detail = str(e))

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    try:
        return get_categories_with_series(session=db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/dial_score")
def get_dial_score(db: Session = Depends(get_db)):
    try:
        score = predict_recession_prob(session=db)
        if score is None:
            return 0.0 
        return score
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
