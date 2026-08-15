/**
 * Design tokens — Hypractive v2, cool dark instrument-panel palette.
 *
 * Five colors, treated as a hierarchy, not five equal choices:
 * background < card surface < border/grid < secondary text < primary text.
 * No decorative accent hue — active/important states are communicated
 * through contrast, weight, and motion, not color. Performance deltas
 * stay factual (arrows + numbers), never color-coded.
 */

export const colors = {
  background: '#0B0D10', // Deep Black — primary background
  surface: '#171C22', // Dark Charcoal — cards, elevated surfaces
  surfaceRaised: '#1C212A', // input fields — between surface and border
  border: '#2A333D', // Slate — borders, dividers, chart grids
  textPrimary: '#E7EEF5', // Pale Blue-White — important text, numbers, active state
  textSecondary: '#5D6F82', // Muted Blue-Gray — secondary text, inactive icons
  textMuted: '#46525E', // dimmest tier — least emphasis
  accent: '#E7EEF5', // primary buttons / active state — same as textPrimary, inverted on fill
  accentPressed: '#C7D2DC', // pressed/dimmed variant of accent
  sheen: 'rgba(231, 238, 245, 0.06)', // translucent light — gloss hairlines only, never text
  glassTint: 'rgba(11, 13, 16, 0.7)', // translucent background — blur overlays only
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

const FONT_DISPLAY = 'Urbanist_800ExtraBold';
const FONT_BOLD = 'Urbanist_700Bold';
const FONT_SEMIBOLD = 'Urbanist_600SemiBold';
const FONT_MEDIUM = 'Urbanist_500Medium';
const FONT_REGULAR = 'Urbanist_400Regular';

export const type = {
  display: { fontFamily: FONT_DISPLAY, fontSize: 30, letterSpacing: -0.5, color: colors.textPrimary },
  title: { fontFamily: FONT_BOLD, fontSize: 20, letterSpacing: -0.1, color: colors.textPrimary },
  subtitle: { fontFamily: FONT_SEMIBOLD, fontSize: 15, color: colors.textSecondary },
  eyebrow: { fontFamily: FONT_BOLD, fontSize: 12, color: colors.textSecondary, letterSpacing: 1.4, textTransform: 'uppercase' as const },
  body: { fontFamily: FONT_REGULAR, fontSize: 15, color: colors.textPrimary },
  bodyMuted: { fontFamily: FONT_REGULAR, fontSize: 14, color: colors.textSecondary },
  caption: { fontFamily: FONT_MEDIUM, fontSize: 12, color: colors.textMuted, letterSpacing: 0.3 },
  numeric: { fontFamily: FONT_DISPLAY, fontSize: 36, letterSpacing: -1.2, color: colors.textPrimary },
};

export const fonts = {
  regular: FONT_REGULAR,
  medium: FONT_MEDIUM,
  semibold: FONT_SEMIBOLD,
  bold: FONT_BOLD,
  extrabold: FONT_DISPLAY,
};
