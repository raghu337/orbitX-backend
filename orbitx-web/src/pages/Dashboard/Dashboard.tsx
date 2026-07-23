import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  LogOut,
  Satellite,
  Globe,
  Radio,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { SpaceBackgroundCanvas } from '../../components/Auth/SpaceBackgroundCanvas';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0B1020] text-slate-100 flex flex-col justify-between overflow-x-hidden">
      <SpaceBackgroundCanvas />

      {/* Top Navbar */}
      <header className="relative z-20 w-full px-6 lg:px-12 py-4 flex items-center justify-between border-b border-cyan-500/20 bg-slate-950/40 backdrop-blur-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-xl tracking-wider text-white">OrbitX Cockpit</h1>
            <p className="text-[11px] text-cyan-400 font-mono">Space Intelligence Hub</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center space-x-3 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-slate-700/80">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-200">
              Commander {user?.name || user?.email.split('@')[0]}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900/80 text-rose-300 text-xs font-semibold tracking-wider transition-all focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-cyan-500/30 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div>
            <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Authentication Token Valid</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome aboard, Commander {user?.name || 'Explorer'}!
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Your session is active. Live satellite telemetry feeds, 3D solar system maps, and Space Notes AI are ready for command.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-xs text-slate-400 font-mono">SECURITY LEVEL</div>
              <div className="text-sm font-bold text-white font-mono">CLEARANCE ALPHA</div>
            </div>
          </div>
        </motion.div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-lg hover:border-cyan-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Satellites Tracked</span>
              <Satellite className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 font-mono">11,482</div>
            <p className="text-xs text-emerald-400 mt-2 flex items-center space-x-1 font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>Real-time NORAD TLE Sync</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-lg hover:border-purple-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">Active Signal Feeds</span>
              <Radio className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 font-mono">99.8%</div>
            <p className="text-xs text-purple-300 mt-2 flex items-center space-x-1 font-mono">
              <Globe className="w-3.5 h-3.5" />
              <span>ISRO & NASA Earth Stations</span>
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-lg hover:border-blue-500/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase">AI Learning Modules</span>
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-extrabold text-white mt-3 font-mono">24 Active</div>
            <p className="text-xs text-cyan-400 mt-2 flex items-center space-x-1 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Orbital Mechanics & Astronomy</span>
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-4 text-center text-slate-500 text-xs font-mono border-t border-slate-900">
        <p>OrbitX Cockpit System • Telemetry Engine v2.5</p>
      </footer>
    </div>
  );
};
