import asyncio
import time
from datetime import datetime
from typing import Any, List

import httpx
from fastapi import APIRouter, Body, Depends, HTTPException, Query

from app.core import deps
from app.core.config import settings
from app.db.session import get_db
from app.models.user import User as UserModel
from app.schemas.satellite import Satellite, SatelliteTracking

router = APIRouter()

DEFAULT_SATELLITES = {
    "25544": {
        "id": 25544,
        "name": "ISS (ZARYA)",
        "norad_id": 25544,
        "country": "US/RUSSIA",
        "launch_date": "1998-11-20T00:00:00",
        "orbit_type": "LEO"
    },
    "20580": {
        "id": 20580,
        "name": "HUBBLE",
        "norad_id": 20580,
        "country": "USA",
        "launch_date": "1990-04-24T00:00:00",
        "orbit_type": "LEO"
    },
    "33591": {
        "id": 33591,
        "name": "NOAA 19",
        "norad_id": 33591,
        "country": "USA",
        "launch_date": "2009-02-06T00:00:00",
        "orbit_type": "LEO"
    }
}

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

    try:
        print(f"[N2YO] /satellites/n2yo-positions request ids={sat_ids} -> returned {len(results)} items")
        print("[N2YO] full payload:", results)
    except Exception:
        pass

    return results

@router.get("/", response_model=List[Satellite])
def read_satellites(
    db_conn: Any = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    ref = db_conn.reference("satellites")
    satellites_data = ref.get()
    
    # Auto-seed if database node is empty
    if not satellites_data:
        ref.set(DEFAULT_SATELLITES)
        satellites_data = DEFAULT_SATELLITES

    satellites = []
    for s_id, val in satellites_data.items():
        sid = int(s_id) if s_id.isdigit() else s_id
        
        launch_date_val = val.get("launch_date")
        if isinstance(launch_date_val, str):
            launch_date_val = datetime.fromisoformat(launch_date_val)
            
        satellites.append(Satellite(
            id=sid,
            name=val.get("name"),
            norad_id=val.get("norad_id"),
            country=val.get("country"),
            launch_date=launch_date_val,
            orbit_type=val.get("orbit_type")
        ))
    satellites.sort(key=lambda x: x.id)
    return satellites[skip:skip+limit]

@router.get("/{id}", response_model=Satellite)
def read_satellite_by_id(
    id: int,
    db_conn: Any = Depends(get_db),
) -> Any:
    ref = db_conn.reference(f"satellites/{id}")
    sat_data = ref.get()
    
    if not sat_data:
        if str(id) in DEFAULT_SATELLITES:
            sat_data = DEFAULT_SATELLITES[str(id)]
        else:
            raise HTTPException(status_code=404, detail="Satellite not found")
            
    launch_date_val = sat_data.get("launch_date")
    if isinstance(launch_date_val, str):
        launch_date_val = datetime.fromisoformat(launch_date_val)
        
    return Satellite(
        id=id,
        name=sat_data.get("name"),
        norad_id=sat_data.get("norad_id"),
        country=sat_data.get("country"),
        launch_date=launch_date_val,
        orbit_type=sat_data.get("orbit_type")
    )

@router.post("/favorite", response_model=Satellite)
def favorite_satellite(
    *,
    db_conn: Any = Depends(get_db),
    satellite_id: int,
    current_user: UserModel = Depends(deps.get_current_user),
) -> Any:
    ref = db_conn.reference(f"satellites/{satellite_id}")
    sat_data = ref.get()
    
    if not sat_data:
        if str(satellite_id) in DEFAULT_SATELLITES:
            sat_data = DEFAULT_SATELLITES[str(satellite_id)]
        else:
            raise HTTPException(status_code=404, detail="Satellite not found")
            
    # Save favorite relation in Firebase Realtime Database
    fav_ref = db_conn.reference(f"favorites/{current_user.id}/{satellite_id}")
    fav_ref.set(True)
    
    launch_date_val = sat_data.get("launch_date")
    if isinstance(launch_date_val, str):
        launch_date_val = datetime.fromisoformat(launch_date_val)
        
    return Satellite(
        id=satellite_id,
        name=sat_data.get("name"),
        norad_id=sat_data.get("norad_id"),
        country=sat_data.get("country"),
        launch_date=launch_date_val,
        orbit_type=sat_data.get("orbit_type")
    )

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
def get_satellite_telemetry(id: int, db_conn: Any = Depends(get_db)) -> Any:
    ref = db_conn.reference(f"satellite_tracking/{id}")
    tracking_data = ref.get() or {}
    
    tracking_list = []
    for t_id, val in tracking_data.items():
        tid = int(t_id) if t_id.isdigit() else t_id
        
        timestamp_val = val.get("timestamp")
        if isinstance(timestamp_val, str):
            timestamp_val = datetime.fromisoformat(timestamp_val)
            
        tracking_list.append(SatelliteTracking(
            id=tid,
            satellite_id=id,
            latitude=val.get("latitude"),
            longitude=val.get("longitude"),
            altitude=val.get("altitude"),
            timestamp=timestamp_val
        ))
    tracking_list.sort(key=lambda x: x.timestamp, reverse=True)
    return tracking_list[:100]

@router.post("/{id}/telemetry", response_model=SatelliteTracking)
def post_telemetry(id: int, payload: SatelliteTracking = Body(...), db_conn: Any = Depends(get_db)):
    ref = db_conn.reference(f"satellite_tracking/{id}")
    tracking_id = int(time.time() * 1000)
    
    timestamp_val = payload.timestamp or datetime.utcnow()
    if isinstance(timestamp_val, datetime):
        timestamp_str = timestamp_val.isoformat()
    else:
        timestamp_str = timestamp_val
        
    record = {
        "id": tracking_id,
        "satellite_id": id,
        "latitude": payload.latitude,
        "longitude": payload.longitude,
        "altitude": payload.altitude,
        "timestamp": timestamp_str
    }
    ref.child(str(tracking_id)).set(record)
    
    parsed_timestamp = datetime.fromisoformat(timestamp_str) if isinstance(timestamp_str, str) else timestamp_str
    
    return SatelliteTracking(
        id=tracking_id,
        satellite_id=id,
        latitude=payload.latitude,
        longitude=payload.longitude,
        altitude=payload.altitude,
        timestamp=parsed_timestamp
    )
