import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Activity, ShieldAlert, Compass, Radio, VolumeX, Volume2 } from 'lucide-react';

const groundBase = {
  name: 'Ground Base Alpha (India)',
  latitude: 15.5047,
  longitude: 77.376
};

const GROUND_STATIONS = [
  { name: 'Ground Base Alpha (India)', latitude: 15.5047, longitude: 77.3760, code: 'GS-ALPHA' },
  { name: 'Kennedy Space Center (USA)', latitude: 28.5721, longitude: -80.6480, code: 'GS-KSC' },
  { name: 'Baikonur Cosmodrome (Kazakhstan)', latitude: 45.9650, longitude: 63.3050, code: 'GS-BAIK' },
  { name: 'Guiana Space Centre (Europe/FR)', latitude: 5.2360, longitude: -52.7680, code: 'GS-CSG' }
];

const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const getBearingBetweenPoints = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lon2 - lon1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
};

const getApproachDirectionName = (bearing) => {
  if (bearing >= 337.5 || bearing < 22.5) return 'North';
  if (bearing >= 22.5 && bearing < 67.5) return 'North-East';
  if (bearing >= 67.5 && bearing < 112.5) return 'East';
  if (bearing >= 112.5 && bearing < 157.5) return 'South-East';
  if (bearing >= 157.5 && bearing < 202.5) return 'South';
  if (bearing >= 202.5 && bearing < 247.5) return 'South-West';
  if (bearing >= 247.5 && bearing < 292.5) return 'West';
  if (bearing >= 292.5 && bearing < 337.5) return 'North-West';
  return 'Unknown';
};

const getAlertDetails = (distanceKm) => {
  if (distanceKm <= 1000) return { label: 'OVERHEAD PASS', color: 'text-cyber-magenta bg-cyber-magenta/10 border-cyber-magenta/30 shadow-[0_0_15px_rgba(255,45,85,0.15)] animate-pulse' };
  if (distanceKm <= 3000) return { label: 'CRITICAL SECTOR ALERT', color: 'text-cyber-orange bg-cyber-orange/10 border-cyber-orange/30 shadow-[0_0_12px_rgba(255,170,41,0.12)]' };
  if (distanceKm <= 6000) return { label: 'REGIONAL HORIZON TRACK', color: 'text-cyber-cyan bg-cyber-cyan/10 border-cyber-cyan/30 shadow-[0_0_12px_rgba(0,229,255,0.1)]' };
  return { label: 'NOMINAL COGNITIVE RANGE', color: 'text-slate-400 bg-white/[0.02] border-white/[0.05]' };
};

// Mercator projection logic (mapping Latitude/Longitude to Canvas X/Y)
const latLongToPixel = (lat, lon, width, height) => {
  const x = ((lon + 180) / 360) * width;
  const maxLat = 85;
  const clampedLat = Math.max(-maxLat, Math.min(maxLat, lat));
  const clampedLatRad = (clampedLat * Math.PI) / 180;
  const mercN = Math.log(Math.tan((Math.PI / 4) + (clampedLatRad / 2)));
  const maxMerc = Math.log(Math.tan((Math.PI / 4) + ((maxLat * Math.PI) / 180 / 2)));
  const y = (height / 2) - (mercN / (2 * maxMerc)) * (height * 0.82);
  return { x, y };
};

// Inverse Mercator projection logic (mapping Canvas X/Y back to Latitude/Longitude)
const pixelToLatLong = (x, y, width, height) => {
  const lon = (x / width) * 360 - 180;
  const maxLat = 85;
  const maxMerc = Math.log(Math.tan((Math.PI / 4) + ((maxLat * Math.PI) / 180 / 2)));
  const mercN = ((height / 2 - y) / (height * 0.82)) * (2 * maxMerc);
  const latRad = 2 * Math.atan(Math.exp(mercN)) - Math.PI / 2;
  const lat = (latRad * 180) / Math.PI;
  return {
    latitude: Math.max(-90, Math.min(90, lat)),
    longitude: Math.max(-180, Math.min(180, lon))
  };
};

