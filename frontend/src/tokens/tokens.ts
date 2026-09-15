/**
 * 3-LAYER TOKEN ARCHITECTURE
 * Layer 1: Primitive Tokens (Raw physics, scales, palettes)
 * Layer 2: Semantic Tokens (Meaning-bound design intentions)
 * Layer 3: Component Tokens (Scoped visual properties for cockpit widgets)
 */

// ============================================================================
// LAYER 1: PRIMITIVE TOKENS
// ============================================================================
export const primitives = {
  colors: {
    obsidian: {
      950: '#080A0F', // Void ground
      900: '#0F131C', // Deep panel sub-layer
      850: '#121724', // Card body
      800: '#182030', // Elevated layer
      700: '#232E42', // Active selection
    },
    amber: {
      700: '#B45309',
      600: '#D97706',
      500: '#F59E0B', // Primary signal amber
      400: '#FBBF24',
      300: '#FCD34D',
    },
    mint: {
      700: '#047857',
      600: '#059669',
      500: '#10B981', // Evaluation mint
      400: '#34D399',
      300: '#6EE7B7',
    },
    coral: {
      700: '#BE123C',
      600: '#E11D48',
      500: '#F43F5E', // Alert / anomaly
      400: '#FB7185',
    },
    slate: {
      100: '#F8FAFC',
      200: '#E2E8F0',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    families: {
      display: '"Space Grotesk", -apple-system, BlinkMacSystemFont, sans-serif',
      body: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem',     // 48px
    },
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    tracking: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.05em',
      widest: '0.1em',
    },
  },
  motion: {
    durations: {
      instant: '0ms',
      fast: '180ms',
      normal: '280ms',
      slow: '450ms',
      reveal: '700ms',
    },
    easings: {
      spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
      out: 'cubic-bezier(0.25, 1, 0.5, 1)',
      overshoot: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      linear: 'linear',
    },
  },
  radii: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
} as const;

// ============================================================================
// LAYER 2: SEMANTIC TOKENS
// ============================================================================
export const semantics = {
  surfaces: {
    ground: 'var(--surface-ground, #080A0F)',
    panel: 'var(--surface-panel, #0F131C)',
    card: 'var(--surface-card, #121724)',
    elevated: 'var(--surface-elevated, rgba(18, 24, 37, 0.75))',
    overlay: 'var(--surface-overlay, rgba(8, 10, 15, 0.85))',
  },
  borders: {
    subtle: 'var(--border-subtle, rgba(255, 255, 255, 0.08))',
    default: 'var(--border-default, rgba(255, 255, 255, 0.12))',
    active: 'var(--border-active, rgba(245, 158, 11, 0.45))',
    rimLight: 'var(--border-rim, rgba(255, 255, 255, 0.15))',
  },
  text: {
    primary: 'var(--text-primary, #F8FAFC)',
    secondary: 'var(--text-secondary, #94A3B8)',
    tertiary: 'var(--text-tertiary, #64748B)',
    inverse: 'var(--text-inverse, #080A0F)',
  },
  signal: {
    amber: 'var(--accent-amber, #F59E0B)',
    amberSubtle: 'var(--accent-amber-subtle, rgba(245, 158, 11, 0.12))',
    amberGlow: 'var(--accent-amber-glow, rgba(245, 158, 11, 0.25))',
    mint: 'var(--accent-mint, #10B981)',
    mintSubtle: 'var(--accent-mint-subtle, rgba(16, 185, 129, 0.12))',
    mintGlow: 'var(--accent-mint-glow, rgba(16, 185, 129, 0.25))',
    coral: 'var(--accent-coral, #F43F5E)',
    coralSubtle: 'var(--accent-coral-subtle, rgba(244, 63, 94, 0.12))',
  },
  focusRing: 'var(--focus-ring, rgba(245, 158, 11, 0.80))',
  motion: {
    springDuration: 'var(--motion-duration-slow, 450ms)',
    springEase: 'var(--motion-ease-spring, cubic-bezier(0.16, 1, 0.3, 1))',
    transitionFast: 'var(--motion-duration-fast, 180ms)',
  },
} as const;

// ============================================================================
// LAYER 3: COMPONENT TOKENS
// ============================================================================
export const components = {
  cockpit: {
    headerBg: 'rgba(15, 19, 28, 0.85)',
    headerBorder: 'var(--border-subtle)',
    statusDotLive: '#10B981',
    statusDotRecording: '#F59E0B',
  },
  webcamPanel: {
    background: 'rgba(18, 24, 37, 0.85)',
    backdropBlur: '16px',
    rimLightBorder: '1px solid rgba(255, 255, 255, 0.12)',
    reticleColor: '#F59E0B',
    reticleLockMint: '#10B981',
  },
  kineticQuestion: {
    fontFamily: primitives.typography.families.display,
    letterSpacing: primitives.typography.tracking.tight,
    textColor: '#F8FAFC',
    staggerDelayMs: 40,
    revealDurationMs: 450,
  },
  filmTimer: {
    strokeTrack: 'rgba(255, 255, 255, 0.08)',
    strokeFillNormal: '#F59E0B',
    strokeFillCritical: '#F43F5E',
    digitsFont: primitives.typography.families.mono,
  },
  audioWaveform: {
    canvasHeight: 64,
    barCount: 32,
    barWidth: 3,
    barGap: 2,
    gradientStart: '#F59E0B',
    gradientEnd: '#10B981',
    idleColor: 'rgba(255, 255, 255, 0.15)',
  },
  metricRing: {
    trackColor: 'rgba(255, 255, 255, 0.08)',
    relevanceColor: '#F59E0B', // Content / Amber
    clarityColor: '#10B981',   // Speech / Mint
    composureColor: '#38BDF8', // Vision / Cyan-Ice
    labelFont: primitives.typography.families.mono,
  },
  pullQuote: {
    borderLeft: '3px solid #F59E0B',
    bg: 'rgba(245, 158, 11, 0.06)',
    fontFamily: primitives.typography.families.body,
    textColor: '#F8FAFC',
  },
  scoreTiers: {
    strong: { label: 'Strong', color: '#10B981', range: '85–100' },
    developing: { label: 'Developing', color: '#F59E0B', range: '70–84' },
    needsPractice: { label: 'Needs Practice', color: '#FB923C', range: '50–69' },
    foundational: { label: 'Foundational', color: '#94A3B8', range: '<50' },
  },
} as const;

// Helper: Check reduced motion preference programmatically
export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Helper: Get safe duration for animations (0 if reduced motion is preferred)
export function getSafeDuration(seconds: number): number {
  return isReducedMotionPreferred() ? 0 : seconds;
}
