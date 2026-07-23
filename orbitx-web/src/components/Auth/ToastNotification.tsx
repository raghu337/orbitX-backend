import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-6 right-6 z-50 max-w-md w-full px-4"
        >
          <div
            className={`flex items-start space-x-3 p-4 rounded-2xl backdrop-blur-xl border shadow-2xl ${
              toast.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.3)] text-emerald-200'
                : 'bg-rose-950/80 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)] text-rose-200'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              )}
            </div>

            <div className="flex-1 pr-2">
              <h4 className="text-sm font-semibold tracking-wide font-mono uppercase">
                {toast.title}
              </h4>
              <p className="text-xs mt-1 text-slate-300 leading-relaxed font-sans">
                {toast.message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="shrink-0 text-slate-400 hover:text-white p-1 rounded-lg transition-colors focus:outline-none focus:ring-1 focus:ring-slate-400"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
