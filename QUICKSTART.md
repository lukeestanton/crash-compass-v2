# Quick Start Guide

## Daily Startup

**1. Start Backend**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

**2. Start Frontend** (In a new terminal)
```bash
cd frontend
npm run dev
```

---

## First-Time Setup (Or after updates)

**Backend Setup:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m scripts.init_db
python -m scripts.fetch_and_store
```

**Frontend Setup:**
```bash
cd frontend
npm install
```
