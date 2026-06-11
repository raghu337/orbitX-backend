# 🛰️ OrbitX ETA System - Developer Quick Reference

## 📦 What's Included

### New Files (3)
- `src/services/satelliteETAService.js` - ETA calculation engine
- `src/services/audioWarningService.js` - Audio alert system
- `src/components/dashboard/SatelliteArrivalCard.js` - Countdown UI

### Updated Files (5)
- `src/services/satelliteProximityService.js` - Smart notification integration
- `src/notifications/notificationService.js` - ETA-based alerts
- `src/components/settings/SatelliteProximityAlertCard.js` - Enhanced card
- `App.js` - Audio initialization
- `src/hooks/useSatelliteAlerts.js` - Already had integration

### Documentation (3)
- `REALTIME_ALERTS_GUIDE.md` - Phase 1 documentation
- `ETA_PREDICTION_SYSTEM.md` - Comprehensive ETA guide
- `IMPLEMENTATION_SUMMARY.md` - This implementation overview

---

## 🔑 Key APIs

### ETA Service
```javascript
import satelliteETAService from './services/satelliteETAService';

// Main function
const eta = satelliteETAService.calculateETA(satellite, lat, lon);

// Returns: {distance, bearing, direction, eta, state, message, ...}

// Other functions
satelliteETAService.calculateBearing(lat1, lon1, lat2, lon2); // → degrees
satelliteETAService.getDirection(bearing); // → "N", "NE", "E", etc.
satelliteETAService.calculateNextPass(satellite, lat, lon); // → pass data
await satelliteETAService.recordPass(satellite, data); // → history
await satelliteETAService.getPassHistory(satelliteName, limit); // → array
satelliteETAService.cacheETA(satelliteName, eta); // → cache
satelliteETAService.getCachedETA(satelliteName); // → cached eta
```

### Audio Service
```javascript
import audioWarningService from './services/audioWarningService';

// Initialize
await audioWarningService.initializeAudio();

// Play alerts
await audioWarningService.playAlertSound(etaSeconds, muted);

// Get info
const levelName = audioWarningService.getAlertLevelName(etaSeconds);
const color = audioWarningService.getAlertColor(etaSeconds);

// Cleanup
await audioWarningService.cleanup();
```

### Proximity Service (Enhanced)
```javascript
import satelliteProximityService from './services/satelliteProximityService';

// Check single satellite
await satelliteProximityService.checkSatelliteProximity(
  satellite, userLat, userLon, locationName
);

// Start monitoring
const stopMonitoring = await satelliteProximityService.startMonitoring(
  [25544, 20580, 25338], // satellite IDs
  13.0827, 80.2707,      // user location
  "Chennai",             // location name
  30000                  // interval (ms)
);

// Later...
stopMonitoring(); // Stop monitoring

// Get tracked data
const alerts = satelliteProximityService.getTrackedAlerts();
// Returns: { ISS: {distance, eta, state, ...}, ... }

// Get history
const history = await satelliteProximityService.getPassHistory('ISS', 10);

// Clear all
await satelliteProximityService.clearAllAlerts();
```

### Notification Service (Enhanced)
```javascript
import {
  sendETANotification,
  send5MinutesBeforeNotification,
  send2MinutesBeforeNotification,
  sendOverheadNotification,
  sendExitingNotification,
} from './notifications/notificationService';

// Smart notifications
await sendETANotification(satellite, etaSeconds, distance, bearing, direction);
await send5MinutesBeforeNotification(satellite, direction);
await send2MinutesBeforeNotification(satellite, direction, distance);
await sendOverheadNotification(satellite);
await sendExitingNotification(satellite);
```

### UI Component
```javascript
import SatelliteArrivalCard from './components/dashboard/SatelliteArrivalCard';

<SatelliteArrivalCard
  satellite={satellite}
  eta={eta}
  isTracking={true}
/>
```

---

## 📊 Data Structures

### ETA Object
```javascript
{
  distance: "12.45",           // km (string)
  distanceNum: 12.45,          // km (number)
  bearing: "45.3",             // degrees 0-360 (string)
  direction: "NE",             // compass direction (string)
  eta: "03:24",                // MM:SS format (string)
  etaSeconds: 204,             // seconds (number)
  state: "NEARBY",             // current state (string)
  message: "ETA: 3m 24s",      // human readable (string)
  isApproaching: true,         // boolean
  isOverhead: false,           // boolean
  isDirectlyOverhead: false    // boolean
}
```

### Tracked Alert Object
```javascript
{
  distance: "12.45",
  distanceNum: 12.45,
  bearing: "45.3",
  direction: "NE",
  eta: "03:24",
  etaSeconds: 204,
  state: "NEARBY",
  message: "ETA: 3m 24s",
  timestamp: 1707315600000
}
```

### Pass History Entry
```javascript
{
  timestamp: 1707315600000,    // when pass occurred
  distance: 2.3,               // closest approach (km)
  bearing: 225,                // direction (degrees)
  direction: "SW",             // compass
  state: "DIRECTLY_OVERHEAD"   // peak state
}
```

---

## 🎯 Integration Points

### In Screens
```javascript
import SatelliteArrivalCard from '../components/dashboard/SatelliteArrivalCard';
import { useSatelliteAlerts } from '../hooks/useSatelliteAlerts';

export function MyScreen() {
  const { trackedAlerts } = useSatelliteAlerts();
  
  return (
    <ScrollView>
      {Object.entries(trackedAlerts).map(([name, eta]) => (
        <SatelliteArrivalCard
          key={name}
          satellite={{ name }}
          eta={eta}
          isTracking={true}
        />
      ))}
    </ScrollView>
  );
}
```

