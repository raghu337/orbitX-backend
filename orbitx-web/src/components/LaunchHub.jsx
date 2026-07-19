import React, { useState, useEffect } from 'react';
import { Rocket, Clock, Calendar, MapPin, Radio, ExternalLink } from 'lucide-react';

const INITIAL_LAUNCHES = [
  {
    id: 'starlink-7-19',
    missionName: 'Starlink Group 7-19',
    agency: 'SpaceX',
    rocket: 'Falcon 9 Block 5',
    date: new Date(Date.now() + 86400000 * 2 + 3600000 * 4 + 60000 * 12).toISOString(), // ~2 days away
    location: 'SLC-40, Cape Canaveral SFS, Florida',
    status: 'SCHEDULED',
    color: '#00E5FF',
    streamUrl: 'https://www.spacex.com/launches/'
  },
  {
    id: 'artemis-3',
    missionName: 'Artemis III Crewed Lunar Landing',
    agency: 'NASA',
    rocket: 'Space Launch System (SLS) Block 1B',
    date: new Date(Date.now() + 86400000 * 450).toISOString(), // ~450 days away
    location: 'LC-39B, Kennedy Space Center, Florida',
    status: 'ACTIVE PREP',
    color: '#FF2D55',
    streamUrl: 'https://www.nasa.gov/live'
  },
  {
    id: 'gaganyaan-2',
    missionName: 'Gaganyaan-2 Orbital Mission',
    agency: 'ISRO',
    rocket: 'LVM3 M4',
    date: new Date(Date.now() + 86400000 * 95 + 3600000 * 8).toISOString(), // ~95 days away
    location: 'Second Launch Pad, SDSC SHAR, Sriharikota',
    status: 'SCHEDULED',
    color: '#00FF9D',
    streamUrl: 'https://www.isro.gov.in/'
  },
  {
    id: 'crew-10',
    missionName: 'USCV-10 (SpaceX Crew-10)',
    agency: 'NASA / SpaceX',
    rocket: 'Falcon 9 / Crew Dragon',
    date: new Date(Date.now() + 86400000 * 12 + 3600000 * 14).toISOString(), // ~12 days away
    location: 'LC-39A, Kennedy Space Center, Florida',
    status: 'HOLD / RE-SCHED',
    color: '#FFAA29',
    streamUrl: 'https://www.spacex.com/launches/'
  }
];

function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-4 gap-2 text-center font-mono">
      {[
        { val: timeLeft.days, label: 'DAYS' },
        { val: timeLeft.hours, label: 'HRS' },
        { val: timeLeft.minutes, label: 'MINS' },
        { val: timeLeft.seconds, label: 'SECS' }
      ].map((cell, idx) => (
        <div key={idx} className="bg-black/40 border border-white/[0.04] p-2.5 rounded-xl">
          <div className="text-sm font-black text-white">{cell.val.toString().padStart(2, '0')}</div>
          <div className="text-[7px] font-bold text-slate-500 tracking-widest mt-0.5">{cell.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function LaunchHub() {
  const [launches, setLaunches] = useState(INITIAL_LAUNCHES);

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen max-w-5xl mx-auto space-y-6">
      {/* Title block */}
      <div className="no-print">
        <h2 className="text-2xl font-black text-white tracking-wider uppercase font-sans">
          Launch Hub
        </h2>
        <p className="text-xs text-cyber-cyan font-bold tracking-widest uppercase mt-0.5">
          Global Mission Scheduler
        </p>
      </div>

      {/* Launches list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {launches.map((item) => (
          <div
            key={item.id}
            className="glass-panel p-5 rounded-2xl border border-border-cyan/20 flex flex-col justify-between space-y-5 hover:border-cyber-cyan/35 hover:scale-[1.01] transition-all duration-300 relative group overflow-hidden"
          >
            {/* Status tag */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-cyber-cyan tracking-widest uppercase font-mono">
                  {item.agency}
                </span>
                <h3 className="text-base font-black text-white tracking-wide mt-0.5 truncate">
                  {item.missionName}
                </h3>
              </div>
              
              <span className={`px-2.5 py-1 rounded-full text-[8px] font-black tracking-widest uppercase border ${
                item.status.includes('HOLD')
                  ? 'bg-cyber-orange/10 text-cyber-orange border-cyber-orange/20'
                  : 'bg-cyber-green/10 text-cyber-green border-cyber-green/20'
              }`}>
                {item.status}
              </span>
            </div>

            {/* Middle Section: Site parameters */}
            <div className="space-y-2 text-xs font-semibold text-slate-400">
              <div className="flex items-center gap-2">
                <Rocket className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Booster: <span className="text-slate-200">{item.rocket}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-cyber-cyan" />
                <span className="truncate">{item.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Target: <span className="text-slate-200">{new Date(item.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span></span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-white/[0.05]" />

            {/* Countdown block */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 tracking-widest uppercase">
                <Clock className="w-3 h-3 text-cyber-magenta animate-pulse" />
                Mission Countdown (T-Minus)
              </div>
              <CountdownTimer targetDate={item.date} />
            </div>

            {/* Footer stream redirect */}
            <div className="flex justify-end pt-1">
              <a
                href={item.streamUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-[10px] font-bold text-cyber-cyan tracking-widest uppercase hover:underline cursor-pointer"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-cyber-magenta" />
                Watch stream
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
