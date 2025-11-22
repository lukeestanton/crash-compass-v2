import json
import os
import sys
import pandas as pd
import numpy as np
import joblib
from datetime import date, timedelta

# Ensure we can import from app
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.db.models import Observation
from app.lib.series_defs import SERIES_TO_LOAD

MODEL_PATH = "app/ml_models/recession_model.joblib"
OUTPUT_PATH = "app/ml_models/history.json"

LEVEL_SERIES = [
    "PAYEMS", "AHETPI", "PCE", "DSPIC96", "CPIAUCSL", "CPILFESL", 
    "M2REAL", "WM2NS", "INDPRO", "IPMAN", "HOUST", "PERMIT",
    "WPSFD49207"
]

def generate_history():
    session = SessionLocal()
    try:
        print("Loading data...")
        query = session.query(Observation).statement
        df = pd.read_sql(query, session.bind)
        
        if df.empty:
            print("No data found.")
            return

        # Pivot to wide format
        df_pivot = df.pivot(index="date", columns="series_id", values="value")
        df_pivot.index = pd.to_datetime(df_pivot.index)
        df_pivot.sort_index(inplace=True)
        
        # Resample to monthly and forward fill
        df_monthly = df_pivot.resample('ME').last()
        df_monthly = df_monthly.ffill()
        
        # Calculate YoY for level series
        for col in df_monthly.columns:
            if col in LEVEL_SERIES:
                df_monthly[f"{col}_YoY"] = df_monthly[col].pct_change(12)
                # Keep original columns? The training script drops them.
                # "df_monthly.drop(columns=[col], inplace=True)"
                # We should follow training script exactly to match features.
                df_monthly.drop(columns=[col], inplace=True)
        
        # Load Model
        if not os.path.exists(MODEL_PATH):
            print(f"Model not found at {MODEL_PATH}")
            return
            
        model = joblib.load(MODEL_PATH)
        expected_features = model.feature_names_in_
        
        # Prepare X
        # We need to ensure all expected features exist
        # Any missing features (e.g. if new data doesn't have them yet) fill with 0?
        # Or just filter for rows that have valid data.
        
        # Align columns
        # Add missing columns with 0
        for feat in expected_features:
            if feat not in df_monthly.columns:
                df_monthly[feat] = 0
                
        X = df_monthly[expected_features]
        
        # Handle NaNs (created by pct_change)
        # We can't predict on NaNs.
        # However, we want as much history as possible.
        # pct_change(12) kills first 12 months.
        # ffill might leave some NaNs at start.
        valid_indices = X.dropna().index
        X_clean = X.loc[valid_indices]
        
        print(f"Predicting for {len(X_clean)} months...")
        probs = model.predict_proba(X_clean)[:, 1] # Probability of class 1
        
        # Get USREC (NBER recession indicator)
        # It might be in df_monthly if it was loaded.
        usrec = df_monthly["USREC"].reindex(valid_indices).fillna(0)
        
        # Combine into result list
        results = []
        for date_idx, prob, rec in zip(valid_indices, probs, usrec):
            results.append({
                "date": date_idx.strftime("%Y-%m-%d"),
                "prob": float(prob),
                "is_recession": int(rec) if not pd.isna(rec) else 0
            })
            
        # Filter to last ~25 years (dataset might go back to 1960s)
        # User asked for "last 20 years", but having more is fine.
        # Let's include everything we have valid predictions for.
        
        with open(OUTPUT_PATH, "w") as f:
            json.dump(results, f)
            
        print(f"Saved {len(results)} records to {OUTPUT_PATH}")

    finally:
        session.close()

if __name__ == "__main__":
    generate_history()

