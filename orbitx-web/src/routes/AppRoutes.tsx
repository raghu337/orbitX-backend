import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/Auth/ProtectedRoute';
import { Login } from '../pages/Login/Login';

// Lazy loading main workspace for performance & code splitting
const MainWorkspace = lazy(() =>
  import('../pages/Dashboard/MainWorkspace').then((module) => ({
    default: module.MainWorkspace,
  }))
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#0B1020] text-cyan-400">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin shadow-[0_0_20px_rgba(6,182,212,0.5)]" />
            <span className="font-mono text-sm tracking-widest uppercase animate-pulse">
              Loading Telemetry Cockpit...
            </span>
          </div>
        </div>
      }
    >
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainWorkspace />
            </ProtectedRoute>
          }
        />

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};
