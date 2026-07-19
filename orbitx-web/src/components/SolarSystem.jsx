import React, { useState } from 'react';
import { Info, HelpCircle, Thermometer, Orbit, Compass, Users } from 'lucide-react';

const planetsData = {
  mercury: {
    name: 'Mercury',
    color: '#9E9E9E',
    distance: '57.9M km',
    gravity: '3.7 m/s²',
    temp: '−173 to 427 °C',
    period: '88 Earth Days',
    moons: 0,
    desc: 'The smallest planet in our Solar System and the closest to the Sun. It has a thin exosphere and experiences extreme temperature fluctuations.'
  },
  venus: {
    name: 'Venus',
    color: '#E5C158',
    distance: '108.2M km',
    gravity: '8.87 m/s²',
    temp: '462 °C (Average)',
    period: '225 Earth Days',
    moons: 0,
    desc: 'Often called Earth\'s twin due to similar size. It has a dense, toxic atmosphere of greenhouse gases that trap heat, making it the hottest planet.'
  },
  earth: {
    name: 'Earth',
    color: '#00E5FF',
    distance: '149.6M km',
    gravity: '9.81 m/s²',
    temp: '−88 to 58 °C',
    period: '365.25 Days',
    moons: 1,
    desc: 'Our home planet. It is the only known celestial body in the universe to support liquid surface oceans, oxygen-rich atmosphere, and biological life.'
  },
  mars: {
    name: 'Mars',
    color: '#FF2D55',
    distance: '227.9M km',
    gravity: '3.72 m/s²',
    temp: '−153 to 20 °C',
    period: '687 Earth Days',
    moons: 2,
    desc: 'The Red Planet, rich in iron oxides. It features the massive Olympus Mons volcano and evidence of historical liquid river valleys.'
  },
  jupiter: {
    name: 'Jupiter',
    color: '#FFAA29',
    distance: '778.5M km',
    gravity: '24.79 m/s²',
    temp: '−108 °C (Average)',
    period: '11.86 Earth Years',
    moons: 95,
    desc: 'The largest gas giant. It contains a massive liquid metallic hydrogen core, wind belts, and the persistent Great Red Spot anticyclone.'
  },
  saturn: {
    name: 'Saturn',
    color: '#F4D03F',
    distance: '1.43B km',
    gravity: '10.44 m/s²',
    temp: '−139 °C (Average)',
    period: '29.45 Earth Years',
    moons: 146,
    desc: 'A gas giant defined by its extensive, complex ring system consisting of ice particles, rocky debris, and dust orbits.'
  },
  uranus: {
    name: 'Uranus',
    color: '#AFAFFF',
    distance: '2.87B km',
    gravity: '8.69 m/s²',
    temp: '−197 °C (Average)',
    period: '84.01 Earth Years',
    moons: 28,
    desc: 'An ice giant that is unique for rotating on a highly tilted axis of nearly 98 degrees, making it appear to roll around the Sun.'
  },
  neptune: {
    name: 'Neptune',
    color: '#2471A3',
    distance: '4.50B km',
    gravity: '11.15 m/s²',
    temp: '−201 °C (Average)',
    period: '164.79 Earth Years',
    moons: 16,
    desc: 'The most distant planet in our Solar System. An ice giant subjected to severe jet winds reaching speeds up to 2,100 km/h.'
  }
};

