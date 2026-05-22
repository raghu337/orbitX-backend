import random
from datetime import datetime


def get_live_satellite_data():
    return {
        "satellite": "OrbitX-1",
        "latitude": round(random.uniform(-90, 90), 4),
        "longitude": round(random.uniform(-180, 180), 4),
        "altitude_km": round(random.uniform(400, 900), 2),
        "velocity_kmh": round(random.uniform(27000, 29000), 2),
        "signal_strength": random.randint(85, 100),
        "status": "ACTIVE",
        "timestamp": datetime.utcnow().isoformat()
    }