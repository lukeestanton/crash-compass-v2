import os
import joblib
import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.db.models import Observation
from app.db.session import SessionLocal

MODEL_PATH = "app/ml_models/recession_model.joblib"

LEVEL_SERIES = [
    "PAYEMS", "AHETPI", "PCE", "DSPIC96", "CPIAUCSL", "CPILFESL", 
    "M2REAL", "WM2NS", "INDPRO", "IPMAN", "HOUST", "PERMIT",
    "WPSFD49207"
]

_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
        else:
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run training script first.")
    return _model

def predict_recession_prob(session: Session = None):
    close_session = False
    if session is None:
        session = SessionLocal()
        close_session = True
        
    try:
        model = get_model()
        
        from datetime import date, timedelta
        start_date = date.today() - timedelta(days=450)
        
        query = session.query(Observation).filter(Observation.date >= start_date).statement
        df = pd.read_sql(query, session.bind)
        
        if df.empty:
            return None
            
        df_pivot = df.pivot(index="date", columns="series_id", values="value")
        df_pivot.index = pd.to_datetime(df_pivot.index)
        df_pivot.sort_index(inplace=True)
        
        df_monthly = df_pivot.resample('ME').last()
        df_monthly = df_monthly.ffill()
        
        for col in df_monthly.columns:
            if col in LEVEL_SERIES:
                df_monthly[f"{col}_YoY"] = df_monthly[col].pct_change(12)
                df_monthly.drop(columns=[col], inplace=True)
        
        latest_data = df_monthly.iloc[[-1]]
        
        expected_features = model.feature_names_in_
        
        X = latest_data.reindex(columns=expected_features)
        
        if X.isnull().values.any():
            X = X.fillna(0)
            
        prob = model.predict_proba(X)[0][1]
        return float(prob * 100)
        
    finally:
        if close_session:
            session.close()
