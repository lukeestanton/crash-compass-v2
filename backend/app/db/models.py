from sqlalchemy import Column, String, Float, Date, ForeignKey, Integer
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Series(Base):
    __tablename__ = "series"
    series_id = Column(String, primary_key=True)
    name = Column(String)
    frequency = Column(String)
    units = Column(String)
    category = Column(String)
    updated_at = Column(Date)

    observations = relationship("Observation", back_populates="series")

class Observation(Base):
    __tablename__ = "observations"
    id = Column(Integer, primary_key=True)
    series_id = Column(String, ForeignKey("series.series_id"))
    date = Column(Date)
    value = Column(Float)

    series = relationship("Series", back_populates="observations")
