import asyncio
from datetime import datetime
from typing import Any, List

import httpx
from fastapi import APIRouter, Body, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core import deps
from app.core.config import settings
from app.db.session import get_db
from app.models.satellite import Favorite as FavoriteModel
from app.models.satellite import Satellite as SatelliteModel
from app.models.satellite import SatelliteTracking as TrackingModel
from app.models.user import User as UserModel
from app.schemas.satellite import Satellite, SatelliteTracking

router = APIRouter()

async def fetch_n2yo_position(client: httpx.AsyncClient, sat_id: int, lat: float, lng: float, alt: float) -> Any:
    url = f"https://api.n2yo.com/rest/v1/satellite/positions/{sat_id}/{lat}/{lng}/{alt}/1/?apiKey={settings.N2YO_API_KEY}"
    resp = await client.get(url)
    if resp.status_code != 200:
        return None
    data = resp.json()
    position = data.get("positions")
    if not position or not isinstance(position, list):
        return None
    pos = position[0]
    visibility = True
    if isinstance(pos.get("visibility"), str):
        visibility = pos.get("visibility").lower() != "eclipsed"
    return {
        "noradId": sat_id,
        "satid": sat_id,
        "satname": data.get("satname", f"SAT {sat_id}"),
        "latitude": float(pos.get("satlatitude", 0) or 0),
        "longitude": float(pos.get("satlongitude", 0) or 0),
        "altitude": float(pos.get("sataltitude", 0) or 0),
        "azimuth": float(pos.get("azimuth", 0) or 0),
        "elevation": float(pos.get("elevation", 0) or 0),
        "visibility": visibility,
        "timestamp": data.get("timestamp") or datetime.utcnow().isoformat(),
    }

@router.get("/n2yo-positions")
async def get_n2yo_positions(
    ids: str = Query(..., description="Comma-separated NORAD IDs"),
    lat: float = Query(..., description="Observer latitude"),
    lng: float = Query(..., description="Observer longitude"),
    alt: float = Query(0.0, description="Observer altitude in meters"),
) -> Any:
    if not settings.N2YO_API_KEY:
        raise HTTPException(status_code=500, detail="N2YO API key is not configured on the server.")

    sat_ids = [int(s.strip()) for s in ids.split(",") if s.strip().isdigit()]
    if not sat_ids:
        raise HTTPException(status_code=400, detail="No valid satellite IDs provided.")

    async with httpx.AsyncClient(timeout=15.0) as client:
        # Limit concurrent requests to N2YO to avoid rate/connection issues
        sem = asyncio.Semaphore(10)

        async def sem_task(sid):
            async with sem:
                return await fetch_n2yo_position(client, sid, lat, lng, alt)

        tasks = [sem_task(sat_id) for sat_id in sat_ids]
        responses = await asyncio.gather(*tasks, return_exceptions=True)

    results = []
    for resp in responses:
        if isinstance(resp, dict):
            results.append(resp)

    # Debug: log full batch result for troubleshooting (server logs)
    try:
        print(f"[N2YO] /satellites/n2yo-positions request ids={sat_ids} -> returned {len(results)} items")
        # print full JSON (careful in prod, this is for debug)
        print("[N2YO] full payload:", results)
    except Exception:
        pass

    return results

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
async def get_tle_for_satellite(id: int) -> Any:
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(f"https://celestrak.com/NORAD/elements/gp.php?CATNR={id}")
        if response.status_code == 200:
            lines = [l.strip() for l in response.text.split("\n") if l.strip()]
            if len(lines) >= 3:
                return {"tle1": lines[1], "tle2": lines[2]}
    except httpx.HTTPError:
        pass
    raise HTTPException(status_code=404, detail="TLE not found")

@router.get("/{id}/telemetry", response_model=List[SatelliteTracking])
def get_satellite_telemetry(id: int, db: Session = Depends(get_db)) -> Any:
    tracking_data = (
        db.query(TrackingModel)
        .filter(TrackingModel.satellite_id == id)
        .order_by(TrackingModel.timestamp.desc())
        .limit(100)
        .all()
    )
    return tracking_data

@router.post("/{id}/telemetry", response_model=SatelliteTracking)
def post_telemetry(id: int, payload: SatelliteTracking = Body(...), db: Session = Depends(get_db)):
    record = TrackingModel(
        satellite_id=id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        altitude=payload.altitude,
        timestamp=payload.timestamp or datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
