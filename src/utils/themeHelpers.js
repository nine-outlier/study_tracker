// src/utils/themeHelpers.js
import React, { useMemo } from 'react';

/* =========================================================
   PALETTE DEFINITIONS (30 items each)
   Index mapping MUST match themeManager expectations:
   0  --app-primary
   1  --app-primary-hover
   2  --app-primary-light
   3  --app-primary-ring
   4  --app-bg-page
   5  --app-bg-surface
   6  --app-bg-highlight
   7  --app-border
   8  --app-border-strong
   9  --app-text-main
   10 --app-text-muted
   11 --app-text-subtle
   12 --app-text-on-primary
   13 --app-success
   14 --app-success-light
   15 --app-success-text
   16 --app-warning
   17 --app-warning-light
   18 --app-warning-text
   19 --app-danger
   20 --app-danger-light
   21 --app-danger-text
   22 --app-chart-1
   23 --app-chart-2
   24 --app-chart-3
   25 --app-chart-4
   26 --app-chart-5
   27 --app-pure-white (legacy: theme base)
   28 --app-pure-black (legacy: theme contrast)
   29 --app-special-gradient
   ========================================================= */

const LIGHT_NORMAL = [
  '#0284c7', '#0369a1', '#e0f2fe', '#38bdf8',
  '#f8fafc', '#ffffff', '#f1f5f9', '#e2e8f0', '#cbd5e1',
  '#0f172a', '#334155', '#475569', '#ffffff',
  '#22c55e', '#dcfce7', '#15803d',
  '#eab308', '#fef9c3', '#854d0e',
  '#ef4444', '#fee2e2', '#991b1b',
  '#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e',
  '#ffffff', '#000000',
  'linear-gradient(to right, #38bdf8, #a855f7, #ec4899)'
];

const LIGHT_CB = [
  '#0072B2', '#005588', '#EEF7FA', '#0072B2',
  '#ffffff', '#f0f0f0', '#e0e0e0', '#000000', '#444444',
  '#000000', '#444444', '#555555', '#ffffff',
  '#009E73', '#E0F2F1', '#00664B',
  '#E69F00', '#FBE9E7', '#996900',
  '#D55E00', '#FBE9E7', '#8c230d',
  '#D55E00', '#E69F00', '#009E73', '#008892', '#0072B2',
  '#ffffff', '#000000',
  'linear-gradient(to right, #33BBEE, #0077BB, #009988)'
];

const MIDNIGHT_NORMAL = [
  '#38bdf8', '#0ea5e9', '#0c4a6e', '#0369a1',
  '#020617', '#0f172a', '#1e293b', '#1e293b', '#334155',
  '#f8fafc', '#cbd5e1', '#94a3b8', '#000000',
  '#22c55e', '#14532d', '#86efac',
  '#eab308', '#713f12', '#fde047',
  '#ef4444', '#7f1d1d', '#fca5a5',
  '#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e',
  '#000000', '#ffffff',
  'linear-gradient(to right, #38bdf8, #a855f7, #ec4899)'
];

const MIDNIGHT_CB = [
  '#33BBEE', '#0077BB', '#002233', '#33BBEE',
  '#09090b', '#18181b', '#27272a', '#ffffff', '#52525b',
  '#ffffff', '#dddddd', '#bbbbbb', '#000000',
  '#009E73', '#003322', '#66CCBB',
  '#E69F00', '#441100', '#FFB000',
  '#EE3377', '#440011', '#FF6699',
  '#EE3377', '#E69F00', '#009E73', '#19ACB0', '#33BBEE',
  '#000000', '#ffffff',
  'linear-gradient(to right, #33BBEE, #EE3377)'
];

const RED_NORMAL = [
  '#e11d48', '#b91c1c', '#fff1f2', '#f43f5e',
  '#fff1f2', '#ffffff', '#fff1f2', '#f43f5e', '#e11d48',
  '#be123c', '#e11d48', '#f43f5e', '#ffffff',
  '#f43f5e', '#fff1f2', '#be123c',
  '#e11d48', '#fff1f2', '#b91c1c',
  '#b91c1c', '#fff1f2', '#be123c',
  '#b91c1c', '#f97316', '#eab308', '#3b82f6', '#22c55e',
  '#ffffff', '#000000',
  'linear-gradient(135deg, #f43f5e, #e11d48, #dc2626, #b91c1c, #be123c)'
];

const RED_CB = [
  '#e11d48', '#000000', '#ffffff', '#e11d48',
  '#ffffff', '#ffffff', '#ffffff', '#000000', '#000000',
  '#e11d48', '#e11d48', '#000000', '#ffffff',
  '#e11d48', '#ffffff', '#e11d48',
  '#e11d48', '#ffffff', '#e11d48',
  '#e11d48', '#ffffff', '#e11d48',
  '#e11d48', '#E69F00', '#009E73', '#33BBEE', '#66CCBB',
  '#ffffff', '#000000',
  'linear-gradient(135deg, #f43f5e, #e11d48, #dc2626, #b91c1c, #be123c)'
];

