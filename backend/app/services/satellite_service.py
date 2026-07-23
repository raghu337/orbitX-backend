from datetime import datetime

import requests
from app.core.config import settings

router = APIRouter()

N2YO_API_KEY = settings.N2YO_API_KEY or "DEMO_KEY"

SATELLITE_IDS = [
    25544,  # ISS
    20580,  # Hubble
    25338,  # NOAA
    25994,  # Terra
    27424,  # Aqua
    24876,  # GPS
]

@router.get("/satellites")
def get_live_satellite_data():

    satellites = []

    observer_lat = 15.5049
    observer_lng = 77.3757
    observer_alt = 0

    for sat_id in SATELLITE_IDS:
        try:

            url = f"https://api.n2yo.com/rest/v1/satellite/positions/{sat_id}/{observer_lat}/{observer_lng}/{observer_alt}/1/&apiKey={N2YO_API_KEY}"

            response = requests.get(url, timeout=10)

            data = response.json()

            if "positions" in data and len(data["positions"]) > 0:

                pos = data["positions"][0]

                satellites.append({
                    "satellite_id": sat_id,
                    "name": data.get("info", {}).get("satname", f"SAT-{sat_id}"),
                    "latitude": pos.get("satlatitude"),
                    "longitude": pos.get("satlongitude"),
                    "altitude_km": pos.get("sataltitude"),
                    "azimuth": pos.get("azimuth"),
                    "elevation": pos.get("elevation"),
                    "timestamp": datetime.utcnow().isoformat()
                })

        except Exception as e:
            satellites.append({
                "satellite_id": sat_id,
                "error": str(e)
            })

    return {
        "total_satellites": len(satellites),
        "satellites": satellites,
        "timestamp": datetime.utcnow().isoformat()
    }
