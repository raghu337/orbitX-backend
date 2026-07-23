import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Rocket,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Globe2,
  Sparkles,
  User,
  Check,
  X,
  Zap,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { SpaceBackgroundCanvas } from '../../components/Auth/SpaceBackgroundCanvas';
import { SocialLoginButtons } from '../../components/Auth/SocialLoginButtons';
import { ToastNotification, ToastMessage } from '../../components/Auth/ToastNotification';
import { authService } from '../../services/authService';

import './Login.css';

// Password Validation Regex
const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#\-_]).{8,}$/;

// Zod Validation Schema
const authSchema = z.object({
  name: z.string().optional(),
  email: z
    .string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address (e.g., user@gmail.com)' }),
  password: z
    .string()
    .min(1, { message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters long' }),
  rememberMe: z.boolean().default(true),
});

type AuthFormData = z.infer<typeof authSchema>;

export const Login: React.FC = () => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState<boolean>(false);
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotLoading, setForgotLoading] = useState<boolean>(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const watchEmail = watch('email') || '';
  const watchPassword = watch('password') || '';

  // Calculate Password Strength Breakdown
  const passwordCriteria = {
    length: watchPassword.length >= 8,
    uppercase: /[A-Z]/.test(watchPassword),
    lowercase: /[a-z]/.test(watchPassword),
    number: /[0-9]/.test(watchPassword),
    special: /[@$!%*?&^#\-_]/.test(watchPassword),
  };

  const passedCriteriaCount = Object.values(passwordCriteria).filter(Boolean).length;
  const strengthPercentage = watchPassword.length === 0 ? 0 : (passedCriteriaCount / 5) * 100;

  const getStrengthLabel = () => {
    if (watchPassword.length === 0) return { label: 'Enter Password', color: 'bg-slate-700', text: 'text-slate-400' };
    if (passedCriteriaCount === 5) return { label: 'Cyber-Secured (Strong)', color: 'bg-emerald-400', text: 'text-emerald-400' };
    if (passedCriteriaCount >= 3) return { label: 'Moderate Security', color: 'bg-amber-400', text: 'text-amber-400' };
    return { label: 'Weak Security', color: 'bg-rose-500', text: 'text-rose-400' };
  };

  const strengthInfo = getStrengthLabel();
  const isGmail = watchEmail.toLowerCase().trim().endsWith('@gmail.com');

  // Submit Handler
  const onSubmit = async (data: AuthFormData) => {
    try {
      setToast(null);

      // In Sign-Up mode, warn if password doesn't meet full strong requirements
      if (authMode === 'signup' && passedCriteriaCount < 4) {
        setToast({
          id: Date.now().toString(),
          type: 'warning',
          title: 'Strong Password Required',
          message: 'Please satisfy at least 4 security rules (8+ chars, uppercase, lowercase, number, special symbol).',
        });
        return;
      }

      if (authMode === 'signin') {
        await login({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        });

        setIsSuccess(true);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: 'Commander Access Granted',
          message: 'Welcome back to OrbitX Cockpit. Redirecting to space workspace...',
        });
      } else {
        await authService.signup({
          email: data.email,
          password: data.password,
          name: data.name || data.email.split('@')[0],
          rememberMe: data.rememberMe,
        });

        await login({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        });

        setIsSuccess(true);
        setToast({
          id: Date.now().toString(),
          type: 'success',
          title: 'Cadet Account Created',
          message: 'Your clearance has been registered! Entering OrbitX Cockpit...',
        });
      }

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1300);
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Authentication Failed',
        message: err.message || 'Invalid credentials. Please verify your email and password.',
      });
    }
  };

  // Quick Demo Login helper
  const handleQuickDemoLogin = async () => {
    setValue('email', 'commander@gmail.com');
    setValue('password', 'OrbitX@2026!');
    setToast({
      id: Date.now().toString(),
      type: 'info',
      title: 'Demo Credentials Loaded',
      message: 'Authenticating with commander@gmail.com...',
    });
    
    setTimeout(() => {
      handleSubmit(onSubmit)();
    }, 400);
  };

  // Forgot Password handler
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Invalid Email',
        message: 'Please enter a valid email address for password reset.',
      });
      return;
    }

    setForgotLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        title: 'Recovery Email Dispatched',
        message: res.message || `Password reset instructions sent to ${forgotEmail}. Check your inbox.`,
      });
      setShowForgotPasswordModal(false);
      setForgotEmail('');
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        title: 'Reset Failed',
        message: err.message || 'Could not send password reset email.',
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0B1020] text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500 selection:text-black font-sans">
      {/* 2D Animated Cosmic Space Background */}
      <SpaceBackgroundCanvas />
      <div className="absolute inset-0 orbitx-scanlines pointer-events-none z-10" />

      {/* Toast Notification Alert */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Header Branding */}
      <header className="relative z-20 w-full px-6 lg:px-12 py-5 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center space-x-3 group cursor-pointer"
          onClick={() => navigate('/login')}
        >
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-105 transition-transform duration-300">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-wider text-white font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-400">
                OrbitX
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-widest bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 rounded-full animate-orbit-pulse">
                v2.5 Live
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Smart Satellite & Space Intelligence Platform
            </p>
          </div>
        </motion.div>

        {/* Space Badges */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden md:flex items-center space-x-4 text-xs text-slate-400 font-mono"
        >
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-md">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>NASA / ISRO Integrated</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/60 border border-purple-500/30 text-purple-300 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Orbital Guidance</span>
          </div>
        </motion.div>
      </header>

      {/* Main Container */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md orbitx-glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden my-4"
        >
          {/* Neon Top Highlight */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06B6D4]" />

          {/* Title Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 mb-2.5 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Rocket className="w-7 h-7 text-cyan-400 animate-bounce" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-sans">
              🚀 OrbitX Access
            </h1>
            <p className="text-xs sm:text-sm text-cyan-400/90 font-medium mt-1 font-mono tracking-wide">
              Satellite Tracking & Space AI Platform
            </p>

            {/* Auth Mode Tab Switcher */}
            <div className="grid grid-cols-2 p-1 mt-5 bg-slate-950/80 border border-slate-800 rounded-2xl font-mono text-xs">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('signup')}
                className={`py-2 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Quick Demo Login Bar */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2 px-3 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 rounded-xl text-xs font-mono font-semibold text-cyan-300 flex items-center justify-center space-x-2 transition-all group cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.1)]"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-125 transition-transform" />
              <span>1-Click Demo Login (commander@gmail.com)</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Full Name Field (Only in Sign Up Mode) */}
            <AnimatePresence mode="wait">
              {authMode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold text-slate-300 font-mono tracking-wider uppercase"
                  >
                    Commander Name
                  </label>
                  <div className="relative rounded-xl orbitx-input-focus transition-all duration-200">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4 text-cyan-400/80" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      disabled={isSubmitting || isSuccess}
                      placeholder="e.g. Commander Raghu"
                      {...register('name')}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/60 transition-all duration-200 disabled:opacity-50"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-300 font-mono tracking-wider uppercase"
                >
                  Email Address
                </label>
                {isGmail && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center space-x-1 animate-pulse">
                    <ShieldCheck className="w-3 h-3 text-cyan-400" />
                    <span>Gmail Verified</span>
                  </span>
                )}
              </div>
              <div className="relative rounded-xl orbitx-input-focus transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4 text-cyan-400/80" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={isSubmitting || isSuccess}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  placeholder="commander@gmail.com"
                  {...register('email')}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border ${
                    errors.email ? 'border-rose-500' : 'border-slate-700/80'
                  } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/60 transition-all duration-200 disabled:opacity-50`}
                />
              </div>
              <AnimatePresence mode="wait">
                {errors.email && (
                  <motion.p
                    id="email-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-rose-400 font-medium flex items-center space-x-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email.message}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-300 font-mono tracking-wider uppercase"
                >
                  Password
                </label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <div className="relative rounded-xl orbitx-input-focus transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-purple-400/80" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                  disabled={isSubmitting || isSuccess}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  placeholder="OrbitX@2026!"
                  {...register('password')}
                  className={`w-full pl-10 pr-11 py-2.5 bg-slate-950/60 border ${
                    errors.password ? 'border-rose-500' : 'border-slate-700/80'
                  } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/60 transition-all duration-200 disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-cyan-300 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Real-time Password Strength Indicator */}
              {watchPassword.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 pt-1"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Strength:</span>
                    <span className={`font-semibold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full ${strengthInfo.color} transition-all duration-300 rounded-full`}
                      style={{ width: `${Math.max(10, strengthPercentage)}%` }}
                    />
                  </div>

                  {/* Criteria Breakdown Grid */}
                  <div className="grid grid-cols-2 gap-1 pt-1 text-[10px] font-mono">
                    <div
                      className={`flex items-center space-x-1 ${
                        passwordCriteria.length ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {passwordCriteria.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>8+ Characters</span>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${
                        passwordCriteria.uppercase ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {passwordCriteria.uppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Uppercase (A-Z)</span>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${
                        passwordCriteria.lowercase ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {passwordCriteria.lowercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Lowercase (a-z)</span>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${
                        passwordCriteria.number ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {passwordCriteria.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Number (0-9)</span>
                    </div>
                    <div
                      className={`col-span-2 flex items-center space-x-1 ${
                        passwordCriteria.special ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {passwordCriteria.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>Special Symbol (!@#$%^&*)</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {errors.password && (
                  <motion.p
                    id="password-error"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="text-xs text-rose-400 font-medium flex items-center space-x-1 mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.password.message}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  disabled={isSubmitting || isSuccess}
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400/80 orbitx-checkbox cursor-pointer"
                />
                <span className="text-xs text-slate-300 group-hover:text-white transition-colors font-medium">
                  Remember Session
                </span>
              </label>

              <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit SSL</span>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: isSubmitting || isSuccess ? 1 : 1.01 }}
              whileTap={{ scale: isSubmitting || isSuccess ? 1 : 0.99 }}
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold text-sm tracking-wide glow-button-cyan flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-2"
            >
              {isSuccess ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center space-x-2 text-emerald-300"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Authenticated! Entering Cockpit...</span>
                </motion.div>
              ) : isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-5 h-5 text-cyan-200 animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{authMode === 'signin' ? 'Sign In as Commander' : 'Create Cadet Account'}</span>
                  <Rocket className="w-4 h-4 text-cyan-200 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </motion.button>
          </form>

          {/* Social Logins */}
          <SocialLoginButtons
            disabled={isSubmitting || isSuccess}
            onSocialSelect={(provider) => {
              setValue('email', `commander@${provider.toLowerCase()}.com`);
              setValue('password', 'OrbitX@2026!');
              setToast({
                id: Date.now().toString(),
                type: 'info',
                title: `${provider} SSO Selected`,
                message: `Loaded ${provider} SSO parameters. Click Sign In to proceed.`,
              });
            }}
          />

          {/* Switch Footer Callout */}
          <div className="mt-5 text-center border-t border-slate-800/80 pt-4">
            <p className="text-xs text-slate-400 font-sans">
              {authMode === 'signin' ? (
                <>
                  Need an OrbitX account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signup')}
                    className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors focus:outline-none rounded px-1 cursor-pointer"
                  >
                    Register Cadet Account
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors focus:outline-none rounded px-1 cursor-pointer"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </div>
        </motion.div>
      </main>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2.5 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reset Commander Password</h3>
                  <p className="text-xs text-slate-400">Receive recovery instructions by email</p>
                </div>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    Registered Email (@gmail.com)
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="commander@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs tracking-wider uppercase transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {forgotLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Send Reset Telemetry</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-20 py-3 text-center text-slate-500 text-xs font-mono border-t border-slate-900/60">
        <p>© 2026 OrbitX Space Intelligence • NASA & ISRO Telemetry Workflows</p>
      </footer>
    </div>
  );
};

export default Login;
