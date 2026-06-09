/** Light-mode design tokens for the 3:11 Security mobile app. */

export const palette = {
  // Brand blues
  blue50: '#EFF6FF',
  blue100: '#DBEAFE',
  blue200: '#BFDBFE',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',
  blue800: '#1e3a8a',
  blue900: '#172554',

  // Neutrals
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semantic
  green100: '#D1FAE5',
  green500: '#10B981',
  green600: '#059669',
  yellow100: '#FEF3C7',
  yellow500: '#F59E0B',
  yellow600: '#D97706',
  orange100: '#FFEDD5',
  orange500: '#F97316',
  red100: '#FEE2E2',
  red500: '#EF4444',
  red600: '#DC2626',
  purple100: '#EDE9FE',
  purple500: '#8B5CF6',
  teal100: '#CCFBF1',
  teal500: '#14B8A6',
};

export const colors = {
  // Primary
  primary: palette.blue600,
  primaryLight: palette.blue50,
  primaryDark: palette.blue800,
  primaryHeader: palette.blue700,
  blue200: palette.blue200,

  // Backgrounds
  background: palette.gray50,
  surface: palette.white,
  surfaceSecondary: palette.gray50,

  // Text
  textPrimary: palette.gray900,
  textSecondary: palette.gray500,
  textTertiary: palette.gray400,
  textInverse: palette.white,
  textLink: palette.blue600,

  // Borders
  border: palette.gray200,
  borderLight: palette.gray100,

  // Status
  success: palette.green500,
  successBg: palette.green100,
  warning: palette.yellow500,
  warningBg: palette.yellow100,
  danger: palette.red500,
  dangerBg: palette.red100,
  info: palette.blue600,
  infoBg: palette.blue100,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 9999,
};

export const fontSizes = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
};

export const shadows = {
  sm: {
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: palette.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
};
