/**
 * Eject.fi Design System v5.0
 * 
 * References: Phantom Wallet (hierarchy & balance focus),
 * Revolut (action cards), Linear App (typography & spacing),
 * Perplexity (agent UX), Apple HIG (safe areas & clarity)
 * 
 * Core: Deep-black canvas, subtle violet accents, 
 * generous whitespace, SF-style type scale
 */
import { Platform } from 'react-native';

export const COLORS = {
  bg: {
    primary: '#050507',      // True-black canvas
    secondary: '#0C0C10',    // Alias for card
    tertiary: '#141418',     // Alias for elevated
    card: '#0C0C10',         // Card surfaces  
    elevated: '#141418',     // Elevated/hover
    input: '#0A0A0E',        // Input fields
    overlay: 'rgba(5, 5, 7, 0.90)',
  },

  accent: {
    // Primary: Muted Violet (less neon, more premium)
    violet: '#9B8AFB',
    violetMuted: '#7C6EDB',
    violetDim: 'rgba(155, 138, 251, 0.10)',
    violetBorder: 'rgba(155, 138, 251, 0.18)',
    violetGlow: 'rgba(155, 138, 251, 0.06)',

    // Backward-compat aliases
    purple: '#9B8AFB',
    purpleLight: '#A78BFA',
    purpleBright: '#7C3AED',
    purpleDim: 'rgba(155, 138, 251, 0.10)',
    purpleGlow: 'rgba(155, 138, 251, 0.06)',
    purpleBorder: 'rgba(155, 138, 251, 0.18)',

    // Accent: Warm Gold
    gold: '#E5A639',
    goldDim: 'rgba(229, 166, 57, 0.10)',
    goldBorder: 'rgba(229, 166, 57, 0.18)',

    // Status: Sage Green
    green: '#3DD68C',
    greenDim: 'rgba(61, 214, 140, 0.10)',
    greenBorder: 'rgba(61, 214, 140, 0.15)',

    // Info: Soft Blue
    blue: '#6CB4EE',
    blueDim: 'rgba(108, 180, 238, 0.10)',
    blueBorder: 'rgba(108, 180, 238, 0.15)',
  },

  danger: {
    primary: '#F0544F',
    dim: 'rgba(240, 84, 79, 0.10)',
    border: 'rgba(240, 84, 79, 0.20)',
  },

  text: {
    primary: '#F5F5F7',      // Apple-white
    secondary: '#A1A1AA',    // Zinc 400
    tertiary: '#71717A',     // Zinc 500
    muted: '#52525B',        // Zinc 600
    inverse: '#050507',
  },

  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
  },

  // Legacy aliases for backwards compat
  eject: {
    primary: '#F0544F',
    light: '#F87171',
    bright: '#DC2626',
    dim: 'rgba(240, 84, 79, 0.10)',
    surface: 'rgba(240, 84, 79, 0.05)',
    border: 'rgba(240, 84, 79, 0.25)',
    glow: 'rgba(240, 84, 79, 0.20)',
  },

  status: {
    online: '#3DD68C',
    warning: '#E5A639',
    danger: '#F0544F',
    info: '#6CB4EE',
  },

  gradient: {
    purpleStart: '#9B8AFB',
    purpleEnd: '#6D28D9',
    ejectStart: '#F0544F',
    ejectEnd: '#B91C1C',
    goldStart: '#E5A639',
    goldEnd: '#D97706',
    shieldStart: '#9B8AFB',
    shieldEnd: '#6CB4EE',
  },

  // Backward-compat aliases
  accent_compat: {
    purple: '#9B8AFB',
    purpleLight: '#A78BFA',
    purpleBright: '#7C3AED',
    purpleDim: 'rgba(155, 138, 251, 0.10)',
    purpleGlow: 'rgba(155, 138, 251, 0.06)',
    purpleBorder: 'rgba(155, 138, 251, 0.18)',
    gold: '#E5A639',
    goldLight: '#FBBF24',
    goldDim: 'rgba(229, 166, 57, 0.10)',
    goldBorder: 'rgba(229, 166, 57, 0.18)',
    green: '#3DD68C',
    greenLight: '#34D399',
    greenDim: 'rgba(61, 214, 140, 0.10)',
    greenBorder: 'rgba(61, 214, 140, 0.15)',
    blue: '#6CB4EE',
    blueLight: '#7DD3FC',
    blueDim: 'rgba(108, 180, 238, 0.10)',
    blueBorder: 'rgba(108, 180, 238, 0.15)',
  },
};

export const FONTS = {
  regular: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  medium: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
  bold: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  mono: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
};

export const RADIUS = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  pill: 999,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  }),
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
};