export default function SolarSystem() {
  const [selectedPlanetKey, setSelectedPlanetKey] = useState('earth');

  const activePlanet = planetsData[selectedPlanetKey];

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen max-w-5xl mx-auto space-y-6 flex flex-col justify-between">
      {/* Title block */}
      <div className="no-print">
        <h2 className="text-2xl font-black text-white tracking-wider uppercase font-sans">
          3D Solar System
        </h2>
        <p className="text-xs text-cyber-cyan font-bold tracking-widest uppercase mt-0.5">
          Concentric Orbit Visualization
        </p>
      </div>

      {/* SVG Solar System Model */}
      <div className="glass-panel p-6 rounded-2xl border border-border-cyan/20 flex flex-col items-center justify-center relative min-h-[380px] overflow-hidden">
        {/* Sun and planetary rings */}
        <svg className="w-full max-w-md h-auto" viewBox="0 0 400 400">
          {/* Central Sun */}
          <circle cx="200" cy="200" r="22" fill="#FFAA29" className="animate-pulse shadow-2xl" />
          <circle cx="200" cy="200" r="28" fill="none" stroke="rgba(255,170,41,0.2)" strokeWidth="2" className="animate-ping" />

          {/* Orbits and Planet Spheres */}
          {[
            { key: 'mercury', r: 42, size: 4, speed: '2s' },
            { key: 'venus', r: 62, size: 6, speed: '3.5s' },
            { key: 'earth', r: 85, size: 7.5, speed: '5s' },
            { key: 'mars', r: 108, size: 5.5, speed: '7s' },
            { key: 'jupiter', r: 136, size: 12.5, speed: '12s' },
            { key: 'saturn', r: 162, size: 10, speed: '18s' },
            { key: 'uranus', r: 184, size: 8, speed: '28s' },
            { key: 'neptune', r: 198, size: 7.8, speed: '38s' }
          ].map((item) => {
            const planet = planetsData[item.key];
            const isSelected = selectedPlanetKey === item.key;
            
            return (
              <g key={item.key} className="cursor-pointer" onClick={() => setSelectedPlanetKey(item.key)}>
                {/* Orbit Path Ring */}
                <circle
                  cx="200"
                  cy="200"
                  r={item.r}
                  fill="none"
                  stroke={isSelected ? 'rgba(0, 229, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)'}
                  strokeWidth={isSelected ? '1.5' : '1'}
                  className="transition-colors duration-300"
                />
                
                {/* Rotating planet container */}
                <g style={{
                  transformOrigin: '200px 200px',
                  animation: `radar-sweep ${item.speed} linear infinite`
                }}>
                  {/* Planet Sphere */}
                  <circle
                    cx="200"
                    cy={200 - item.r}
                    r={item.size}
                    fill={planet.color}
                    className="transition-transform duration-300 hover:scale-125"
                  />
                  
                  {/* Selection Indicator Ring */}
                  {isSelected && (
                    <circle
                      cx="200"
                      cy={200 - item.r}
                      r={item.size + 4}
                      fill="none"
                      stroke="#00E5FF"
                      strokeWidth="1.5"
                      className="animate-pulse"
                    />
                  )}
                </g>
              </g>
            );
          })}
        </svg>

        {/* Planet Quick Select bar */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-6 w-full max-w-lg border-t border-white/[0.04] pt-4 z-10">
          {Object.keys(planetsData).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedPlanetKey(key)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                selectedPlanetKey === key
                  ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30'
                  : 'bg-white/[0.02] text-slate-400 border border-transparent hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {planetsData[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Planet Details Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="glass-panel p-5 rounded-2xl border border-border-cyan/20 md:col-span-1 space-y-4">
          <div className="flex gap-2.5 items-center">
            <span
              className="w-4 h-4 rounded-full shadow-md"
              style={{ backgroundColor: activePlanet.color }}
            />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {activePlanet.name} Profile
            </h3>
          </div>
          
          <div className="h-[1px] bg-white/[0.05]" />

          <p className="text-slate-300 text-xs leading-relaxed text-justify">
            {activePlanet.desc}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="glass-panel p-5 rounded-2xl border border-border-cyan/20 md:col-span-2 space-y-4">
          <div className="flex gap-2.5 items-center">
            <div className="w-8 h-8 rounded-lg bg-cyber-cyan/10 flex items-center justify-center border border-cyber-cyan/20 text-cyber-cyan shadow-[0_0_10px_rgba(0,229,255,0.1)]">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold text-white tracking-widest uppercase">
              Exoplanet Telemetry Fields
            </h3>
          </div>

          <div className="h-[1px] bg-white/[0.05]" />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 py-1">
            <div className="space-y-0.5">
              <div className="text-[8px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1">
                <Orbit className="w-3 h-3 text-cyber-cyan" /> Distance from Sun
              </div>
              <span className="text-sm font-black text-white font-mono">{activePlanet.distance}</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-[8px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1">
                <Compass className="w-3 h-3 text-cyber-green" /> Gravity Pull
              </div>
              <span className="text-sm font-black text-white font-mono">{activePlanet.gravity}</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-[8px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1">
                <Thermometer className="w-3 h-3 text-cyber-magenta" /> Surface Temp
              </div>
              <span className="text-sm font-black text-white font-mono">{activePlanet.temp}</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-[8px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1">
                <Orbit className="w-3 h-3 text-cyber-cyan" /> Orbital Period
              </div>
              <span className="text-sm font-black text-white font-mono">{activePlanet.period}</span>
            </div>
            <div className="space-y-0.5">
              <div className="text-[8px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1">
                <Users className="w-3 h-3 text-cyber-cyan" /> Satellites / Moons
              </div>
              <span className="text-sm font-black text-white font-mono">{activePlanet.moons} Moons</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
