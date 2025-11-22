import os
import pandas as pd
from datetime import date, timedelta
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

def get_categories_with_series(session: Session = None):
    categories = {}
    
    for series_id, category in SERIES_TO_LOAD.items():
        if category not in categories:
            categories[category] = {
                "series": [],
                "outlook_score": 50
            }
        categories[category]["series"].append(series_id)

    if session:
        try:
            end_date = date.today()
            start_date = end_date - timedelta(days=365*20)
            
            series_ids = list(SERIES_TO_LOAD.keys())
            
            query = session.query(
                Observation.series_id, 
                Observation.value, 
                Observation.date
            ).filter(
                Observation.series_id.in_(series_ids),
                Observation.date >= start_date
            ).statement
            
            df = pd.read_sql(query, session.bind)
            
            if not df.empty:
                df['date'] = pd.to_datetime(df['date'])
                
                series_scores = {}
                for series_id in series_ids:
                    series_df = df[df['series_id'] == series_id].sort_values('date')
                    
                    # Remove any missing values
                    series_df = series_df.dropna(subset=['value'])
                    
                    if not series_df.empty:
                        current_val = series_df.iloc[-1]['value']
                        values = series_df['value'].values
                        rank = (values <= current_val).sum()
                        percentile = (rank / len(values)) * 100
                        series_scores[series_id] = percentile
                
                for category in categories:
                    cat_series = categories[category]["series"]
                    valid_scores = [series_scores[sid] for sid in cat_series if sid in series_scores]
                    
                    if valid_scores:
                        avg_score = sum(valid_scores) / len(valid_scores)
                        categories[category]["outlook_score"] = round(avg_score)

        except Exception as e:
            print(f"Error calculating outlook scores: {e}")

    return categories