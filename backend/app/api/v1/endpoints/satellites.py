from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.satellite import Satellite
from app.models.satellite import Satellite as SatelliteModel, Favorite as FavoriteModel
from app.models.user import User as UserModel
from app.core import deps
from app.db.session import get_db
from fastapi import Body
import httpx
from app.models.satellite import SatelliteTracking as TrackingModel
from app.schemas.satellite import SatelliteTracking
from datetime import datetime
from app.core.config import settings

router = APIRouter()

# N2YO API proxy endpoint for real-time satellite positions
@router.get("/n2yo-positions")
def get_n2yo_positions(ids: str, lat: float, lng: float, alt: int = 0) -> Any:
    """Fetch real-time satellite positions from N2YO API. Requires N2YO_API_KEY in .env"""
    if not settings.N2YO_API_KEY:
        return {"detail": "N2YO API key not configured", "satellites": []}
    
    try:
        results = []
        sat_ids = [int(s.strip()) for s in ids.split(',') if s.strip()]
        for sat_id in sat_ids:
            try:
                url = f"https://api.n2yo.com/rest/v1/satellite/positions/{sat_id}/{lat}/{lng}/{alt}/1/?apiKey={settings.N2YO_API_KEY}"
                resp = httpx.get(url, timeout=10.0)
                if resp.status_code == 200:
                    data = resp.json()
                    if data.get('positions'):
                        pos = data['positions'][0]
                        results.append({
                            'noradId': sat_id,
                            'satid': sat_id,
                            'satname': data.get('satname', f'SAT {sat_id}'),
                            'latitude': float(pos.get('satlatitude', 0)),
                            'longitude': float(pos.get('satlongitude', 0)),
                            'altitude': float(pos.get('sataltitude', 400)),
                            'azimuth': float(pos.get('azimuth', 0)),
                            'elevation': float(pos.get('elevation', 0)),
                            'visibility': pos.get('visibility') == 'eclipsed' or pos.get('elevation', 0) > 5,
                        })
            except Exception as e:
                pass
        return results
    except Exception as e:
        return {"detail": str(e), "satellites": []}

@router.get("/", response_model=List[Satellite])
def read_satellites(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    satellites = db.query(SatelliteModel).offset(skip).limit(limit).all()
    return satellites

@router.get("/{id}", response_model=Satellite)
def read_satellite_by_id(
    id: int,
    db: Session = Depends(get_db),
) -> Any:
    satellite = db.query(SatelliteModel).filter(SatelliteModel.id == id).first()
    if not satellite:
        raise HTTPException(status_code=404, detail="Satellite not found")
    return satellite

@router.post("/favorite", response_model=Satellite)
def favorite_satellite(
    *,
    db: Session = Depends(get_db),
    satellite_id: int,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    satellite = db.query(SatelliteModel).filter(SatelliteModel.id == satellite_id).first()
    if not satellite:
        raise HTTPException(status_code=404, detail="Satellite not found")
    
    favorite = FavoriteModel(user_id=current_user.id, satellite_id=satellite_id)
    db.add(favorite)
    db.commit()
    return satellite


@router.get("/{id}/tle")
def get_tle_for_satellite(id: int):
    """Return a TLE for the requested satellite if available. This attempts to fetch from Celestrak as a fallback."""
    try:
        r = httpx.get(f"https://celestrak.com/NORAD/elements/gp.php?CATNR={id}", timeout=10.0)
        if r.status_code == 200:
            lines = [l.strip() for l in r.text.split('\n') if l.strip()]
            if len(lines) >= 3:
                return {"tle1": lines[1], "tle2": lines[2]}
    except Exception:
        pass
    return {"detail": "TLE not found"}


@router.get("/{id}/telemetry", response_model=List[SatelliteTracking])
def get_satellite_telemetry(id: int, db: Session = Depends(get_db)) -> Any:
    tracking_data = db.query(TrackingModel).filter(TrackingModel.satellite_id == id).order_by(
        TrackingModel.timestamp.desc()
    ).limit(100).all()
    return tracking_data


@router.post("/{id}/telemetry", response_model=SatelliteTracking)
def post_telemetry(id: int, payload: SatelliteTracking = Body(...), db: Session = Depends(get_db)):
    """Save telemetry for a satellite (used by clients to store live tracking history)."""
    record = TrackingModel(
        satellite_id=id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        altitude=payload.altitude,
        timestamp=payload.timestamp or datetime.utcnow()
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
