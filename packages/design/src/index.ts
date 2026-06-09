export const colors = {
  brand: {
    50: "#ecfbff",
    100: "#d5f6ff",
    300: "#67ddff",
    400: "#22c8ff",
    500: "#02aef0",
    600: "#008fd0",
    700: "#0872a8",
  },
  operations: {
    950: "#03111d",
    925: "#061927",
    900: "#0a2030",
    850: "#132b3b",
    800: "#1b3545",
    700: "#2a4758",
    600: "#4f6a78",
  },
  emergency: {
    50: "#fff1f2",
    100: "#ffe4e6",
    500: "#e11d48",
    600: "#be123c",
    700: "#9f1239",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },
  safety: {
    50: "#ecfdf5",
    100: "#d1fae5",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
  },
  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#2563eb",
    600: "#1d4ed8",
    700: "#1e40af",
  },
  neutral: {
    0: "#ffffff",
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
  },
} as const;

export const semanticColors = {
  appBackground: colors.neutral[50],
  appForeground: colors.neutral[950],
  panel: colors.neutral[0],
  panelSubtle: colors.neutral[100],
  border: colors.neutral[200],
  muted: colors.neutral[500],
  brand: colors.brand[500],
  focus: colors.brand[600],
  emergency: colors.emergency[600],
  warning: colors.warning[600],
  safety: colors.safety[600],
  success: colors.safety[600],
} as const;

export const darkSemanticColors = {
  appBackground: colors.operations[950],
  appForeground: colors.neutral[50],
  panel: colors.operations[900],
  panelSubtle: colors.operations[850],
  border: colors.operations[700],
  muted: colors.neutral[400],
  brand: colors.brand[400],
  focus: colors.brand[400],
  emergency: "#fb7185",
  warning: "#fbbf24",
  safety: "#34d399",
  success: "#34d399",
} as const;

export const mapColors = {
  background: colors.operations[950],
  ocean: colors.operations[925],
  landDot: "#476272",
  landDotMuted: "#2a4050",
  panel: "rgba(10, 32, 48, 0.92)",
  panelBorder: "#2a4758",
  markerUser: colors.brand[400],
  markerEmergency: "#fb3f6b",
  markerWarning: "#f59e0b",
  markerSafe: "#10b981",
  markerCluster: colors.operations[700],
  glow: "rgba(2, 174, 240, 0.32)",
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const radii = {
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  round: 999,
} as const;

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: "800" },
  title: { fontSize: 24, lineHeight: 32, fontWeight: "800" },
  section: { fontSize: 18, lineHeight: 26, fontWeight: "700" },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "700" },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
} as const;

export const statusColors = {
  pending: colors.warning[600],
  investigating: colors.brand[600],
  active: colors.emergency[600],
  responding: colors.warning[600],
  approved: colors.safety[600],
  resolved: colors.safety[600],
  rejected: colors.neutral[600],
  closed: colors.neutral[600],
  falseAlarm: colors.neutral[600],
} as const;

export const severityColors = {
  info: colors.brand[600],
  warning: colors.warning[600],
  critical: colors.emergency[600],
  low: colors.safety[600],
  medium: colors.warning[600],
  high: colors.emergency[600],
} as const;