// Keplerian elliptical trajectory coordinate calculator
const getSatellitePositionAtTime = (sat, timeSecs) => {
  const e = sat.eccentricity || 0.15;
  const inclinationRad = (sat.inclination * Math.PI) / 180;
  
  // True anomaly theta advances with angular speed
  const theta = sat.angle + sat.angularSpeed * timeSecs;
  
  // Radius variation due to eccentricity (Keplerian orbit)
  const r = (1 - e * e) / (1 + e * Math.cos(theta)); 
  
  // Orbital plane coordinates
  const xp = r * Math.cos(theta);
  const yp = r * Math.sin(theta);
  
  // Rotate to 3D Earth-centered inertial approximation frame
  const lan = sat.phase * Math.PI / 3.0; // Longitude of ascending node
  const argPerigee = sat.phase * 0.5; // Argument of perigee
  
  const x_rot = xp * Math.cos(argPerigee) - yp * Math.sin(argPerigee);
  const y_rot = xp * Math.sin(argPerigee) + yp * Math.cos(argPerigee);
  
  const x3d = x_rot * Math.cos(lan) - y_rot * Math.sin(lan) * Math.cos(inclinationRad);
  const y3d = x_rot * Math.sin(lan) + y_rot * Math.cos(lan) * Math.cos(inclinationRad);
  const z3d = y_rot * Math.sin(inclinationRad);
  
  const radius = Math.sqrt(x3d * x3d + y3d * y3d + z3d * z3d);
  let lat = Math.asin(z3d / radius) * 180 / Math.PI;
  let lon = Math.atan2(y3d, x3d) * 180 / Math.PI;
  
  // Apply Earth rotation drift
  const earthRotationSpeed = 0.002;
  lon = (lon - (timeSecs * earthRotationSpeed * 180 / Math.PI)) % 360;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  
  const currentAltitude = sat.altitude * r;
  const currentSpeed = sat.velocity * Math.sqrt((2 / r) - 1);
  
  return {
    latitude: lat,
    longitude: lon,
    altitude: currentAltitude,
    velocity: currentSpeed
  };
};

// High-fidelity simplified vector map landmass polygons (Latitude, Longitude)
const landmasses = [
  // North America
  [[-168, 66], [-140, 70], [-120, 73], [-100, 70], [-80, 72], [-70, 60], [-55, 52], [-65, 45], [-80, 25], [-90, 30], [-100, 20], [-105, 20], [-110, 10], [-95, 15], [-80, 9], [-77, 8], [-80, 22], [-85, 25], [-98, 30], [-120, 34], [-125, 48], [-135, 55], [-160, 60]],
  // South America
  [[-77, 8], [-72, 10], [-60, 5], [-50, -5], [-40, -8], [-35, -5], [-40, -20], [-60, -40], [-70, -53], [-75, -53], [-73, -40], [-72, -30], [-80, -10], [-81, -5]],
  // Africa
  [[-17, 32], [10, 37], [32, 31], [34, 27], [43, 12], [51, 11], [46, -5], [40, -15], [30, -30], [20, -35], [15, -34], [10, -10], [0, 5], [-10, 5], [-15, 12]],
  // Eurasia
  [[32, 31], [30, 40], [20, 45], [0, 45], [-10, 40], [-10, 36], [0, 36], [-8, 43], [-10, 50], [5, 52], [5, 60], [20, 65], [40, 68], [60, 70], [80, 73], [100, 76], [120, 74], [140, 72], [160, 70], [170, 65], [172, 60], [160, 55], [140, 53], [142, 40], [130, 36], [120, 32], [120, 20], [108, 15], [105, 20], [98, 10], [90, 22], [80, 15], [78, 8], [72, 20], [60, 25], [50, 12], [44, 15], [35, 30]],
  // Australia
  [[113, -25], [114, -15], [130, -11], [136, -11], [142, -22], [153, -33], [150, -38], [140, -38], [130, -32], [115, -34]],
  // Greenland
  [[-60, 83], [-50, 83], [-30, 80], [-20, 75], [-20, 70], [-40, 60], [-50, 60], [-60, 70]],
  // Great Britain & Ireland
  [[-10, 50], [-2, 50], [-2, 58], [-8, 58]],
  // Japan
  [[130, 32], [136, 35], [140, 38], [142, 43], [141, 45], [135, 40]],
  // Madagascar
  [[45, -25], [50, -15], [50, -12], [47, -25]],
  // Antarctica
  [[-180, -75], [180, -75], [180, -90], [-180, -90]]
];

