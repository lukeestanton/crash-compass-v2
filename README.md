# Crash Compass V2

Crash Compass is an economic forecasting tool that estimates the probability of a US recession. It uses a Random Forest model trained on 60+ years of data from the Federal Reserve, Bureau of Labor Statistics, and Treasury to produce a daily "Stability Outlook" score.

![Crash Compass UI](frontend/public/CrashCompassTransparent.svg)

## Features

- **Daily recession probability** — a 0-100% score updated each day
- **Factor breakdown** — shows which indicators (yield curve, unemployment, etc.) are driving the score, using SHAP values
- **Historical backtesting** — compare predictions against actual past recession dates
- **Indicator charts** — drill into employment, housing, inflation, interest rates, and more
- **Automatic data refresh** — pulls new data from the FRED API daily

## Tech Stack

### Backend
- **Framework:** FastAPI (Python)
- **Machine Learning:** scikit-learn (Random Forest Classifier), Pandas, NumPy
- **Data Source:** FRED API (`fredapi`)
- **Database:** SQLite (via SQLAlchemy)

### Frontend
- **Framework:** Next.js 15 (React 19)
- **Styling:** Tailwind CSS 4
- **Charts:** Apache ECharts
- **Icons:** Lucide React

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free API Key from [FRED (Federal Reserve Economic Data)](https://fred.stlouisfed.org/docs/api/api_key.html)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/crash-compass-v2.git
cd crash-compass-v2
```

### 2. Backend Setup

Navigate to the backend folder and set up the Python environment.

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Configuration:**
Create a `.env` file in the `backend/` directory:
```bash
# backend/.env
FRED_API_KEY=your_fred_api_key_here
ALLOW_ORIGINS=http://localhost:3000
```

**Initialize Data:**
Before running the server, you need to fetch the initial data and train the model (or use the pre-trained one).

```bash
# Fetch latest data and initialize the database
python -m scripts.init_db
python -m scripts.fetch_and_store

# (Optional) Retrain the model
python -m scripts.train_model
```

**Run the Backend Server:**
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

Open a new terminal, navigate to the frontend folder, and install dependencies.

```bash
cd frontend
npm install
```

**Environment Configuration:**
Create a `.env.local` file in the `frontend/` directory (optional, defaults to localhost:8000):
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Run the Frontend:**
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## How It Works

1.  Fresh economic indicators (yield curve, unemployment, CPI, etc.) are pulled from FRED daily.
2.  The data is processed and fed into a Random Forest Classifier trained on historical recession dates (NBER).
3.  The model outputs a probability score (0-100%).
4.  SHAP values are calculated to show which indicators contributed most to the current score.

## License

This project is open-source and available under the MIT License.

## Acknowledgments

- Data provided by [Federal Reserve Economic Data (FRED)](https://fred.stlouisfed.org/), Federal Reserve Bank of St. Louis.
