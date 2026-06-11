from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import random

from app.schemas.satellite import SatelliteTracking
from app.models.satellite import SatelliteTracking as TrackingModel
from app.db.session import get_db
from app.core.config import settings
import httpx

router = APIRouter()


@router.get("/live", response_model=List[SatelliteTracking])
def get_live_tracking(db: Session = Depends(get_db)) -> Any:
    tracking_data = db.query(TrackingModel).order_by(
        TrackingModel.timestamp.desc()
    ).limit(100).all()

    return tracking_data


@router.get("/{satellite_id}", response_model=List[SatelliteTracking])
def get_satellite_tracking(
    satellite_id: int,
    db: Session = Depends(get_db),
) -> Any:
    tracking_data = db.query(TrackingModel).filter(
        TrackingModel.satellite_id == satellite_id
    ).order_by(
        TrackingModel.timestamp.desc()
    ).limit(200).all()

    return tracking_data


@router.get("/live/realtime/demo")
def realtime_demo():
    return {
        "satellite": "OrbitX-1",
        "latitude": round(random.uniform(-90, 90), 4),
        "longitude": round(random.uniform(-180, 180), 4),
        "altitude_km": round(random.uniform(350, 900), 2),
        "velocity_kmh": round(random.uniform(27000, 29000), 2),
        "status": "ACTIVE",
        "signal_strength": random.randint(85, 100),
        "timestamp": datetime.utcnow()
    }


@router.get("/health")
def health():
    return {
        "status": "ONLINE",
        "system": "OrbitX Live Tracking",
        "timestamp": datetime.utcnow()
    }


@router.get('/pass_prediction')
def pass_prediction(satellite_id: int, observer_lat: float, observer_lng: float, observer_alt: int = 0, days: int = 1):
    """Proxy pass prediction via N2YO if API key configured. Returns N2YO response or a fallback message."""
    api_key = settings.N2YO_API_KEY
    if not api_key:
        return {"detail": "N2YO API key not configured on server. Enable N2YO or compute passes on client."}
    try:
        url = f"https://www.n2yo.com/rest/v1/satellite/radiopasses/{satellite_id}/{observer_lat}/{observer_lng}/{observer_alt}/{days}/10/&apiKey={api_key}"
        r = httpx.get(url, timeout=10.0)
        return r.json()
    except Exception as e:
        return {"detail": "Failed to fetch pass prediction", "error": str(e)}