export default function LiveTracker() {
  const [constellationDensity, setConstellationDensity] = useState(50);
  const [orbitalAltitude, setOrbitalAltitude] = useState(800);
  const [selectedId, setSelectedId] = useState('SAT-1000');
  const [isMuted, setIsMuted] = useState(true);
  const [tick, setTick] = useState(0);
  
  const [telemetry, setTelemetry] = useState({ latency: 24.5, collisionIndex: 0.12, downlinkSpeed: 850 });
  const [clickedPoint, setClickedPoint] = useState(null);
  const [hoveredSat, setHoveredSat] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Custom states and refs for interactive geospatial map
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const pingsRef = useRef([]);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Generate constellation blips dynamically with elliptical eccentricity
  const satellites = useMemo(() => {
    const list = [];
    const names = ['Starlink-E', 'OneWeb-B', 'GPS-III', 'IRIDIUM-S', 'NOAA-X', 'MetOp', 'TianGong', 'Cosmos', 'Aqua', 'Terra'];
    const colors = ['#00E5FF', '#00FF9D', '#FF2D55', '#FFAA29', '#AFAFFF'];
    
    // Always seed ISS (Zarya) as first satellite
    list.push({
      id: 'SAT-1000',
      name: 'ISS (Zarya)',
      noradId: 25544,
      color: '#00E5FF',
      altitude: 420,
      velocity: 27600,
      inclination: 51.6,
      phase: 0,
      angularSpeed: 0.08,
      angle: 0,
      eccentricity: 0.05
    });

    for (let i = 1; i < constellationDensity; i++) {
      const id = `SAT-${1000 + i}`;
      const name = `${names[i % names.length]}-${100 + i}`;
      const noradId = 40000 + i;
      const color = colors[i % colors.length];
      
      const inclination = 20 + (i * 137.5) % 80;
      const phase = i * 1.5;
      const altVariation = (Math.sin(i * 37) * 0.1) * orbitalAltitude;
      const altitude = orbitalAltitude + altVariation;
      const velocity = 28440 * Math.sqrt(6371 / (6371 + altitude));
      const angularSpeed = (velocity / (6371 + altitude)) * 0.05;
      const eccentricity = 0.05 + (i * 0.03) % 0.25;
      
      list.push({
        id,
        name,
        noradId,
        color,
        altitude,
        velocity,
        inclination,
        phase,
        angularSpeed,
        angle: phase,
        eccentricity
      });
    }
    return list;
  }, [constellationDensity, orbitalAltitude]);

  // Telemetry calculation
  const calculateTelemetry = (density, altitude) => {
    const baseLatency = 10 + (altitude / 100) * 1.5;
    const baseCollisionIndex = (density * 0.08) / (altitude / 500);
    const baseSpeed = (1500 - (altitude / 2)) * (1 + (density / 300));
    return {
      latency: baseLatency + (Math.random() - 0.5) * 1.5,
      collisionIndex: Math.min(99.9, Math.max(0.01, baseCollisionIndex + (Math.random() - 0.5) * 0.05)),
      downlinkSpeed: Math.max(10, baseSpeed + (Math.random() - 0.5) * 20)
    };
  };

  // Sync HUD and general tick rate
  useEffect(() => {
    const updateTelemetry = () => {
      setTelemetry(calculateTelemetry(constellationDensity, orbitalAltitude));
      setTick((t) => t + 1);
    };
    
    updateTelemetry();
    const timer = setInterval(updateTelemetry, 1000);
    return () => clearInterval(timer);
  }, [constellationDensity, orbitalAltitude]);

  const activeSatellite = useMemo(() => {
    return satellites.find((s) => s.id === selectedId) || satellites[0];
  }, [satellites, selectedId]);

  // Calculate coordinates and details dynamically for active satellite
  const activeSatelliteDataRaw = useMemo(() => {
    if (!activeSatellite) return null;
    const currentTimeSecs = Date.now() / 1000;
    const pos = getSatellitePositionAtTime(activeSatellite, currentTimeSecs);
    
    const distanceKm = calculateDistanceKm(
      pos.latitude,
      pos.longitude,
      groundBase.latitude,
      groundBase.longitude
    );

    const bearing = getBearingBetweenPoints(
      groundBase.latitude,
      groundBase.longitude,
      pos.latitude,
      pos.longitude
    );

    return {
      ...activeSatellite,
      latitude: pos.latitude,
      longitude: pos.longitude,
      altitude: pos.altitude,
      velocity: pos.velocity,
      distanceKm,
      bearing
    };
  }, [activeSatellite, tick]);

  // HUD Active Target Data: Maps either the clicked coordinates or the selected satellite
  const activeSatelliteData = useMemo(() => {
    if (clickedPoint) {
      if (clickedPoint.type === 'satellite') {
        const sat = satellites.find(s => s.id === clickedPoint.id) || activeSatellite;
        const currentTimeSecs = Date.now() / 1000;
        const pos = getSatellitePositionAtTime(sat, currentTimeSecs);
        const distanceKm = calculateDistanceKm(pos.latitude, pos.longitude, groundBase.latitude, groundBase.longitude);
        const bearing = getBearingBetweenPoints(groundBase.latitude, groundBase.longitude, pos.latitude, pos.longitude);
        return {
          id: sat.id,
          name: sat.name,
          noradId: sat.noradId,
          latitude: pos.latitude,
          longitude: pos.longitude,
          distanceKm,
          bearing,
          velocity: pos.velocity,
          altitude: pos.altitude,
          color: sat.color,
          type: 'satellite'
        };
      } else {
        const distanceKm = calculateDistanceKm(clickedPoint.latitude, clickedPoint.longitude, groundBase.latitude, groundBase.longitude);
        const bearing = getBearingBetweenPoints(groundBase.latitude, groundBase.longitude, clickedPoint.latitude, clickedPoint.longitude);
        return {
          id: clickedPoint.id,
          name: clickedPoint.name,
          noradId: clickedPoint.type === 'ground_station' ? 'GS-STATION' : 'USER-LOCK',
          latitude: clickedPoint.latitude,
          longitude: clickedPoint.longitude,
          distanceKm,
          bearing,
          velocity: 0,
          altitude: 0,
          color: clickedPoint.type === 'ground_station' ? '#00FF9D' : '#FF2D55',
          type: clickedPoint.type
        };
      }
    }
    return activeSatelliteDataRaw;
  }, [clickedPoint, activeSatelliteDataRaw, satellites, activeSatellite]);

  const alertStatus = useMemo(() => {
    if (!activeSatelliteData) return { label: 'UNKNOWN', color: 'text-slate-400' };
    return getAlertDetails(activeSatelliteData.distanceKm);
  }, [activeSatelliteData]);

  // Audio warning triggers
  useEffect(() => {
    if (activeSatelliteData && !isMuted && activeSatelliteData.distanceKm <= 3000 && activeSatelliteData.velocity > 0) {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(activeSatelliteData.distanceKm <= 1000 ? 1200 : 800, audioCtx.currentTime);
      
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    }
  }, [activeSatelliteData?.distanceKm, isMuted]);

  // ResizeObserver for canvas dynamic sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
        }
      }
    });

    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Main high-performance map rendering loop
  useEffect(() => {
    const loop = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      lastTimeRef.current = timestamp;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (canvas.width === 0 || canvas.height === 0) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // 1. Draw glowing digital deep space background
          ctx.fillStyle = '#050914';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 2. Draw high-contrast world map continents base layer
          ctx.fillStyle = 'rgba(20, 32, 60, 0.7)';
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.25)';
          ctx.lineWidth = 1.2;

          landmasses.forEach((poly) => {
            ctx.beginPath();
            poly.forEach((coord, idx) => {
              const pos = latLongToPixel(coord[1], coord[0], canvas.width, canvas.height);
              if (idx === 0) ctx.moveTo(pos.x, pos.y);
              else ctx.lineTo(pos.x, pos.y);
            });
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          });

          // 3. Draw latitude/longitude grid graticules
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.05)';
          ctx.lineWidth = 0.5;
          
          for (let lat = -80; lat <= 80; lat += 20) {
            ctx.beginPath();
            for (let lon = -180; lon <= 180; lon += 5) {
              const pos = latLongToPixel(lat, lon, canvas.width, canvas.height);
              if (lon === -180) ctx.moveTo(pos.x, pos.y);
              else ctx.lineTo(pos.x, pos.y);
            }
            ctx.stroke();
          }

          for (let lon = -180; lon <= 180; lon += 30) {
            ctx.beginPath();
            for (let lat = -80; lat <= 80; lat += 5) {
              const pos = latLongToPixel(lat, lon, canvas.width, canvas.height);
              if (lat === -80) ctx.moveTo(pos.x, pos.y);
              else ctx.lineTo(pos.x, pos.y);
            }
            ctx.stroke();
          }

          // Draw Ping Ripples (interaction proof)
          pingsRef.current = pingsRef.current.filter(p => {
            p.radius += 2.0;
            p.alpha = 1 - (p.radius / p.maxRadius);
            if (p.alpha > 0) {
              ctx.strokeStyle = p.color;
              ctx.lineWidth = 2;
              ctx.globalAlpha = p.alpha;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.stroke();
              ctx.globalAlpha = 1.0;
              return true;
            }
            return false;
          });

          // 4. Draw Trajectory Path line for selected satellite (elliptical trajectory representation)
          if (activeSatellite) {
            ctx.strokeStyle = activeSatellite.color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            
            const steps = 120;
            let first = true;
            let prevPos = null;

            for (let j = 0; j <= steps; j++) {
              const angle = (j / steps) * Math.PI * 2;
              const mockSat = {
                ...activeSatellite,
                angle: angle,
                angularSpeed: 0
              };
              const pos3d = getSatellitePositionAtTime(mockSat, 0);
              const pos = latLongToPixel(pos3d.latitude, pos3d.longitude, canvas.width, canvas.height);

              if (first) {
                ctx.moveTo(pos.x, pos.y);
                first = false;
              } else {
                if (Math.abs(pos.x - prevPos.x) > canvas.width * 0.8) {
                  ctx.stroke();
                  ctx.beginPath();
                  ctx.moveTo(pos.x, pos.y);
                } else {
                  ctx.lineTo(pos.x, pos.y);
                }
              }
              prevPos = pos;
            }
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // 5. Draw Ground Stations
          GROUND_STATIONS.forEach((gs) => {
            const pos = latLongToPixel(gs.latitude, gs.longitude, canvas.width, canvas.height);
            const isBase = gs.code === 'GS-ALPHA';
            ctx.fillStyle = isBase ? '#00FF9D' : '#00E5FF';
            ctx.shadowBlur = isBase ? 8 : 4;
            ctx.shadowColor = ctx.fillStyle;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, isBase ? 5.5 : 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = '7px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(gs.code, pos.x, pos.y - 6);
          });

          // 6. Draw custom clicked location lock indicator
          if (clickedPoint && clickedPoint.type === 'custom') {
            const pos = latLongToPixel(clickedPoint.latitude, clickedPoint.longitude, canvas.width, canvas.height);
            ctx.strokeStyle = '#FF2D55';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 8 + Math.sin(timestamp / 100) * 2, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = '#FF2D55';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            ctx.fill();
          }

          // 7. Draw Satellite Nodes (Animate using requestAnimationFrame along orbital paths)
          const timeSecs = Date.now() / 1000;
          satellites.forEach((sat) => {
            const pos3d = getSatellitePositionAtTime(sat, timeSecs);
            const pos = latLongToPixel(pos3d.latitude, pos3d.longitude, canvas.width, canvas.height);

            const isSelected = sat.id === selectedId && (!clickedPoint || clickedPoint.type === 'satellite' && clickedPoint.id === sat.id);
            const isHovered = hoveredSat && hoveredSat.id === sat.id;

            // Draw selection halo
            if (isSelected) {
              ctx.strokeStyle = '#FF2D55'; // Selected/clicked nodes halo in Magenta
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(pos.x, pos.y, 10 + Math.sin(timestamp / 100) * 2, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Draw circular glowing node (Magenta if clicked/selected, Cyber-Cyan for active nodes)
            const radius = isHovered ? 7.5 : (isSelected ? 5.5 : 4);
            ctx.fillStyle = isSelected ? '#FF2D55' : '#00E5FF';
            ctx.shadowBlur = isHovered ? 15 : (isSelected ? 10 : 4);
            ctx.shadowColor = ctx.fillStyle;

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Text labels for selected or hovered
            if (isSelected || isHovered) {
              ctx.fillStyle = '#ffffff';
              ctx.font = 'bold 8px Courier New';
              ctx.textAlign = 'left';
              ctx.fillText(sat.id, pos.x + 8, pos.y - 4);
            }
          });

          // 8. Draw hover tooltip on map
          if (hoveredSat) {
            ctx.fillStyle = 'rgba(5, 9, 20, 0.9)';
            ctx.strokeStyle = '#00E5FF';
            ctx.lineWidth = 1;
            
            const tooltipText = `${hoveredSat.name} (${hoveredSat.id})`;
            ctx.font = '9px Courier New';
            const textW = ctx.measureText(tooltipText).width;
            
            const tooltipW = textW + 16;
            const tooltipH = 20;
            const tooltipX = Math.min(canvas.width - tooltipW - 10, mousePos.x + 12);
            const tooltipY = Math.min(canvas.height - tooltipH - 10, mousePos.y - 12);
            
            ctx.beginPath();
            ctx.roundRect(tooltipX, tooltipY, tooltipW, tooltipH, 4);
            ctx.fill();
            ctx.stroke();
            
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(tooltipText, tooltipX + 8, tooltipY + tooltipH / 2);
          }

          // System status label in center-bottom
          ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
          ctx.font = 'bold 9px Courier New';
          ctx.textAlign = 'center';
          ctx.fillText('GEOSPATIAL VECTOR MAP: TRACKING ON', canvas.width / 2, canvas.height - 12);
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(loop);
    };

    animationFrameIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [satellites, selectedId, hoveredSat, mousePos, clickedPoint, activeSatellite]);

  // Mouse hover coordinate checker
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const timeSecs = Date.now() / 1000;
    let foundSat = null;
    let minDistance = 15; // 15px hover threshold

    satellites.forEach((sat) => {
      const pos3d = getSatellitePositionAtTime(sat, timeSecs);
      const pos = latLongToPixel(pos3d.latitude, pos3d.longitude, canvas.width, canvas.height);

      const dist = Math.hypot(x - pos.x, y - pos.y);
      if (dist < minDistance) {
        foundSat = sat;
        minDistance = dist;
      }
    });

    setHoveredSat(foundSat);
  };

  // Click handler on map canvas
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const timeSecs = Date.now() / 1000;
    let nearestSat = null;
    let minDistance = 20;

    // Check if clicked a satellite node
    satellites.forEach((sat) => {
      const pos3d = getSatellitePositionAtTime(sat, timeSecs);
      const pos = latLongToPixel(pos3d.latitude, pos3d.longitude, canvas.width, canvas.height);

      const dist = Math.hypot(clickX - pos.x, clickY - pos.y);
      if (dist < minDistance) {
        nearestSat = sat;
        minDistance = dist;
      }
    });

    // Interaction registration ping (Magenta ripple at click-coordinates)
    pingsRef.current.push({ x: clickX, y: clickY, radius: 5, maxRadius: 40, alpha: 1, color: '#FF2D55' });

    if (nearestSat) {
      const satPos = getSatellitePositionAtTime(nearestSat, timeSecs);
      setSelectedId(nearestSat.id);
      
      // Update local state selectedSatellite with coordinates & telemetry data
      setSelectedSatellite({
        id: nearestSat.id,
        name: nearestSat.name,
        latitude: satPos.latitude,
        longitude: satPos.longitude,
        velocity: satPos.velocity,
        altitude: satPos.altitude,
        x: clickX,
        y: clickY
      });

      setClickedPoint({
        type: 'satellite',
        id: nearestSat.id,
        name: nearestSat.name
      });
      return;
    }

    // Check if clicked a ground station
    let nearestGS = null;
    minDistance = 20;
    GROUND_STATIONS.forEach((gs) => {
      const pos = latLongToPixel(gs.latitude, gs.longitude, canvas.width, canvas.height);
      const dist = Math.hypot(clickX - pos.x, clickY - pos.y);
      if (dist < minDistance) {
        nearestGS = gs;
        minDistance = dist;
      }
    });

    if (nearestGS) {
      setSelectedSatellite(null);
      setClickedPoint({
        type: 'ground_station',
        id: nearestGS.code,
        name: nearestGS.name,
        latitude: nearestGS.latitude,
        longitude: nearestGS.longitude
      });
      return;
    }

    // Otherwise click is a custom coordinate lock
    const coords = pixelToLatLong(clickX, clickY, canvas.width, canvas.height);
    setSelectedSatellite(null);
    setClickedPoint({
      type: 'custom',
      id: 'USER-LOCK',
      name: 'Custom Intersection Target',
      latitude: coords.latitude,
      longitude: coords.longitude
    });
  };

  const selectedSatelliteDataLive = useMemo(() => {
    if (!selectedSatellite) return null;
    const sat = satellites.find(s => s.id === selectedSatellite.id);
    if (!sat) return null;
    const timeSecs = Date.now() / 1000;
    const pos = getSatellitePositionAtTime(sat, timeSecs);
    return {
      ...selectedSatellite,
      latitude: pos.latitude,
      longitude: pos.longitude,
      velocity: pos.velocity,
      altitude: pos.altitude
    };
  }, [selectedSatellite, satellites, tick]);

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen max-w-5xl mx-auto space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wider uppercase font-sans">
            Satellite Radar
          </h2>
          <p className="text-xs text-cyber-cyan font-bold tracking-widest uppercase mt-0.5">
            Geospatial Telemetry Tracker
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-cyber-cyan/30 text-slate-400 hover:text-slate-200 cursor-pointer transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-cyber-cyan" />}
          </button>

          <div className="flex items-center gap-1.5 bg-[#101726]/80 px-3 py-1.5 rounded-lg border border-border-cyan/50 text-[10px] font-bold text-cyber-cyan/80 tracking-widest uppercase font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyber-cyan" />
            Downlink Latency: {telemetry.latency.toFixed(1)} ms
          </div>
        </div>
      </div>

      {/* Radar Canvas Widget Container */}
      <div ref={containerRef} className="glass-panel p-2 rounded-2xl border border-border-cyan/20 relative overflow-hidden h-[420px] bg-[#03060f]/60">
        {/* Absolute Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 glass-panel p-4 rounded-xl border border-border-cyan/20 bg-[#03060f]/90 w-64 space-y-3 shadow-2xl">
          <div className="text-[10px] font-bold text-cyber-cyan tracking-wider uppercase">Radar Configuration</div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-400">
              <span>Constellation Density</span>
              <span className="text-cyber-cyan">{constellationDensity} Nodes</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="150" 
              value={constellationDensity} 
              onChange={(e) => setConstellationDensity(parseInt(e.target.value))} 
              className="w-full accent-cyber-cyan bg-white/10 h-1 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-bold text-slate-400">
              <span>Orbital Altitude</span>
              <span className="text-cyber-green">{orbitalAltitude} km</span>
            </div>
            <input 
              type="range" 
              min="200" 
              max="2000" 
              value={orbitalAltitude} 
              onChange={(e) => setOrbitalAltitude(parseInt(e.target.value))} 
              className="w-full accent-cyber-green bg-white/10 h-1 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Absolute Stats HUD Overlay */}
        <div className="absolute top-4 right-4 z-10 glass-panel p-4 rounded-xl border border-border-cyan/20 bg-[#03060f]/90 w-52 space-y-2.5 shadow-2xl">
          <div className="text-[10px] font-bold text-cyber-cyan tracking-wider uppercase">System Performance</div>
          
          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-300">
            <span>Latency</span>
            <span className="font-mono text-cyber-cyan">{telemetry.latency.toFixed(1)} ms</span>
          </div>

          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-300">
            <span>Collision Index</span>
            <span className="font-mono text-cyber-magenta">{telemetry.collisionIndex.toFixed(3)}%</span>
          </div>

          <div className="flex justify-between items-center text-[10px] font-semibold text-slate-300">
            <span>Downlink Speed</span>
            <span className="font-mono text-cyber-green">{telemetry.downlinkSpeed.toFixed(0)} Mbps</span>
          </div>
        </div>

        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredSat(null)}
          className="w-full h-full block rounded-xl cursor-crosshair"
        />

        {/* Floating Geospatial Info Overlay Card */}
        {selectedSatelliteDataLive && (
          <div 
            className="absolute z-30 p-3 rounded-xl border border-cyber-magenta bg-[#03060f]/95 shadow-[0_0_20px_rgba(255,45,85,0.25)] w-56 space-y-2 pointer-events-auto"
            style={{
              left: `${Math.max(10, Math.min(containerRef.current ? containerRef.current.clientWidth - 240 : 200, selectedSatelliteDataLive.x + 15))}px`,
              top: `${Math.max(10, Math.min(containerRef.current ? containerRef.current.clientHeight - 150 : 200, selectedSatelliteDataLive.y - 65))}px`,
              transition: 'left 0.1s ease-out, top 0.1s ease-out'
            }}
          >
            <div className="flex justify-between items-center border-b border-white/[0.1] pb-1.5">
              <span className="text-[10px] font-black text-cyber-magenta tracking-wider uppercase font-mono">🛰️ ID: {selectedSatelliteDataLive.id}</span>
              <button 
                onClick={() => {
                  setSelectedSatellite(null);
                  setSelectedId(satellites[0].id);
                  setClickedPoint(null);
                }}
                className="text-[9px] font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/[0.05] hover:bg-white/15 cursor-pointer"
              >
                CLOSE
              </button>
            </div>
            <div className="space-y-1.5 text-[9px] font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">LATITUDE:</span>
                <span className="text-white font-bold">{selectedSatelliteDataLive.latitude.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">LONGITUDE:</span>
                <span className="text-white font-bold">{selectedSatelliteDataLive.longitude.toFixed(6)}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SPEED:</span>
                <span className="text-cyber-cyan font-bold">{Math.round(selectedSatelliteDataLive.velocity).toLocaleString()} km/h</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Stats and warning alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ground warning alert widget */}
        <div className="glass-panel p-5 rounded-2xl border border-border-cyan/20 md:col-span-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-lg bg-cyber-magenta/10 flex items-center justify-center border border-cyber-magenta/30 text-cyber-magenta animate-pulse">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">
                Proximity Defense
              </h3>
            </div>
            
            <div className="h-[1px] bg-white/[0.05]" />
          </div>

          {activeSatelliteData && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase">Current Warning Level</span>
                <div className={`border rounded-xl px-4 py-2 text-xs font-black tracking-widest text-center ${alertStatus.color}`}>
                  {alertStatus.label}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Distance to Base</span>
                  <span className="text-sm font-black text-white font-mono">{Math.round(activeSatelliteData.distanceKm).toLocaleString()} km</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Approach bearing</span>
                  <span className="text-sm font-black text-white font-mono flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-cyber-cyan" />
                    {getApproachDirectionName(activeSatelliteData.bearing)} ({Math.round(activeSatelliteData.bearing)}°)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="text-[8px] text-slate-500 font-semibold uppercase tracking-wider text-center">
            Handshake: Node GS-ALPHA online
          </div>
        </div>

        {/* Detailed Telemetry details */}
        <div className="glass-panel p-5 rounded-2xl border border-border-cyan/20 md:col-span-2 space-y-4">
          {activeSatelliteData && (
            <>
              <div className="flex gap-2.5 items-center">
                <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 flex items-center justify-center border border-cyber-cyan/20 text-cyber-cyan shadow-[0_0_10px_rgba(0,229,255,0.1)]">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-widest uppercase">
                    Live Vessel Telemetry
                  </h3>
                  <p className="text-[9px] text-cyber-cyan/85 font-semibold mt-0.5">Selected: {activeSatelliteData.name}</p>
                </div>
              </div>

              <div className="h-[1px] bg-white/[0.05]" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">NORAD Ident</span>
                  <span className="text-base font-black text-white font-mono">{activeSatelliteData.noradId}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Velocity vector</span>
                  <span className="text-base font-black text-white font-mono text-cyber-cyan">
                    {activeSatelliteData.velocity > 0 ? `${Math.round(activeSatelliteData.velocity).toLocaleString()} km/h` : 'STATIONARY'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Orbital altitude</span>
                  <span className="text-base font-black text-white font-mono text-cyber-green">
                    {activeSatelliteData.altitude > 0 ? `${Math.round(activeSatelliteData.altitude).toLocaleString()} km` : 'GROUND LEVEL'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Classification</span>
                  <span className="text-base font-black text-white font-mono">
                    {activeSatelliteData.altitude === 0 ? 'STATIC' : (activeSatelliteData.altitude < 1500 ? 'LEO Class' : 'MEO Class')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Telemetry Latitude</span>
                  <span className="text-sm font-semibold text-slate-300 font-mono">{activeSatelliteData.latitude.toFixed(6)}°</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Telemetry Longitude</span>
                  <span className="text-sm font-semibold text-slate-300 font-mono">{activeSatelliteData.longitude.toFixed(6)}°</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fleet data list */}
      <div className="glass-panel rounded-2xl border border-border-cyan/20 overflow-hidden">
        <div className="p-4 bg-white/[0.01] border-b border-white/[0.04]">
          <h3 className="text-xs font-bold text-white tracking-widest uppercase">
            Active Satellite Fleet Status (Realtime Synchronized)
          </h3>
        </div>
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-slate-400 font-semibold tracking-wider text-[10px] uppercase sticky top-0 bg-[#0c1220] z-20">
                <th className="p-4">Norad ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Latitude</th>
                <th className="p-4">Longitude</th>
                <th className="p-4">Altitude</th>
                <th className="p-4">Speed</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {satellites.slice(0, 15).map((sat) => {
                const isSelected = selectedId === sat.id && (!clickedPoint || clickedPoint.type === 'satellite' && clickedPoint.id === sat.id);
                const currentTimeSecs = Date.now() / 1000;
                const pos = getSatellitePositionAtTime(sat, currentTimeSecs);
                
                return (
                  <tr
                    key={sat.id}
                    onClick={() => {
                      setSelectedId(sat.id);
                      setClickedPoint({
                        type: 'satellite',
                        id: sat.id,
                        name: sat.name
                      });
                      
                      // Also position the selected overlay on table row click
                      const canvas = canvasRef.current;
                      if (canvas) {
                        const pixel = latLongToPixel(pos.latitude, pos.longitude, canvas.width, canvas.height);
                        setSelectedSatellite({
                          id: sat.id,
                          name: sat.name,
                          latitude: pos.latitude,
                          longitude: pos.longitude,
                          velocity: pos.velocity,
                          altitude: pos.altitude,
                          x: pixel.x,
                          y: pixel.y
                        });
                        // Add magenta ripple at satellite position
                        pingsRef.current.push({ x: pixel.x, y: pixel.y, radius: 5, maxRadius: 40, alpha: 1, color: '#FF2D55' });
                      }
                    }}
                    className={`cursor-pointer transition-colors duration-200 ${
                      isSelected ? 'bg-cyber-cyan/5 hover:bg-cyber-cyan/10' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="p-4 font-mono font-bold text-slate-400">{sat.noradId}</td>
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isSelected ? '#FF2D55' : sat.color }} />
                      {sat.name}
                    </td>
                    <td className="p-4 font-mono text-slate-300">{pos.latitude.toFixed(4)}°</td>
                    <td className="p-4 font-mono text-slate-300">{pos.longitude.toFixed(4)}°</td>
                    <td className="p-4 font-mono text-cyber-green">{Math.round(pos.altitude).toLocaleString()} km</td>
                    <td className="p-4 font-mono text-cyber-cyan">{Math.round(pos.velocity).toLocaleString()} km/h</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase bg-cyber-green/10 text-cyber-green border border-cyber-green/20">
                        Signal: 100%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
