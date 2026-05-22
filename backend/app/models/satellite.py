from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.session import Base

class Satellite(Base):
    __tablename__ = "satellites"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    norad_id = Column(Integer, unique=True, index=True)
    country = Column(String)
    launch_date = Column(DateTime)
    orbit_type = Column(String)

    tracking_data = relationship("SatelliteTracking", back_populates="satellite")
    favorites = relationship("Favorite", back_populates="satellite")

class SatelliteTracking(Base):
    __tablename__ = "satellite_tracking"

    id = Column(Integer, primary_key=True, index=True)
    satellite_id = Column(Integer, ForeignKey("satellites.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    altitude = Column(Float)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    satellite = relationship("Satellite", back_populates="tracking_data")

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    satellite_id = Column(Integer, ForeignKey("satellites.id"))

    satellite = relationship("Satellite", back_populates="favorites")
