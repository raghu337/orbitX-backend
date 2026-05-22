# OrbitX N2YO Integration - API Reference

## Backend Endpoints

### 1. N2YO Real-Time Positions (NEW)
```
GET /api/v1/satellites/n2yo-positions
```

**Query Parameters**:
| Param | Type | Required | Example | Description |
|-------|------|----------|---------|-------------|
| `ids` | string | Yes | `25544,20580,44238` | Comma-separated NORAD satellite IDs |
| `lat` | float | Yes | `40.7128` | Observer latitude (-90 to 90) |
| `lng` | float | Yes | `-74.0060` | Observer longitude (-180 to 180) |
| `alt` | integer | No | `0` | Observer altitude above sea level (meters) |

**Response** (200 OK):
```json
[
  {
    "noradId": 25544,
    "satid": 25544,
    "satname": "ISS (ZARYA)",
    "latitude": 51.2345,
    "longitude": 8.4321,
    "altitude": 408.5,
    "azimuth": 125.3,
    "elevation": 45.2,
    "visibility": true
  },
  {
    "noradId": 20580,
    "satname": "HUBBLE",
    "latitude": 28.4567,
    "longitude": -15.2345,
    "altitude": 593.1,
    "azimuth": 200.1,
    "elevation": -5.3,
    "visibility": false
  }
]
```

**Error Handling**:
```json
{
  "detail": "N2YO API key not configured",
  "satellites": []
}
```

### 2. TLE Data Fallback
```
GET /api/v1/satellites/{norad_id}/tle
```

**Response** (200 OK):
```json
{
  "tle1": "1 25544U 98067A   24001.00000000  .00001234  00000-0  12345-4 0  9990",
  "tle2": "2 25544  51.6400 123.4567 0001234  45.6789 314.3210 15.50123456123456"
}
```

**Error Handling**:
```json
{
  "detail": "TLE not found"
}
```

### 3. Telemetry Storage
```
POST /api/v1/satellites/{id}/telemetry
```

**Request Body**:
```json
{
  "latitude": 51.2345,
  "longitude": 8.4321,
  "altitude": 408.5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "satellite_id": 25544,
  "latitude": 51.2345,
  "longitude": 8.4321,
  "altitude": 408.5,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 4. Telemetry Retrieval
```
GET /api/v1/satellites/{id}/telemetry
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "satellite_id": 25544,
    "latitude": 51.2345,
    "longitude": 8.4321,
    "altitude": 408.5,
    "timestamp": "2024-01-15T10:30:00Z"
  }
]
```

---

## Frontend Services

### satelliteService.js

#### fetchN2YOPositions()
```javascript
const positions = await satelliteService.fetchN2YOPositions(
  [25544, 20580],           // satIds
  40.7128,                  // observerLat
  -74.0060,                 // observerLng
  0                         // observerAltKm
);

// Returns: Array of position objects
// [
//   {
//     noradId: 25544,
//     latitude: 51.2345,
//     longitude: 8.4321,
//     altitude: 408.5,
//     speed: 7.66,
//     visibility: true,
//     ...
//   },
//   ...
// ]
```

#### fetchTLE()
```javascript
const tle = await satelliteService.fetchTLE(25544);
// Returns: { tle1: "...", tle2: "..." }
```

#### computeStateFromTLE()
```javascript
const state = await satelliteService.computeStateFromTLE(
  { tle1, tle2 },          // TLE lines
  new Date(),              // when
  { latitude, longitude, altitude }  // observer
);

// Returns: {
//   latitude: 51.2345,
//   longitude: 8.4321,
//   altitude: 408.5,
//   speed: 7.66,
//   visibility: true,
//   elevation: 45.2,
//   orbitType: "LEO"
// }
```

### liveSatelliteService.js

#### subscribe()
```javascript
const unsubscribe = liveSatelliteService.subscribe(
  [25544, 20580, 44238],   // satelliteIds
  (updates) => {
    // Called every 5 seconds with new telemetry
    console.log(updates);  // Array of satellite data
  },
  5000                     // intervalMs
);

