import os
from fredapi import Fred
from sqlalchemy.orm import Session
from app.db.models import Series, Observation
from app.lib.series_defs import SERIES_TO_LOAD

def _client():
    api_key = os.environ.get("FRED_API_KEY")
    if not api_key:
        raise RuntimeError("Missing FRED api key")
    return Fred(api_key = api_key)

def get_series(series_id, start = None, end = None):
    fred = _client()
    series = fred.get_series(series_id, observation_start = start, observation_end = end)
    out = []
    for i, val in series.items():
        date = getattr(i, "date", lambda: i)()
        out.append({"date": str(date), "value": "" if val is None else str(val)})
    return out

def get_series_db(series_id, start=None, end=None, session: Session = None):
    if session is None:
        raise ValueError("DB session required to use stored FRED data")

    series_meta = session.query(Series).filter(Series.series_id == series_id).first()
    if not series_meta:
        raise ValueError(f"Series '{series_id}' not found in database")

    query = session.query(Observation).filter(Observation.series_id == series_id)
    if start:
        query = query.filter(Observation.date >= start)
    if end:
        query = query.filter(Observation.date <= end)
    query = query.order_by(Observation.date.asc())

    observations = [
        {"date": obs.date.isoformat(), "value": str(obs.value)}
        for obs in query.all()
    ]

    return {
        "seriesId": series_meta.series_id,
        "name": series_meta.name,
        "frequency": series_meta.frequency,
        "units": series_meta.units,
        "category": series_meta.category,
        "citation": f"FRED, {series_meta.name}. Retrieved from https://fred.stlouisfed.org/series/{series_meta.series_id}",
        "count": len(observations),
        "series": observations
    }

def get_categories_with_series():
    categories = {}
    
    for series_id, category in SERIES_TO_LOAD.items():
        if category not in categories:
            categories[category] = {
                "series": [],
                "outlook_score": 50
            }
        categories[category]["series"].append(series_id)
    return categories