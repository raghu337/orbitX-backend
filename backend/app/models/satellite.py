from datetime import datetime

class Satellite:
    def __init__(self, id=None, name=None, norad_id=None, country=None, launch_date=None, orbit_type=None):
        self.id = id
        self.name = name
        self.norad_id = norad_id
        self.country = country
        self.launch_date = launch_date or datetime.utcnow().isoformat()
        self.orbit_type = orbit_type

class SatelliteTracking:
    def __init__(self, id=None, satellite_id=None, latitude=None, longitude=None, altitude=None, timestamp=None):
        self.id = id
        self.satellite_id = satellite_id
        self.latitude = latitude
        self.longitude = longitude
        self.altitude = altitude
        self.timestamp = timestamp or datetime.utcnow().isoformat()

class Favorite:
    def __init__(self, id=None, user_id=None, satellite_id=None):
        self.id = id
        self.user_id = user_id
        self.satellite_id = satellite_id
