import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Activity, ShieldAlert, Navigation, Compass, Globe2, Radio, VolumeX, Volume2, Shield } from 'lucide-react';

const groundBase = {
  name: 'Ground Base Alpha (India)',
  latitude: 15.5047,
  longitude: 77.376
};

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

const getLatLonFromAngle = (angle) => {
  const latitude = Math.sin(angle) * 60;
  const longitude = ((angle * 180) / Math.PI + 180) % 360 - 180;
  return { latitude, longitude };
};

export default function LiveTracker() {
  const [constellationDensity, setConstellationDensity] = useState(50);
  const [orbitalAltitude, setOrbitalAltitude] = useState(800);
  const [selectedId, setSelectedId] = useState('SAT-1000');
  const [isMuted, setIsMuted] = useState(true);
  const [tick, setTick] = useState(0);
  
  const [telemetry, setTelemetry] = useState({ latency: 24.5, collisionIndex: 0.12, downlinkSpeed: 850 });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const lastTimeRef = useRef(0);
  const radarRotationRef = useRef(0);

  // Generate constellation blips
  const satellites = useMemo(() => {
    const list = [];
    const names = ['ISS-II', 'Starlink-E', 'OneWeb-B', 'GPS-III', 'IRIDIUM-S', 'NOAA-X', 'MetOp', 'TianGong', 'Cosmos', 'Aqua'];
    const colors = ['#00E5FF', '#00FF9D', '#FF2D55', '#FFAA29', '#AFAFFF'];
    
    for (let i = 0; i < constellationDensity; i++) {
      const id = `SAT-${1000 + i}`;
      const name = `${names[i % names.length]}-${100 + i}`;
      const noradId = 40000 + i;
      const color = colors[i % colors.length];
      
      const baseAngle = (i * (360 / constellationDensity) * Math.PI) / 180;
      const altVariation = (Math.sin(i * 37) * 0.1) * orbitalAltitude;
      const altitude = orbitalAltitude + altVariation;
      const velocity = 28440 * Math.sqrt(6371 / (6371 + altitude));
      const angularSpeed = (velocity / (6371 + altitude)) * 0.05; // simulation angular speed
      
      list.push({
        id,
        name,
        noradId,
        color,
        baseAltitude: orbitalAltitude,
        altitude,
        velocity,
        angle: baseAngle,
        angularSpeed,
        phase: i * 0.5
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

  // Active satellite calculations on tick
  const activeSatelliteData = useMemo(() => {
    if (!activeSatellite) return null;
    const currentTimeSecs = Date.now() / 1000;
    const currentAngle = activeSatellite.angle + activeSatellite.angularSpeed * currentTimeSecs;
    const { latitude, longitude } = getLatLonFromAngle(currentAngle);
    
    const distanceKm = calculateDistanceKm(
      latitude,
      longitude,
      groundBase.latitude,
      groundBase.longitude
    );

    const bearing = getBearingBetweenPoints(
      groundBase.latitude,
      groundBase.longitude,
      latitude,
      longitude
    );

    return {
      ...activeSatellite,
      latitude,
      longitude,
      distanceKm,
      bearing
    };
  }, [activeSatellite, tick]);

  const alertStatus = useMemo(() => {
    if (!activeSatelliteData) return { label: 'UNKNOWN', color: 'text-slate-400' };
    return getAlertDetails(activeSatelliteData.distanceKm);
  }, [activeSatelliteData]);

  // Audio ping logic
  useEffect(() => {
    if (activeSatelliteData && !isMuted && activeSatelliteData.distanceKm <= 3000) {
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

  // Rendering animation loop
  useEffect(() => {
    const loop = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      // Increment rotation based on deltaTime (sweep speed of 1.2 rad/sec)
      const sweepSpeed = 1.2;
      radarRotationRef.current = (radarRotationRef.current + sweepSpeed * deltaTime) % (Math.PI * 2);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Safety Check: if width or height is 0, do not draw
          if (canvas.width === 0 || canvas.height === 0) return;

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const maxRadius = Math.min(centerX, centerY) * 0.95;

          // 1. Draw glowing radar background
          const bgGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, maxRadius);
          bgGrad.addColorStop(0, 'rgba(10, 17, 34, 0.6)');
          bgGrad.addColorStop(1, 'rgba(3, 6, 15, 0.95)');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 2. Draw Debug Grid (concentric circles & crosshairs)
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
          ctx.lineWidth = 1;
          for (let r = 0.2; r <= 1.0; r += 0.2) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, maxRadius * r, 0, Math.PI * 2);
            ctx.stroke();

            // Distance labels
            ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
            ctx.font = '8px Courier New';
            ctx.textAlign = 'left';
            ctx.fillText(`${Math.round(r * 2000)} km`, centerX + 5, centerY - maxRadius * r + 10);
          }

          // Crosshairs
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.15)';
          ctx.beginPath();
          ctx.moveTo(centerX - maxRadius, centerY);
          ctx.lineTo(centerX + maxRadius, centerY);
          ctx.moveTo(centerX, centerY - maxRadius);
          ctx.lineTo(centerX, centerY + maxRadius);
          ctx.stroke();

          // Angle ticks and degree texts
          ctx.fillStyle = 'rgba(0, 229, 255, 0.2)';
          ctx.font = '8px Courier New';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          for (let angleDeg = 0; angleDeg < 360; angleDeg += 45) {
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = centerX + Math.cos(angleRad) * (maxRadius + 12);
            const y = centerY + Math.sin(angleRad) * (maxRadius + 12);
            ctx.fillText(`${angleDeg}°`, x, y);
          }

          // System status label in center
          ctx.fillStyle = 'rgba(0, 229, 255, 0.6)';
          ctx.font = 'bold 9px Courier New';
          ctx.textAlign = 'center';
          ctx.fillText('SYSTEM STATUS: TRACKING', centerX, centerY + maxRadius - 20);

          // 3. Draw radar sweep arc
          const sweepAngle = radarRotationRef.current;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          // Sweep direction is clockwise
          ctx.arc(centerX, centerY, maxRadius, sweepAngle - 0.5, sweepAngle, false);
          ctx.closePath();

          const sweepGrad = ctx.createLinearGradient(
            centerX, centerY,
            centerX + Math.cos(sweepAngle) * maxRadius,
            centerY + Math.sin(sweepAngle) * maxRadius
          );
          sweepGrad.addColorStop(0, 'rgba(0, 229, 255, 0)');
          sweepGrad.addColorStop(1, 'rgba(0, 229, 255, 0.2)');
          ctx.fillStyle = sweepGrad;
          ctx.fill();

          // Leading sweep line
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.85)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + Math.cos(sweepAngle) * maxRadius, centerY + Math.sin(sweepAngle) * maxRadius);
          ctx.stroke();

          // 4. Draw Ground Station (GS-ALPHA)
          ctx.fillStyle = '#00FF9D';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00FF9D';
          ctx.beginPath();
          ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset

          ctx.strokeStyle = 'rgba(0, 255, 157, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 10 + (Math.sin(timestamp / 200) * 3), 0, Math.PI * 2);
          ctx.stroke();

          // 5. Draw Satellite Blips
          const timeSecs = timestamp / 1000;
          satellites.forEach((sat) => {
            const currentAngle = sat.angle + sat.angularSpeed * timeSecs;
            const satRad = (sat.altitude / 2500) * maxRadius; // scale 2500km to maxRadius
            const satX = centerX + Math.cos(currentAngle) * satRad;
            const satY = centerY + Math.sin(currentAngle) * satRad;

            // Calculate angular sweep intensity (fade trail)
            let diff = sweepAngle - currentAngle;
            while (diff < 0) diff += Math.PI * 2;
            diff = diff % (Math.PI * 2);

            let intensity = 0.05; // base ambient visibility
            if (diff < 0.8) {
              intensity = 0.05 + 0.95 * (1 - diff / 0.8);
            }

            const isSelected = sat.id === selectedId;

            // Draw selection ring
            if (isSelected) {
              ctx.strokeStyle = sat.color;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(satX, satY, 8 + Math.sin(timestamp / 100) * 2, 0, Math.PI * 2);
              ctx.stroke();
            }

            // Draw blip dot
            ctx.fillStyle = sat.color;
            ctx.globalAlpha = intensity;
            ctx.shadowBlur = isSelected ? 12 : intensity * 8;
            ctx.shadowColor = sat.color;

            ctx.beginPath();
            ctx.arc(satX, satY, isSelected ? 5.5 : 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0; // reset
            ctx.globalAlpha = 1.0;

            // Draw Label
            if (isSelected || intensity > 0.4) {
              ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.6)';
              ctx.font = isSelected ? 'bold 9px Courier New' : '8px Courier New';
              ctx.textAlign = 'left';
              ctx.fillText(sat.id, satX + 8, satY - 4);
            }
          });
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
  }, [satellites, selectedId]);

  // Click handler on canvas
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(centerX, centerY) * 0.95;

    let nearestSat = null;
    let minDistance = 25; // 25px hit area

    const timeSecs = Date.now() / 1000;
    satellites.forEach((sat) => {
      const currentAngle = sat.angle + sat.angularSpeed * timeSecs;
      const satRad = (sat.altitude / 2500) * maxRadius;
      const satX = centerX + Math.cos(currentAngle) * satRad;
      const satY = centerY + Math.sin(currentAngle) * satRad;

      const dist = Math.hypot(clickX - satX, clickY - satY);
      if (dist < minDistance) {
        nearestSat = sat;
        minDistance = dist;
      }
    });

    if (nearestSat) {
      setSelectedId(nearestSat.id);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen max-w-5xl mx-auto space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center no-print">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wider uppercase font-sans">
            Satellite Radar
          </h2>
          <p className="text-xs text-cyber-cyan font-bold tracking-widest uppercase mt-0.5">
            Active Telemetry Tracker
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

          <div className="flex items-center gap-1.5 bg-[#101726]/80 px-3 py-1.5 rounded-lg border border-border-cyan/50 text-[10px] font-bold text-cyber-cyan/80 tracking-widest uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Downlink Latency: {telemetry.latency.toFixed(1)} ms
          </div>
        </div>
      </div>

      {/* Radar Canvas Widget Container */}
      <div className="glass-panel p-2 rounded-2xl border border-border-cyan/20 relative overflow-hidden h-[420px] bg-[#03060f]/60">
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
          className="w-full h-full block rounded-xl cursor-crosshair"
        />
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
                  <span className="text-base font-black text-white font-mono text-cyber-cyan">{Math.round(activeSatelliteData.velocity).toLocaleString()} km/h</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Orbital altitude</span>
                  <span className="text-base font-black text-white font-mono text-cyber-green">{Math.round(activeSatelliteData.altitude).toLocaleString()} km</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-bold text-slate-500 tracking-wider uppercase">Classification</span>
                  <span className="text-base font-black text-white font-mono">{activeSatelliteData.altitude < 1500 ? 'LEO' : 'MEO'} Class</span>
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
                const isSelected = sat.id === selectedId;
                // Calculate real-time coordinates for table rows
                const currentTimeSecs = Date.now() / 1000;
                const currentAngle = sat.angle + sat.angularSpeed * currentTimeSecs;
                const { latitude, longitude } = getLatLonFromAngle(currentAngle);
                
                return (
                  <tr
                    key={sat.id}
                    onClick={() => setSelectedId(sat.id)}
                    className={`cursor-pointer transition-colors duration-200 ${
                      isSelected ? 'bg-cyber-cyan/5 hover:bg-cyber-cyan/10' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="p-4 font-mono font-bold text-slate-400">{sat.noradId}</td>
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sat.color }} />
                      {sat.name}
                    </td>
                    <td className="p-4 font-mono text-slate-300">{latitude.toFixed(4)}°</td>
                    <td className="p-4 font-mono text-slate-300">{longitude.toFixed(4)}°</td>
                    <td className="p-4 font-mono text-cyber-green">{Math.round(sat.altitude).toLocaleString()} km</td>
                    <td className="p-4 font-mono text-cyber-cyan">{Math.round(sat.velocity).toLocaleString()} km/h</td>
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
