import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.fred import router as fred_router
from app.routers.ml import router as ml_router

load_dotenv()

app = FastAPI(title="Crash Compass API")

allow_origins = (os.environ.get("ALLOW_ORIGINS") or "http://localhost:3000").split(",")
allow_origins = [o.strip() for o in allow_origins if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/healthz")
def healthz():
    return {"ok": True}

app.include_router(fred_router)
app.include_router(ml_router)