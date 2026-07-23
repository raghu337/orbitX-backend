import React from 'react';
import { motion } from 'framer-motion';

interface SocialLoginButtonsProps {
  onSocialSelect?: (provider: string) => void;
  disabled?: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSocialSelect,
  disabled = false,
}) => {
  const handleClick = (provider: string) => {
    if (disabled) return;
    if (onSocialSelect) {
      onSocialSelect(provider);
    } else {
      console.log(`Initiating SSO login with ${provider}...`);
    }
  };

  return (
    <div className="flex flex-col space-y-3 w-full mt-4">
      {/* Divider */}
      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-slate-700/60 w-full" />
        <span className="bg-[#0b1020]/90 px-3 text-xs uppercase tracking-wider text-slate-400 font-mono font-medium">
          or authenticating with
        </span>
        <div className="border-t border-slate-700/60 w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Google Button */}
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.02, translateY: -2 }}
          whileTap={{ scale: disabled ? 1 : 0.97 }}
          type="button"
          disabled={disabled}
          onClick={() => handleClick('Google')}
          aria-label="Continue with Google authentication"
          className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-900/60 border border-slate-700/70 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] text-slate-200 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.3 14.7c-.3-.8-.4-1.7-.4-2.7s.1-1.9.4-2.7L1.6 6.4C.6 8.4 0 10.1 0 12s.6 3.6 1.6 5.6l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
            />
          </svg>
          <span className="truncate">Google</span>
        </motion.button>

        {/* Microsoft Button */}
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.02, translateY: -2 }}
          whileTap={{ scale: disabled ? 1 : 0.97 }}
          type="button"
          disabled={disabled}
          onClick={() => handleClick('Microsoft')}
          aria-label="Continue with Microsoft authentication"
          className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-900/60 border border-slate-700/70 hover:border-cyan-500/50 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] text-slate-200 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
          <span className="truncate">Microsoft</span>
        </motion.button>

        {/* GitHub Button */}
        <motion.button
          whileHover={{ scale: disabled ? 1 : 1.02, translateY: -2 }}
          whileTap={{ scale: disabled ? 1 : 0.97 }}
          type="button"
          disabled={disabled}
          onClick={() => handleClick('GitHub')}
          aria-label="Continue with GitHub authentication"
          className="flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl bg-slate-900/60 border border-slate-700/70 hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(124,58,237,0.25)] text-slate-200 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/80 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span className="truncate">GitHub</span>
        </motion.button>
      </div>
    </div>
  );
};
