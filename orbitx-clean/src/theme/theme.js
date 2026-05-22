export const COLORS = {
  primary: '#00E5FF',
  secondary: '#1A0B2E',
  background: '#040714',
  surface: 'rgba(20, 25, 45, 0.65)',
  text: '#FFFFFF',
  textSecondary: '#A0AAB2',
  accent: '#FF00E5',
  success: '#00FF9D',
  warning: '#FFB800',
  error: '#FF3366',
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
  regular: 'System', // Fallback to System to avoid font loading complexities
  medium: 'System',
  bold: 'System',
  black: 'System',
};

export const SHADOWS = {
  neon: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  }
};