const DARK_NORMAL = [
  '#3b82f6', '#2563eb', '#1f407b', '#1d4ed8',
  '#000000', '#0a0a0a', '#171717', '#262626', '#404040',
  '#ffffff', '#e5e5e5', '#a3a3a3', '#000000',
  '#4ade80', '#154e28', '#86efac',
  '#d97706', '#422006', '#fde047',
  '#f87171', '#6d1f1f', '#f87171',
  '#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e',
  '#000000', '#ffffff',
  'linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)'
];

const DARK_CB = [
  '#33BBEE', '#0077BB', '#002233', '#33BBEE',
  '#000000', '#111111', '#222222', '#ffffff', '#dddddd',
  '#ffffff', '#dddddd', '#bbbbbb', '#000000',
  '#009E73', '#003322', '#66CCBB',
  '#E69F00', '#441100', '#FFB000',
  '#EE3377', '#440011', '#FF6699',
  '#EE3377', '#E69F00', '#009E73', '#19ACB0', '#33BBEE',
  '#000000', '#ffffff',
  'linear-gradient(to right, #33BBEE, #EE3377)'
];

const PAPER_NORMAL = [
  '#312e81', '#1f2a86', '#e0e7ff', '#6366f1',
  '#fdfbf7', '#f4f1ea', '#e7e5e4', '#d6d3d1', '#a8a29e',
  '#1c1917', '#57534e', '#78716c', '#ffffff',
  '#15803d', '#dcfce7', '#14532d',
  '#b45309', '#fef3c7', '#78350f',
  '#b91c1c', '#fee2e2', '#7f1d1d',
  '#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e',
  '#ffffff', '#000000',
  'linear-gradient(to right, #4338ca, #6366f1, #a5b4fc)'
];

const PAPER_CB = [
  '#0072B2', '#005588', '#e0e7ff', '#6366f1',
  '#fdfbf7', '#f4f1ea', '#e7e5e4', '#d6d3d1', '#a8a29e',
  '#1c1917', '#57534e', '#78716c', '#ffffff',
  '#009E73', '#E0F2F1', '#00664B',
  '#D55E00', '#FBE9E7', '#996900',
  '#D55E00', '#FBE9E7', '#8c230d',
  '#D55E00', '#E69F00', '#009E73', '#008892', '#0072B2',
  '#ffffff', '#000000',
  'linear-gradient(to right, #33BBEE, #0077BB, #009988)'
];

/* =========================================================
   LIQUID GLASS (dark-first, sleek highlights)
   ========================================================= */
const LIQUID_GLASS_NORMAL = [
  '#8ab4ff',                 // primary
  '#6b93ff',                 // primary hover
  'rgba(138,180,255,0.18)',  // primary light
  'rgba(138,180,255,0.36)',  // primary ring

  '#05060a',                 // bg page
  'rgba(255,255,255,0.050)', // bg surface (glass window)
  'rgba(255,255,255,0.070)', // bg highlight
  'rgba(255,255,255,0.10)',  // border
  'rgba(255,255,255,0.18)',  // border strong

  '#f8fafc',                 // text main
  'rgba(248,250,252,0.72)',  // text muted
  'rgba(248,250,252,0.54)',  // text subtle
  '#0b1220',                 // text on primary

  '#22c55e', 'rgba(34,197,94,0.16)', '#86efac',
  '#f59e0b', 'rgba(245,158,11,0.16)', '#fbbf24',
  '#ef4444', 'rgba(239,68,68,0.16)', '#fca5a5',

  '#ef4444', '#f97316', '#eab308', '#3b82f6', '#22c55e',
  '#000000', '#ffffff',

  // 29 --app-special-gradient (specular refraction)
  [
    'linear-gradient(115deg, ',
      'rgba(255,255,255,0.92) 0%, ',
      'rgba(255,255,255,0.12) 14%, ',
      'rgba(170,200,255,0.88) 32%, ',
      'rgba(138,180,255,0.72) 52%, ',
      'rgba(255,255,255,0.88) 78%, ',
      'rgba(255,255,255,0.14) 100%)',
    ', radial-gradient(120% 160% at 22% 18%, rgba(255,255,255,0.55), transparent 52%)',
    ', linear-gradient(180deg, rgba(0,0,0,0.25), rgba(255,255,255,0.05) 45%, rgba(0,0,0,0.22))'
  ].join('')
];

const LIQUID_GLASS_CB = [
  '#33BBEE',
  '#0077BB',
  'rgba(51,187,238,0.18)',
  'rgba(51,187,238,0.36)',

  '#05060a',
  'rgba(255,255,255,0.050)',
  'rgba(255,255,255,0.070)',
  'rgba(255,255,255,0.10)',
  'rgba(255,255,255,0.18)',

  '#ffffff',
  'rgba(255,255,255,0.72)',
  'rgba(255,255,255,0.54)',
  '#0b1220',

  '#009E73', 'rgba(0,158,115,0.16)', '#66CCBB',
  '#E69F00', 'rgba(230,159,0,0.16)', '#FFB000',
  '#EE3377', 'rgba(238,51,119,0.16)', '#FF6699',

  '#EE3377', '#E69F00', '#009E73', '#33BBEE', '#66CCBB',
  '#000000', '#ffffff',

  'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(51,187,238,0.85))'
];

