/**
 * Design tokens — Hypractive, pearl white & dark black.
 *
 * Deliberately a strict two-color system (pearl white, dark black) plus
 * tonal variation within each (soft grays) for depth, elevation, and
 * gloss — no third accent hue is introduced anywhere. Functional states
 * that would traditionally use color (form errors, destructive actions,
 * "increase/decrease" deltas) are instead expressed through weight,
 * symbols (▲ ▼ ✕ !), and borders, keeping the palette honest.
 *
 * Cards are pearl/white fill with a crisp dark border and soft shadow
 * (not solid black fill) — this keeps text color uniform everywhere
 * (always dark-on-light), which is both simpler and safer than
 * maintaining two text-color contexts across every screen.
 */

export const colors = {
  background: '#F7F6F2', // pearl white — soft, warm, not stark white
  surface: '#FFFFFF', // card fill — slightly brighter than the page for gentle depth
  surfaceRaised: '#F1EFEA', // input fields — subtly distinct from card white
  border: '#141414', // dark black — card borders, dividers
  textPrimary: '#141414',
  textSecondary: '#5A5957',
  textMuted: '#8B8985',
  accent: '#141414', // black — primary buttons, active tab, links
  accentPressed: '#3A3936',
  sheen: 'rgba(20, 20, 20, 0.06)', // translucent black — gloss hairlines/shadows only, never text
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
  display: { fontFamily: FONT_DISPLAY, fontSize: 28, letterSpacing: -0.3, color: colors.textPrimary },
  title: { fontFamily: FONT_BOLD, fontSize: 20, letterSpacing: -0.1, color: colors.textPrimary },
  subtitle: { fontFamily: FONT_SEMIBOLD, fontSize: 15, color: colors.textSecondary },
  eyebrow: { fontFamily: FONT_BOLD, fontSize: 13, color: colors.textPrimary, letterSpacing: 1.2, textTransform: 'uppercase' as const },
  body: { fontFamily: FONT_REGULAR, fontSize: 15, color: colors.textPrimary },
  bodyMuted: { fontFamily: FONT_REGULAR, fontSize: 14, color: colors.textSecondary },
  caption: { fontFamily: FONT_MEDIUM, fontSize: 12, color: colors.textMuted, letterSpacing: 0.3 },
  numeric: { fontFamily: FONT_DISPLAY, fontSize: 32, letterSpacing: -1, color: colors.textPrimary },
};

export const fonts = {
  regular: FONT_REGULAR,
  medium: FONT_MEDIUM,
  semibold: FONT_SEMIBOLD,
  bold: FONT_BOLD,
  extrabold: FONT_DISPLAY,
};

