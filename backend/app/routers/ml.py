import json
import os
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/v1/ml", tags=["ML"])

# Path is relative to where uvicorn is run (usually backend/)
HISTORY_PATH = "app/ml_models/history.json"

@router.get("/history")
def get_history():
    if not os.path.exists(HISTORY_PATH):
        raise HTTPException(status_code=404, detail="History not found. Please run generation script.")
        
    with open(HISTORY_PATH, "r") as f:
        data = json.load(f)
    return data

