/**
 * Design tokens — Hypractive.
 *
 * Palette: pearl-white background/surfaces, a black/gray text-and-border
 * hierarchy, and one warm accent (rust/terracotta) for primary actions,
 * active states, and icons. This supersedes the earlier strict
 * two-color-only rule — that was right for the previous palette, but
 * this one has a real accent color by design.
 *
 * Functional states that don't need color (form errors, destructive
 * actions, progressive-overload deltas) still use weight and symbols
 * (▲ ▼ ✕ !) rather than color, since that choice was about clarity and
 * accessibility, not just "we had no color available" — it stands on
 * its own regardless of the palette above it.
 *
 * Cards are pearl/white fill with a crisp border and soft shadow (not
 * solid dark fill) — keeps text color uniform everywhere (always
 * dark-on-light), avoiding a whole class of contrast bugs.
 */

export const colors = {
  background: '#F7F6F2', // pearl white — soft, warm, not stark white
  surface: '#FFFFFF', // card fill — slightly brighter than the page for gentle depth
  surfaceRaised: '#F1EFEA', // input fields — subtly distinct from card white
  border: '#000000', // card borders, dividers
  textPrimary: '#000000',
  textSecondary: '#464646',
  textMuted: '#9C9A9A',
  accent: '#A35E47', // rust/terracotta — primary buttons, active tab, icons, links
  accentPressed: '#7A4635', // darkened accent, pressed state
  sheen: 'rgba(0, 0, 0, 0.06)', // translucent black — gloss hairlines/shadows only, never text
  glassTint: 'rgba(247, 246, 242, 0.7)', // translucent pearl-white — blur overlays only (tab bar, modal backdrops)
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