### In Hooks
```javascript
import satelliteETAService from '../services/satelliteETAService';

const calculateETA = useCallback(async (satellite) => {
  const eta = satelliteETAService.calculateETA(
    satellite,
    location.latitude,
    location.longitude
  );
  setETA(eta);
}, [location]);
```

### In Services
```javascript
import audioWarningService from './audioWarningService';

// In proximity service
const alertLevel = audioWarningService.getAlertLevelName(etaSeconds);
const alertColor = audioWarningService.getAlertColor(etaSeconds);
await audioWarningService.playAlertSound(etaSeconds, muted);
```

---

## 🔄 Data Flow

```
1. useSatelliteAlerts Hook
   ↓
2. startProximityMonitoring()
   ↓
3. satelliteProximityService.checkSatelliteProximity()
   ↓
4. satelliteETAService.calculateETA()
   ↓
5. Smart Notification Logic
   ├→ send*Notification()
   ├→ audioWarningService.playAlertSound()
   └→ recordPass()
   ↓
6. UI Updates
   └→ <SatelliteArrivalCard /> re-renders
```

---

## 🎨 State Colors

```javascript
const STATE_COLORS = {
  'FAR': '#00FF00',              // Green
  'APPROACHING': '#00CCFF',      // Cyan
  'NEARBY_WARNING': '#FFCC00',   // Yellow
  'NEARBY': '#FF9900',           // Orange
  'OVERHEAD': '#FF6600',         // Orange-Red
  'DIRECTLY_OVERHEAD': '#FF0000' // Red
};
```

---

## 📱 Notification Examples

### 5 Minutes Before
```
Title: "⏰ ISS in 5 minutes"
Body: "ISS will pass above your location from the NE. Get ready!"
Badge: 2
```

### 2 Minutes Before
```
Title: "🚨 ISS in 2 minutes!"
Body: "ISS will pass above you in 2 minutes from the NE (15km)!"
Badge: 3
Vibration: HEAVY
```

### Directly Overhead
```
Title: "⚠️ ISS DIRECTLY OVERHEAD!"
Body: "ISS is NOW passing directly above you! Look up immediately!"
Badge: 4
Vibration: EMERGENCY
```

### Exiting
```
Title: "👋 ISS Exiting"
Body: "ISS has passed and is moving away from your location."
Badge: 1
```

---

## 🧪 Debug/Test

### Log ETA Info
```javascript
const eta = satelliteETAService.calculateETA(sat, lat, lon);
console.log('[ETA]', {
  satellite: sat.name,
  distance: eta.distance,
  eta: eta.eta,
  state: eta.state,
  color: audioWarningService.getAlertColor(eta.etaSeconds),
});
```

### Force Notification
```javascript
import satelliteProximityService from './services/satelliteProximityService';

// Clear cooldown
await satelliteProximityService.clearAllAlerts();

// Manually trigger
const satellite = { name: 'ISS', latitude: 13.1, longitude: 80.3 };
await satelliteProximityService.checkSatelliteProximity(
  satellite, 13.0827, 80.2707, 'Test'
);
```

### View All Tracked
```javascript
const alerts = satelliteProximityService.getTrackedAlerts();
console.log(JSON.stringify(alerts, null, 2));
```

---

## 🐛 Common Issues

### Notifications not showing
- Check `PROXIMITY_ALERTS_ENABLED` in AsyncStorage
- Verify location permission granted
- Verify notification permission granted
- Check device notification settings

### ETA shows FAR
- Satellite > 1000 km away (normal)
- Wait for satellite to approach
- Check N2YO API status

### Countdown not updating
- Component not mounted
- Check ETA has `etaSeconds`
- Verify 1-second interval set

### Audio not playing
- Device not muted
- Check app audio permissions
- Check `audioWarningService.initializeAudio()` called

---

## 📚 File Reference

| File | Lines | Purpose |
|------|-------|---------|
| `satelliteETAService.js` | 300 | ETA calculations |
| `audioWarningService.js` | 200 | Audio alerts |
| `SatelliteArrivalCard.js` | 180 | UI countdown |
| `satelliteProximityService.js` | 350 | Smart notifications |
| `notificationService.js` | +150 | ETA alerts |
| `SatelliteProximityAlertCard.js` | +50 | Enhanced card |
| `App.js` | +10 | Audio init |

---

## 🎯 Constants

### Notification Triggers
```javascript
5 MINUTES = 300 seconds
2 MINUTES = 120 seconds
OVERHEAD = 60 seconds
EXITING = -30 seconds (after peak)
```

### Satellite Velocities (km/s)
```javascript
ISS = 7.66
HUBBLE = 7.59
NOAA = 7.45
DEFAULT = 7.5
```

### State Distance Thresholds
```javascript
FAR: > 1000 km
APPROACHING: 600-1000s away
NEARBY: 5-30 km
OVERHEAD: < 5 km
DIRECTLY_OVERHEAD: < 2 km
EXITING: increasing distance
```

---

## ✅ Checklist for New Developers

- [ ] Read `IMPLEMENTATION_SUMMARY.md` first
- [ ] Review `ETA_PREDICTION_SYSTEM.md` for algorithms
- [ ] Check `satelliteETAService.js` for core logic
- [ ] Test with `satelliteProximityService.getTrackedAlerts()`
- [ ] Check notifications work in test screen
- [ ] Verify colors change with proximity
- [ ] Test audio alerts
- [ ] Verify pass history records

---

**Everything is production-ready!** 🚀🛰️
