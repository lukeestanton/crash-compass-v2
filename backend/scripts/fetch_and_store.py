import os
from datetime import date
from dotenv import load_dotenv
from fredapi import Fred

from app.db.session import SessionLocal
from app.db.models import Series, Observation
from app.lib.series_defs import SERIES_TO_LOAD

load_dotenv()
fred = Fred(api_key=os.environ["FRED_API_KEY"])
session = SessionLocal()

def store_series(series_id, category):
    info = fred.get_series_info(series_id)
    series = Series(
        series_id=series_id,
        name=info.get("title"),
        frequency=info.get("frequency_short"),
        units=info.get("units_short"),
        category=category,
        updated_at=date.today()
    )
    session.merge(series)

    session.query(Observation).filter_by(series_id=series_id).delete()

    data = fred.get_series(series_id)
    for d, v in data.items():
        if v is not None:
            obs = Observation(series_id=series_id, date=d.date(), value=float(v))
            session.add(obs)

    session.commit()
    print(f"Stored {series_id}: {len(data)} rows")


for series_id, category in SERIES_TO_LOAD.items():
    try:
        store_series(series_id, category)
    except Exception as e:
        print(f"Failed to store {series_id}: {e}")