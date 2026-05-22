from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class SatelliteBase(BaseModel):
    name: Optional[str] = None
    norad_id: Optional[int] = None
    country: Optional[str] = None
    launch_date: Optional[datetime] = None
    orbit_type: Optional[str] = None

class SatelliteCreate(SatelliteBase):
    name: str
    norad_id: int

class Satellite(SatelliteBase):
    id: int

    class Config:
        from_attributes = True

class SatelliteTrackingBase(BaseModel):
    satellite_id: int
    latitude: float
    longitude: float
    altitude: float
    timestamp: datetime

class SatelliteTracking(SatelliteTrackingBase):
    id: int

    class Config:
        from_attributes = True