export const THEME_PALETTES = {
  light: { normal: LIGHT_NORMAL, colorblind: LIGHT_CB },
  midnight: { normal: MIDNIGHT_NORMAL, colorblind: MIDNIGHT_CB },
  red: { normal: RED_NORMAL, colorblind: RED_CB },
  dark: { normal: DARK_NORMAL, colorblind: DARK_CB },
  paper: { normal: PAPER_NORMAL, colorblind: PAPER_CB },
  liquidDark: { normal: LIQUID_GLASS_NORMAL, colorblind: LIQUID_GLASS_CB }
};

export const VALID_THEMES = ['light', 'midnight', 'red', 'dark', 'paper', 'liquidDark', 'system'];

export const normalizeThemeSettings = (settings, defaultSettings = {}) => {
  const normalized = { ...(defaultSettings || {}), ...(settings || {}) };

  if (!VALID_THEMES.includes(normalized.theme)) {
    normalized.theme =
      (defaultSettings && defaultSettings.theme) ? defaultSettings.theme : 'light';
  }

  normalized.colorblindMode = !!normalized.colorblindMode;
  return normalized;
};

export const migrateLegacyThemeSettings = (loadedSettings) => {
  if (!loadedSettings || typeof loadedSettings !== 'object') return loadedSettings;

  // legacy: darkMode boolean -> theme string
  if (loadedSettings.darkMode !== undefined && !loadedSettings.theme) {
    loadedSettings.theme = loadedSettings.darkMode ? 'midnight' : 'light';
    delete loadedSettings.darkMode;
  }

  if (!VALID_THEMES.includes(loadedSettings.theme)) loadedSettings.theme = 'light';
  return loadedSettings;
};

export const getThemeRuntime = (appSettings) => {
  const theme = appSettings?.theme || 'light';
  const effectiveDarkMode = isThemeDark(theme);

  return {
    effectiveDarkMode,
    activeSettings: { ...(appSettings || {}), darkMode: effectiveDarkMode },
    rootDarkClass: effectiveDarkMode ? 'dark' : ''
  };
};

/* =========================================================
   Theme resolution helpers
   ========================================================= */
export const resolveSystemTheme = (theme) => {
  if (theme !== 'system') return theme;
  const isSystemDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isSystemDark ? 'midnight' : 'light';
};

export const getPalette = (theme, isColorblind) => {
  const resolved = resolveSystemTheme(theme);
  const t = THEME_PALETTES[resolved] || THEME_PALETTES.light;
  return isColorblind ? t.colorblind : t.normal;
};

export const isThemeDark = (themeOrSettings) => {
  const theme = typeof themeOrSettings === 'string' ? themeOrSettings : themeOrSettings?.theme;
  const resolved = resolveSystemTheme(theme || 'light');
  return ['midnight', 'dark', 'liquidDark'].includes(resolved);
};

/* =========================================================
   App-facing helpers (used by charts/components)
   ========================================================= */
export const getHighContrastColor = () => 'var(--app-theme-contrast)';

export const getTrendColorClass = (trend) => {
  if (trend === 'Positive') return 'app-text-success';
  if (trend === 'Negative') return 'app-text-danger';
  return 'app-text-warning';
};

export const getTopicColorClasses = (rank) => {
  switch (rank) {
    case 'Mastered': return 'app-text-chart-5 app-bg-chart-5/10';
    case 'Strong': return 'app-text-chart-4 app-bg-chart-4/10';
    case 'Developing': return 'app-text-chart-3 app-bg-chart-3/10';
    case 'Weak': return 'app-text-chart-2 app-bg-chart-2/10';
    case 'Critical': return 'app-text-chart-1 app-bg-chart-1/10';
    default: return 'app-text-muted app-bg-surface';
  }
};

export const getActiveGradient = () => 'var(--app-special-gradient)';

/* =========================================================
   Background components (small UI pieces)
   ========================================================= */
export const PaperBackground = () => {
  const trees = useMemo(() => {
    const items = [];
    for (let i = 0; i < 30; i++) {
      const x = i * 40;
      const y = 320 + Math.random() * 20;
      items.push(
        <g key={i} transform={`translate(${x}, ${y})`}>
          <line y2="30" stroke="#4b2e18" strokeWidth="6" />
          <path d="M-15 0 L0 -40 L15 0 Z" fill="#15803d" />
        </g>
      );
    }
    return items;
  }, []);

  return (
    <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 1200 400" preserveAspectRatio="none" className="absolute bottom-0">
        <path d="M0 400 L0 280 Q 400 150 800 320 T 1200 280 L 1200 400 Z" fill="#86efac" />
        {trees}
      </svg>
    </div>
  );
};

export const LiquidGlassBackground = () => (
  <div className="app-liquid-glass-bg">
    <div className="lg-mesh" />
    <div className="lg-grain" />
  </div>
);