// Unsubscribe when component unmounts
unsubscribe();
```

**Updates Format**:
```javascript
[
  {
    noradId: 25544,
    name: "ISS (ZARYA)",
    latitude: 51.2345,
    longitude: 8.4321,
    altitude: 408.5,
    speed: 7.66,
    orbitType: "LEO",
    visibility: true,
    nextPass: "2024-01-15T14:30:00Z",
    signalStrength: 0.85,
    source: "N2YO"  // or "TLE" or "MOCK"
  },
  ...
]
```

#### getLiveTelemetry()
```javascript
const telemetry = await liveSatelliteService.getLiveTelemetry(25544);
// Returns: Single satellite telemetry object (same format as subscribe updates)
```

---

## Data Flow Diagrams

### Request Flow
```
Frontend (Expo)
  ↓
  satelliteService.fetchN2YOPositions()
  ↓
  POST to Backend: /api/v1/satellites/n2yo-positions
  ↓
Backend
  ↓
  settings.N2YO_API_KEY (from .env)
  ↓
  httpx.get("https://api.n2yo.com/...")
  ↓
N2YO API
  ↓
  Returns: {positions: [{satlatitude, satlongitude, sataltitude, ...}]}
  ↓
Backend
  ↓
  Parse & format response
  ↓
Frontend
  ↓
  liveSatelliteService.subscribe() gets update
  ↓
  Component state updated
  ↓
  OrbitVisualizationScreen re-renders
  ↓
User sees: Fresh satellite coordinates with animation
```

### Fallback Chain
```
User opens app
  ↓
liveSatelliteService.subscribe(satIds, callback, 5000)
  ↓
Every 5 seconds: fetchN2YOPositions()
  ↓
  ├─ Success? → Return N2YO data (source: "N2YO")
  │
  ├─ Failed? → For each satellite, fetchTLE()
  │   ├─ Success? → computeStateFromTLE() (source: "TLE")
  │   ├─ Failed? → Use mock data (source: "MOCK")
  │
  └─ Return updates to callback
```

---

## Satellite Data Objects

### Full Telemetry Object
```javascript
{
  noradId: 25544,              // NORAD catalog number
  name: "ISS (ZARYA)",         // Satellite name
  category: "Space Station",   // Category
  telemetry: {
    latitude: 51.2345,         // Current latitude
    longitude: 8.4321,         // Current longitude
    altitude: 408.5,           // Current altitude (km)
    speed: 7.66,               // Current speed (km/s)
    orbitType: "LEO",          // Orbit classification
    visibility: true,          // Is satellite visible from observer?
    elevation: 45.2,           // Angle above horizon (degrees)
    azimuth: 125.3,            // Compass direction (degrees)
    signalStrength: 0.85,      // Signal quality (0-1)
    nextPass: "2024-01-15T14:30:00Z",  // Next visible pass
    distance: 2450.5,          // Distance to observer (km)
    source: "N2YO"             // Data source: "N2YO" | "TLE" | "MOCK"
  }
}
```

### Live Satellites Data
```javascript
// src/data/liveSatellites.js
[
  {
    name: "ISS (ZARYA)",
    category: "Space Station",
    noradId: 25544,
    n2yoId: 25544,
    altitude: 408,
    speed: 7.66,
    orbitType: "LEO",
    visibility: false,
    signalStrength: 0.5,
    nextPass: null
  },
  // ... 5 more satellites
]
```

---

## Environment Configuration

### Backend .env
```
N2YO_API_KEY=F4N2CU-ZQFHE8-ES79EL-5R5O
DATABASE_URL=postgresql://user:password@localhost/orbitx
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
DEBUG=False
```

### Frontend Constants
```javascript
// src/services/satelliteService.js
const BACKEND_URL = 'http://10.0.2.2:8000';  // Android
// const BACKEND_URL = 'http://localhost:8000';  // iOS/Web
// const BACKEND_URL = 'https://api.example.com';  // Production
```

---

## Error Codes & Handling

| HTTP Code | Meaning | Frontend Action |
|-----------|---------|-----------------|
| 200 | Success | Use data |
| 400 | Bad request (invalid params) | Log error, try TLE fallback |
| 401 | Unauthorized (bad API key) | Log error, try TLE fallback |
| 404 | Not found (satellite/endpoint) | Use TLE fallback |
| 429 | Rate limited (too many requests) | Back off, use cached data |
| 500 | Server error | Use TLE fallback |
| timeout | Network timeout (>10s) | Use TLE fallback |

---

## Testing Commands

### Test N2YO Endpoint
```bash
# ISS only
curl "http://localhost:8000/api/v1/satellites/n2yo-positions?ids=25544&lat=40.7128&lng=-74.0060&alt=0"

