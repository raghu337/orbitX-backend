import React from 'react';
import { BookOpen, Radar, Globe, MessageSquare, Rocket, Settings, User, ShieldAlert } from 'lucide-react';

export default function Sidebar({ activeScreen, setActiveScreen }) {
  const menuItems = [
    { id: 'SpaceNotes', name: 'Space Notes AI', icon: BookOpen },
    { id: 'LiveTracking', name: 'Satellite Radar', icon: Radar },
    { id: 'SolarSystem3D', name: '3D Solar System', icon: Globe },
    { id: 'SpaceChat', name: 'Space Chat AI', icon: MessageSquare },
    { id: 'LaunchTracker', name: 'Launch Hub', icon: Rocket },
    { id: 'Settings', name: 'System Settings', icon: Settings },
  ];

  return (
    <aside className="w-66 h-screen bg-[#050914] border-r border-border-cyan flex flex-col justify-between p-4 shrink-0 no-print">
      {/* Brand Logo and Title */}
      <div>
        <div className="flex items-center gap-3 py-4 px-2">
          <div className="w-9 h-9 rounded-lg bg-cyber-cyan/15 flex items-center justify-center border border-cyber-cyan/30 shadow-[0_0_10px_rgba(0,229,255,0.15)] animate-pulse">
            <Globe className="w-5 h-5 text-cyber-cyan" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-widest text-white font-sans bg-clip-text bg-gradient-to-r from-white to-slate-400">
              ORBIT<span className="text-cyber-cyan font-bold">X</span>
            </h1>
            <span className="text-[9px] font-bold text-cyber-cyan/70 tracking-widest block uppercase">
              Web Workspace v1.0
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-gradient-to-r from-cyber-cyan/30 via-transparent to-transparent my-4" />

        {/* Navigation Menu */}
        <nav className="space-y-1.5 mt-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveScreen(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all duration-300 group cursor-pointer ${
                  isActive
                    ? 'bg-cyber-cyan/10 text-cyber-cyan border border-cyber-cyan/20 shadow-[inset_0_0_12px_rgba(0,229,255,0.06)]'
                    : 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? 'text-cyber-cyan drop-shadow-[0_0_5px_#00E5FF]' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="tracking-wide">{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1 h-3 rounded-full bg-cyber-cyan shadow-[0_0_8px_#00E5FF]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card at Bottom */}
      <div className="border-t border-border-cyan/40 pt-4 mt-auto">
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-cyber-cyan/30 transition-all duration-300 group">
          <div className="flex items-center gap-3">
            {/* Avatar block with active status ping */}
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyber-cyan to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(0,229,255,0.2)] group-hover:scale-105 transition-transform duration-300">
                RR
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-cyber-green border-2 border-[#050914] shadow-[0_0_8px_#00FF9D]" />
            </div>

            {/* Profile Info */}
            <div className="min-w-0">
              <h3 className="text-xs font-bold text-slate-100 truncate tracking-wide">
                Reddy RaghuVardhan
              </h3>
              <p className="text-[10px] text-cyber-cyan/80 font-medium truncate mt-0.5 tracking-wider uppercase">
                Mission Commander
              </p>
            </div>
          </div>
          
          {/* Signal Indicator Footer */}
          <div className="mt-3 flex items-center justify-between text-[9px] text-slate-500 font-semibold border-t border-white/[0.03] pt-2">
            <span className="flex items-center gap-1.5 uppercase tracking-widest text-[8px] text-cyber-green">
              <span className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-ping" />
              Link Secured
            </span>
            <span className="font-mono text-slate-400">SEC-99</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
