export const COLORS = {
  primary: '#00E5FF', // Neon Cyan
  secondary: '#1A0B2E', // Deep Cosmic Purple
  background: '#040714', // Void Black / Deep Space
  surface: 'rgba(20, 25, 45, 0.65)', // Glassmorphism surface
  text: '#FFFFFF',
  textSecondary: '#A0AAB2',
  accent: '#FF00E5', // Neon Pink
  error: '#FF3366',
  success: '#00FF9D',
  warning: '#FFB800',
  transparent: 'transparent',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONTS = {
  regular: 'Orbitron',
  medium: 'Orbitron_Medium',
  bold: 'Orbitron_Bold',
  black: 'Orbitron_Black',
};

export const SHADOWS = {
  neon: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 12,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  }
};
