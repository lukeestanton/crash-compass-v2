import os
import pandas as pd
import joblib
from sqlalchemy.orm import Session
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.impute import SimpleImputer
import numpy as np

from app.db.session import SessionLocal
from app.db.models import Observation
from app.lib.series_defs import SERIES_TO_LOAD

MODEL_PATH = "app/ml_models/recession_model.joblib"

LEVEL_SERIES = [
    "PAYEMS", "AHETPI", "PCE", "DSPIC96", "CPIAUCSL", "CPILFESL", 
    "M2REAL", "WM2NS", "INDPRO", "IPMAN", "HOUST", "PERMIT",
    "WPSFD49207"
]

def load_data(session: Session):
    query = session.query(Observation).statement
    df = pd.read_sql(query, session.bind)
    
    df_pivot = df.pivot(index="date", columns="series_id", values="value")
    
    df_pivot.index = pd.to_datetime(df_pivot.index)
    df_pivot.sort_index(inplace=True)
    
    return df_pivot

def preprocess_features(df):
    df_proc = df.copy()
    
    for col in df_proc.columns:
        if col in LEVEL_SERIES:
            pass 
            
    return df_proc

def train():
    session = SessionLocal()
    try:
        print("Loading data...")
        df = load_data(session)
        
        target_col = "USREC"
        if target_col not in df.columns:
            raise ValueError(f"{target_col} not found in data.")

        df_monthly = df.resample('ME').last()
        df_monthly = df_monthly.ffill()
        
        for col in df_monthly.columns:
            if col in LEVEL_SERIES:
                df_monthly[f"{col}_YoY"] = df_monthly[col].pct_change(12)
                df_monthly.drop(columns=[col], inplace=True)
        
        df_monthly["target"] = df_monthly[target_col].shift(-6)
        df_model = df_monthly.dropna(subset=["target"])
        
        # Drop the original USREC (current state) to avoid "persistence" bias
        if target_col in df_model.columns:
            df_model = df_model.drop(columns=[target_col])
            
        X = df_model.drop(columns=["target"])
        y = df_model["target"]
        
        valid_idx = X.dropna().index
        X = X.loc[valid_idx]
        y = y.loc[valid_idx]
        
        print(f"Training on {len(X)} observations from {X.index.min()} to {X.index.max()}")
        print(f"Features: {X.columns.tolist()}")
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
        
        clf = RandomForestClassifier(n_estimators=100, random_state=42, min_samples_leaf=5)
        clf.fit(X_train, y_train)
        
        y_pred = clf.predict(X_test)
        print("Accuracy:", accuracy_score(y_test, y_pred))
        print(classification_report(y_test, y_pred))
        
        joblib.dump(clf, MODEL_PATH)
        print(f"Model saved to {MODEL_PATH}")
        
    finally:
        session.close()

if __name__ == "__main__":
    train()
