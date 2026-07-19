import React, { useState } from 'react';
import { Settings, Shield, Sliders, Cpu, Eye, Radio, RefreshCw, Terminal, CheckCircle } from 'lucide-react';

export default function SettingsComponent() {
  const [telemetryActive, setTelemetryActive] = useState(true);
  const [selectedModel, setSelectedModel] = useState('Gemini 3.5 Flash');
  const [themeMode, setThemeMode] = useState('Cosmic Dark');
  const [confidenceFilter, setConfidenceFilter] = useState(95);

  const models = ['Gemini 3.5 Pro', 'Gemini 3.5 Flash', 'Deep-Space Hybrid-AI'];

  return (
    <div className="flex-1 p-6 overflow-y-auto h-screen max-w-5xl mx-auto space-y-6">
      {/* Title Block */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wider uppercase font-sans flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyber-cyan animate-spin-slow" />
            System Settings
          </h2>
          <p className="text-xs text-cyber-cyan font-bold tracking-widest uppercase mt-0.5">
            Mission Command Console Config
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#101726]/80 px-3 py-1.5 rounded-lg border border-border-cyan/50 text-[10px] font-bold text-cyber-green tracking-widest uppercase">
          <CheckCircle className="w-3.5 h-3.5" />
          Settings Synchronized
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Telemetry Configuration Card */}
        <div className="glass-panel p-6 rounded-2xl border border-border-cyan/20 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/[0.05] pb-3">
            <Radio className="w-5 h-5 text-cyber-cyan" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">Telemetry System</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Real-Time Satellite Feed</h4>
                <p className="text-[10px] text-slate-400">Stream live orbital data from NASA and N2YO</p>
              </div>
              <button 
                onClick={() => setTelemetryActive(!telemetryActive)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none cursor-pointer ${
                  telemetryActive ? 'bg-cyber-cyan' : 'bg-white/[0.08]'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-300 transform ${
                  telemetryActive ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Latency Threshold (ms)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="50" 
                  max="1000" 
                  defaultValue="200"
                  className="flex-1 accent-cyber-cyan bg-black/40 h-1.5 rounded-lg appearance-none cursor-pointer border border-white/[0.05]"
                />
                <span className="text-xs font-mono text-cyber-cyan">200ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Processing Settings Card */}
        <div className="glass-panel p-6 rounded-2xl border border-border-cyan/20 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/[0.05] pb-3">
            <Cpu className="w-5 h-5 text-cyber-magenta" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">AI Synthesis Engine</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Active Cognitive Model</label>
              <div className="grid grid-cols-3 gap-2">
                {models.map((model) => (
                  <button
                    key={model}
                    onClick={() => setSelectedModel(model)}
                    className={`px-2 py-2.5 rounded-xl text-[10px] font-bold tracking-wider uppercase cursor-pointer border transition-all duration-300 ${
                      selectedModel === model
                        ? 'border-cyber-magenta bg-cyber-magenta/10 text-cyber-magenta shadow-[0_0_10px_rgba(255,45,85,0.15)]'
                        : 'border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                    }`}
                  >
                    {model.split(' ')[1] || model}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Confidence Filter</label>
                <span className="text-xs font-mono text-cyber-magenta">{confidenceFilter}%</span>
              </div>
              <input 
                type="range" 
                min="80" 
                max="100" 
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(Number(e.target.value))}
                className="w-full accent-cyber-magenta bg-black/40 h-1.5 rounded-lg appearance-none cursor-pointer border border-white/[0.05]"
              />
            </div>
          </div>
        </div>

        {/* Visual Settings Card */}
        <div className="glass-panel p-6 rounded-2xl border border-border-cyan/20 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/[0.05] pb-3">
            <Eye className="w-5 h-5 text-cyber-green" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">Visual Aesthetics</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Cosmic Dashboard Theme</label>
              <div className="flex gap-3">
                {['Cosmic Dark', 'Deep Aurora', 'Solar Eclipse'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setThemeMode(theme)}
                    className={`flex-1 px-3 py-2.5 rounded-xl text-[10px] font-bold tracking-wider uppercase cursor-pointer border transition-all duration-300 ${
                      themeMode === theme
                        ? 'border-cyber-green bg-cyber-green/10 text-cyber-green shadow-[0_0_10px_rgba(0,255,157,0.15)]'
                        : 'border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                    }`}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access Card */}
        <div className="glass-panel p-6 rounded-2xl border border-border-cyan/20 space-y-5">
          <div className="flex items-center gap-3 border-b border-white/[0.05] pb-3">
            <Shield className="w-5 h-5 text-cyber-orange" />
            <h3 className="text-sm font-bold text-white tracking-widest uppercase">Security Protocols</h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Cross-Window Navigation Bridge</h4>
                <p className="text-[10px] text-slate-400">Accept programmatic navigation message inputs</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyber-green/10 border border-cyber-green/20 text-cyber-green text-[9px] font-bold uppercase tracking-wider">
                ACTIVE
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-white/[0.03]">
              <div>
                <h4 className="text-xs font-bold text-slate-200">System Security Clearance</h4>
                <p className="text-[10px] text-slate-400">Mission Commander authorization node</p>
              </div>
              <span className="font-mono text-xs text-cyber-orange">SEC-99</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Diagnostics Terminal */}
      <div className="glass-panel p-5 rounded-2xl border border-border-cyan/20 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-bold tracking-widest uppercase border-b border-white/[0.05] pb-2">
          <span className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyber-cyan" />
            Diagnostics Console
          </span>
          <span className="font-mono text-[10px] text-slate-500">Node: Localhost:5173</span>
        </div>
        <div className="font-mono text-[11px] text-cyber-cyan/70 space-y-1 bg-black/40 p-4 rounded-xl border border-white/[0.03]">
          <div>[SYSTEM] Initializing OrbitX Web Diagnostics...</div>
          <div>[SYSTEM] Web Workspace Version: 1.0 (Vite Developer Environment)</div>
          <div>[SYSTEM] Client navigation routing initialized (Standard Route Keys bound)</div>
          <div className="text-cyber-green">[OK] Navigation Bridge active. Awaiting external triggers...</div>
        </div>
      </div>
    </div>
  );
}