# Multiple satellites
curl "http://localhost:8000/api/v1/satellites/n2yo-positions?ids=25544,20580,44238&lat=40.7128&lng=-74.0060&alt=0"

# Different location (London)
curl "http://localhost:8000/api/v1/satellites/n2yo-positions?ids=25544&lat=51.5074&lng=-0.1278&alt=0"
```

### Test TLE Endpoint
```bash
curl "http://localhost:8000/api/v1/satellites/25544/tle"
```

### Run Integration Test
```bash
python test_n2yo_integration.py
```

---

## Performance Metrics

### Response Times (Expected)
| Operation | Time | Notes |
|-----------|------|-------|
| N2YO API call | 500-2000ms | Depends on N2YO server load |
| Celestrak TLE fetch | 200-1000ms | Usually fast |
| Frontend polling | 5000ms | Interval between updates |
| State update & render | 50-200ms | React Native optimization |

### Data Transfer
| Operation | Size | Frequency |
|-----------|------|-----------|
| N2YO request (6 sats) | ~500 bytes | Every 5 seconds |
| N2YO response | ~1-2 KB | Every 5 seconds |
| TLE data per satellite | ~200 bytes | On demand |
| Telemetry record | ~100 bytes | Per update |

---

## Production Checklist

- [ ] Update BACKEND_URL to production domain
- [ ] Verify N2YO_API_KEY is secure (vault, not in code)
- [ ] Enable CORS only for your domain (if needed)
- [ ] Add rate limiting to N2YO endpoint
- [ ] Monitor API usage and costs
- [ ] Set up database backups
- [ ] Test fallback chain behavior
- [ ] Enable logging and monitoring
- [ ] Add authentication to backend (if needed)
- [ ] Configure HTTPS/SSL certificates

---

## Debugging Tips

### Check if N2YO is being used
```javascript
// In liveSatelliteService.subscribe callback
console.log("Satellite source:", updates[0].source);  // "N2YO", "TLE", or "MOCK"
```

### Verify backend is responding
```bash
curl -v "http://localhost:8000/api/v1/docs"
# Look for: HTTP/1.1 200 OK
```

### Check network requests in Expo
```javascript
// Enable network logging
// import { ... } from 'react-native/Libraries/Network/RCTNetworking';
// In App.js on first load:
// global.XMLHttpRequest = XMLHttpRequest;
```

### Monitor polling frequency
```javascript
let lastUpdate = Date.now();
const unsubscribe = liveSatelliteService.subscribe(satIds, (updates) => {
  const now = Date.now();
  console.log(`Update interval: ${now - lastUpdate}ms`);
  lastUpdate = now;
});
```

---

## Related Documentation

- [N2YO API Docs](https://www.n2yo.com/api/)
- [Celestrak TLE Format](https://celestrak.com/)
- [satellite.js Documentation](https://github.com/shashwatak/satellite-js)
- [React Native Async Storage](https://react-native-async-storage.github.io/async-storage/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

Last Updated: 2024
