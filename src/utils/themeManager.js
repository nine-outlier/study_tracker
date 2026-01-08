// src/utils/themeManager.js
import React, { useLayoutEffect, useRef } from 'react';
import {
  VALID_THEMES,
  getPalette,
  resolveSystemTheme,
  isThemeDark,
  PaperBackground,
  LiquidGlassBackground
} from './themeHelpers.js';

/* =========================================================
   CSS injection (HEAVY CONTENT lives here)
   ========================================================= */
export const injectThemeStyles = () => {
  const styleId = 'theme-manager-styles';
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }

  style.textContent = `
    :root{
      /* Engine vars */
      --lg-vw: 1000;
      --lg-vh: 800;

      --lg-orb1-x: 20%;
      --lg-orb1-y: 18%;
      --lg-orb1-h: 215;

      --lg-orb2-x: 82%;
      --lg-orb2-y: 16%;
      --lg-orb2-h: 255;

      --lg-orb3-x: 72%;
      --lg-orb3-y: 84%;
      --lg-orb3-h: 325;

      --lg-orb4-x: 26%;
      --lg-orb4-y: 80%;
      --lg-orb4-h: 165;

      --lg-tilt-x: 0; /* degrees */
      --lg-tilt-y: 0; /* degrees */

      --lg-scroll-v: 0; /* 0..1 */
      --lg-scroll-p: 0; /* 0..1 */

      --lg-light-x: 50%;
      --lg-light-y: 10%;
      --lg-light-i: 0;  /* 0..1 */
    }

    body {
      background-color: var(--app-bg-page) !important;
      color: var(--app-text-main) !important;
      transition: background-color 0.25s ease, color 0.25s ease;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
    }

    /* SEMANTIC UTILITY CLASSES */
    .app-text-main { color: var(--app-text-main) !important; }
    .app-text-muted { color: var(--app-text-muted) !important; }
    .app-text-subtle { color: var(--app-text-subtle) !important; }
    .app-text-primary { color: var(--app-primary) !important; }
    .app-text-on-primary { color: var(--app-text-on-primary) !important; }
    .app-text-success { color: var(--app-success-text) !important; }
    .app-text-warning { color: var(--app-warning-text) !important; }
    .app-text-danger { color: var(--app-danger-text) !important; }
    .app-text-pure-white { color: var(--app-pure-white) !important; }
    .app-text-pure-black { color: var(--app-pure-black) !important; }

    /* BACKGROUND UTILITIES */
    .app-bg-page { background-color: var(--app-bg-page) !important; }
    .app-bg-surface { background-color: var(--app-bg-surface) !important; }
    .app-bg-highlight { background-color: var(--app-bg-highlight) !important; }

    .app-bg-primary { background-color: var(--app-primary) !important; color: var(--app-text-on-primary) !important; }
    .app-bg-primary-light { background-color: var(--app-primary-light) !important; color: var(--app-primary) !important; }

    .app-bg-success-light { background-color: var(--app-success-light) !important; color: var(--app-success-text) !important; }
    .app-bg-warning-light { background-color: var(--app-warning-light) !important; color: var(--app-warning-text) !important; }
    .app-bg-danger-light { background-color: var(--app-danger-light) !important; color: var(--app-danger-text) !important; }

    /* BORDERS & RINGS */
    .app-border-muted { border-color: var(--app-border) !important; }
    .app-border-strong { border-color: var(--app-border-strong) !important; }
    .app-border-primary { border-color: var(--app-primary) !important; }

    .app-ring-primary { --tw-ring-color: var(--app-primary-ring) !important; }
    .app-ring-success { --tw-ring-color: var(--app-success) !important; }
    .app-ring-warning { --tw-ring-color: var(--app-warning) !important; }
    .app-ring-danger { --tw-ring-color: var(--app-danger) !important; }
    .app-ring-subtle { --tw-ring-color: var(--app-border) !important; }

    /* HOVER STATES */
    .app-hover-primary:hover { background-color: var(--app-primary-hover) !important; cursor: pointer; }
    .app-hover-highlight:hover { background-color: var(--app-bg-highlight) !important; }

    /* GRADIENT TEXT */
    .app-gradient-text {
      background-image: var(--app-special-gradient) !important;
      background-size: 100%;
      background-repeat: no-repeat;
      -webkit-background-clip: text !important;
      background-clip: text !important;
      -webkit-text-fill-color: transparent !important;
      color: transparent !important;
      font-weight: bold;
      display: inline-block;
    }

    /* SCROLLBAR */
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: var(--app-bg-surface); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--app-border-strong); border-radius: 3px; }

    /* ======================================================
       LIQUID GLASS BACKGROUND
       - dark-first, visible drifting color fields (engine-driven)
       ====================================================== */
    .theme-liquid-glass body {
      background-color: transparent !important;
    }

    .theme-liquid-glass #root,
    .theme-liquid-glass #app {
      position: relative;
      z-index: 1;
    }

    .theme-liquid-glass .app-liquid-glass-bg{
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;

      background:
        radial-gradient(1100px 980px at var(--lg-orb1-x) var(--lg-orb1-y),
          hsla(var(--lg-orb1-h), 90%, 62%, 0.18), transparent 64%),
        radial-gradient(1300px 1120px at var(--lg-orb2-x) var(--lg-orb2-y),
          hsla(var(--lg-orb2-h), 88%, 64%, 0.14), transparent 66%),
        radial-gradient(1450px 1240px at var(--lg-orb3-x) var(--lg-orb3-y),
          hsla(var(--lg-orb3-h), 86%, 66%, 0.12), transparent 68%),
        radial-gradient(1200px 1040px at var(--lg-orb4-x) var(--lg-orb4-y),
          hsla(var(--lg-orb4-h), 74%, 56%, 0.09), transparent 70%),
        radial-gradient(1000px 900px at 50% 20%,
          rgba(255,255,255,0.05), transparent 62%),
        linear-gradient(180deg, rgba(5,6,10,1) 0%, rgba(0,0,0,1) 100%);
      transform: translate3d(0,0,0);
    }

    /* Prismatic film: reacts to tilt + scroll velocity (NOT pulsing) */
    .theme-liquid-glass .app-liquid-glass-bg::after{
      content:"";
      position:absolute;
      inset:-20%;
      background:
        conic-gradient(
          from 220deg at 54% 42%,
          rgba(255,255,255,0.00),
          rgba(255,255,255,0.06),
          rgba(170,200,255,0.06),
          rgba(255,255,255,0.03),
          rgba(0,0,0,0.00)
        );
      mix-blend-mode: screen;
      opacity: calc(0.10 + var(--lg-scroll-v) * 0.16);
      filter: blur(28px) saturate(1.20);
      transform:
        rotate(calc(var(--lg-tilt-y) * 0.65deg))
        translate3d(calc(var(--lg-tilt-x) * 10px), calc(var(--lg-tilt-y) * 10px), 0);
    }

    .theme-liquid-glass .lg-mesh{
      position:absolute;
      inset:-40%;
      background-image:
        linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 96px 96px;
      opacity: 0.08;
      transform:
        perspective(850px)
        rotateX(calc(14deg + var(--lg-tilt-x) * 0.12deg))
        rotateY(calc(var(--lg-tilt-y) * 0.18deg))
        translate3d(0, 8%, 0);
      mask-image: radial-gradient(circle at 50% 45%, black 34%, transparent 74%);
    }

    .theme-liquid-glass .lg-grain{
      position:absolute;
      inset:0;
      opacity: 0.10;
      mix-blend-mode: overlay;
      background:
        repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px),
        repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 4px);
      filter: blur(0.25px);
    }

    /* ======================================================
       LIQUID GLASS SURFACES
       - dark-first refractions + sleek white specular
       - NO pulsing system
       ====================================================== */
    .theme-liquid-glass .app-bg-surface{
      position: relative;
      overflow: hidden;

      background: rgba(255,255,255,0.050) !important;
      border-color: rgba(255,255,255,0.12) !important;

      backdrop-filter: blur(24px) saturate(1.45) brightness(1.03);
      -webkit-backdrop-filter: blur(24px) saturate(1.45) brightness(1.03);

      box-shadow:
        0 1px 0 rgba(255,255,255,0.08) inset,
        0 0 0 1px rgba(255,255,255,0.10) inset,
        0 30px 90px rgba(0,0,0,0.62);

      transform: translate3d(0,0,0);
    }

    /* Corner refractions (static + scroll-velocity lift, not pulse) */
    .theme-liquid-glass .app-bg-surface::before{
      content:"";
      position:absolute;
      inset:-1px;
      pointer-events:none;
      background:
        radial-gradient(240px 190px at 8% 10%, rgba(255,255,255,0.18), transparent 62%),
        radial-gradient(260px 210px at 92% 8%, rgba(255,255,255,0.10), transparent 66%),
        radial-gradient(260px 210px at 10% 92%, rgba(255,255,255,0.08), transparent 68%),
        radial-gradient(260px 210px at 92% 92%, rgba(255,255,255,0.08), transparent 70%);
      opacity: calc(0.52 + var(--lg-scroll-v) * 0.22);
      mix-blend-mode: screen;
      filter: blur(0.3px);
    }

    /* Cursor sheen: smaller + weaker, only on hover/focus */
    .theme-liquid-glass .app-bg-surface::after{
      content:"";
      position:absolute;
      inset:-40%;
      pointer-events:none;
      background:
        radial-gradient(
          220px circle at var(--lg-light-x) var(--lg-light-y),
          rgba(255,255,255,0.18),
          rgba(255,255,255,0.06) 34%,
          transparent 62%
        );
      mix-blend-mode: overlay;
      filter: blur(10px);
      opacity: 0;
      transform:
        rotate(12deg)
        translate3d(calc(var(--lg-tilt-y) * 5px), calc(var(--lg-tilt-x) * 5px), 0);
      transition: opacity 120ms linear;
    }

    .theme-liquid-glass .app-bg-surface:hover::after,
    .theme-liquid-glass .app-bg-surface:focus-within::after{
      opacity: calc(0.05 + var(--lg-light-i) * 0.12);
    }

    /* Make "primary-light" elements glassy too (for the "2" etc) */
    .theme-liquid-glass .app-bg-primary-light{
      position: relative;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.045) !important;
      backdrop-filter: blur(18px) saturate(1.35) brightness(1.03);
      -webkit-backdrop-filter: blur(18px) saturate(1.35) brightness(1.03);
      box-shadow:
        0 1px 0 rgba(255,255,255,0.08) inset,
        0 0 0 1px rgba(255,255,255,0.06) inset;
    }

    /* Reduce-motion safety */
    .reduce-motion .theme-liquid-glass .app-liquid-glass-bg,
    .reduce-motion .theme-liquid-glass .app-liquid-glass-bg::after,
    .reduce-motion .theme-liquid-glass .lg-mesh,
    .reduce-motion .theme-liquid-glass .app-bg-surface::before,
    .reduce-motion .theme-liquid-glass .app-bg-surface::after{
      transition: none !important;
      transform: none !important;
      filter: none !important;
    }
  `;
};

/* =========================================================
   Liquid Glass motion engine (NO PULSE)
   - orbiting colors + hue drift
   - scroll velocity affects film + corner refraction intensity
   - pointer tilt + subtle cursor sheen intensity
   ========================================================= */
let _raf = null;
let _onScroll = null;
let _onPointer = null;
let _onResize = null;

let _startTs = 0;
let _prevTs = 0;

let _vw = 1200;
let _vh = 800;

let _scrollY = 0;
let _scrollPrev = 0;
let _scrollVel = 0;

let _scrollPos01 = 0;

let _targetPX = 0.5;
let _targetPY = 0.2;
let _px = 0.5;
let _py = 0.2;

let _pI = 0;
let _lastPointerX = null;
let _lastPointerY = null;

const setVar = (k, v) => {
  const root = document.documentElement;
  if (!root) return;
  root.style.setProperty(k, v);
};

const clamp01 = (n) => Math.max(0, Math.min(1, n));
const lerp = (a, b, t) => a + (b - a) * t;

const startLiquidGlassEngine = () => {
  if (typeof window === 'undefined') return;
  if (_raf) return;

  const prefersReduce =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduce) return;

  _startTs = performance.now();
  _prevTs = _startTs;

  _vw = Math.max(320, window.innerWidth || 1200);
  _vh = Math.max(320, window.innerHeight || 800);

  _scrollY = window.scrollY || 0;
  _scrollPrev = _scrollY;
  _scrollVel = 0;

  setVar('--lg-vw', `${_vw}`);
  setVar('--lg-vh', `${_vh}`);

  _onResize = () => {
    _vw = Math.max(320, window.innerWidth || 1200);
    _vh = Math.max(320, window.innerHeight || 800);
    setVar('--lg-vw', `${_vw}`);
    setVar('--lg-vh', `${_vh}`);
  };

  _onScroll = () => {
    _scrollY = window.scrollY || 0;
  };

  _onPointer = (e) => {
    const w = Math.max(1, window.innerWidth || 1);
    const h = Math.max(1, window.innerHeight || 1);
    _targetPX = clamp01(e.clientX / w);
    _targetPY = clamp01(e.clientY / h);

    if (_lastPointerX !== null && _lastPointerY !== null) {
      const dx = e.clientX - _lastPointerX;
      const dy = e.clientY - _lastPointerY;
      const d = Math.sqrt(dx * dx + dy * dy);
      // small + subtle intensity bump from motion
      _pI = Math.min(1, _pI + d / 1200);
    }

    _lastPointerX = e.clientX;
    _lastPointerY = e.clientY;
  };

  window.addEventListener('resize', _onResize, { passive: true });
  window.addEventListener('scroll', _onScroll, { passive: true });
  window.addEventListener('pointermove', _onPointer, { passive: true });

  const tick = (ts) => {
    const t = (ts - _startTs) / 1000;
    const dt = Math.max(0.001, Math.min(0.05, (ts - _prevTs) / 1000));
    _prevTs = ts;

    // scroll velocity (smoothed)
    const dy = _scrollY - _scrollPrev;
    _scrollPrev = _scrollY;

    const rawVel = Math.abs(dy) / Math.max(1, _vh); // normalized per viewport
    _scrollVel = lerp(_scrollVel, rawVel, 0.18);
    const scrollV01 = clamp01(_scrollVel * 6.0);

    // scroll position normalized (for slow drift)
    const docH = Math.max(_vh, document.documentElement.scrollHeight || _vh);
    const maxScroll = Math.max(1, docH - _vh);
    _scrollPos01 = clamp01(_scrollY / maxScroll);

    // pointer smoothing + decay intensity
    _px = lerp(_px, _targetPX, 0.10);
    _py = lerp(_py, _targetPY, 0.10);
    _pI = lerp(_pI, 0, 0.06);
    const pI01 = clamp01(_pI);

    // gentle tilt from pointer
    const tiltX = (_py - 0.5) * -7.0; // degrees
    const tiltY = (_px - 0.5) * 7.5;  // degrees

    // ORB MOTION: slow + smooth + scroll-coupled drift
    const sp = _scrollPos01;
    const s = scrollV01;

    const o1x = 0.18 + 0.07 * Math.sin(t * 0.18 + 0.9) + 0.02 * Math.sin(t * 0.44) + (sp - 0.5) * 0.04;
    const o1y = 0.16 + 0.06 * Math.cos(t * 0.16 + 1.1) + 0.02 * Math.cos(t * 0.39) + (sp - 0.5) * 0.06;

    const o2x = 0.84 + 0.06 * Math.sin(t * 0.14 + 2.4) + 0.02 * Math.sin(t * 0.33) - (sp - 0.5) * 0.04;
    const o2y = 0.18 + 0.06 * Math.cos(t * 0.17 + 0.4) + 0.02 * Math.cos(t * 0.36) + (sp - 0.5) * 0.04;

    const o3x = 0.74 + 0.07 * Math.sin(t * 0.13 + 3.1) - 0.02 * s - (sp - 0.5) * 0.03;
    const o3y = 0.84 + 0.06 * Math.cos(t * 0.12 + 0.8) + 0.02 * s + (sp - 0.5) * 0.05;

    const o4x = 0.26 + 0.05 * Math.sin(t * 0.11 + 1.8) + 0.02 * s + (sp - 0.5) * 0.03;
    const o4y = 0.80 + 0.05 * Math.cos(t * 0.12 + 2.2) - 0.02 * s - (sp - 0.5) * 0.04;

    // HUE DRIFT: progressive + subtle
    const h1 = 210 + 22 * Math.sin(t * 0.05 + 0.3) + sp * 10;
    const h2 = 252 + 26 * Math.sin(t * 0.045 + 1.1) + sp * 8;
    const h3 = 320 + 22 * Math.sin(t * 0.040 + 2.0) + sp * 6;
    const h4 = 165 + 12 * Math.sin(t * 0.048 + 0.7) + sp * 5;

    // push vars
    setVar('--lg-orb1-x', `${(clamp01(o1x) * 100).toFixed(2)}%`);
    setVar('--lg-orb1-y', `${(clamp01(o1y) * 100).toFixed(2)}%`);
    setVar('--lg-orb1-h', `${h1.toFixed(2)}`);

    setVar('--lg-orb2-x', `${(clamp01(o2x) * 100).toFixed(2)}%`);
    setVar('--lg-orb2-y', `${(clamp01(o2y) * 100).toFixed(2)}%`);
    setVar('--lg-orb2-h', `${h2.toFixed(2)}`);

    setVar('--lg-orb3-x', `${(clamp01(o3x) * 100).toFixed(2)}%`);
    setVar('--lg-orb3-y', `${(clamp01(o3y) * 100).toFixed(2)}%`);
    setVar('--lg-orb3-h', `${h3.toFixed(2)}`);

    setVar('--lg-orb4-x', `${(clamp01(o4x) * 100).toFixed(2)}%`);
    setVar('--lg-orb4-y', `${(clamp01(o4y) * 100).toFixed(2)}%`);
    setVar('--lg-orb4-h', `${h4.toFixed(2)}`);

    setVar('--lg-tilt-x', `${tiltX.toFixed(3)}`);
    setVar('--lg-tilt-y', `${tiltY.toFixed(3)}`);

    setVar('--lg-scroll-v', `${scrollV01.toFixed(4)}`);
    setVar('--lg-scroll-p', `${sp.toFixed(4)}`);

    setVar('--lg-light-x', `${(_px * 100).toFixed(2)}%`);
    setVar('--lg-light-y', `${(_py * 100).toFixed(2)}%`);
    setVar('--lg-light-i', `${pI01.toFixed(4)}`);

    _raf = requestAnimationFrame(tick);
  };

  _raf = requestAnimationFrame(tick);
};

const stopLiquidGlassEngine = () => {
  if (typeof window === 'undefined') return;

  if (_raf) cancelAnimationFrame(_raf);
  _raf = null;

  if (_onScroll) window.removeEventListener('scroll', _onScroll);
  if (_onPointer) window.removeEventListener('pointermove', _onPointer);
  if (_onResize) window.removeEventListener('resize', _onResize);

  _onScroll = null;
  _onPointer = null;
  _onResize = null;

  setVar('--lg-scroll-v', '0');
  setVar('--lg-light-i', '0');
};

/* =========================================================
   Theme application (LOGIC lives here)
   ========================================================= */
export const applyTheme = (theme, isColorblind) => {
  const root = document.documentElement;

  const resolved = resolveSystemTheme(theme || 'light');
  const isLiquid = resolved === 'liquidDark' && !isColorblind; // no glass in colorblind mode

  const p = getPalette(resolved, isColorblind);

  const vars = {
    '--app-primary': p[0],
    '--app-primary-hover': p[1],
    '--app-primary-light': p[2],
    '--app-primary-ring': p[3],

    '--app-bg-page': p[4],
    '--app-bg-surface': p[5],
    '--app-bg-highlight': p[6],
    '--app-border': p[7],
    '--app-border-strong': p[8],

    '--app-text-main': p[9],
    '--app-text-muted': p[10],
    '--app-text-subtle': p[11],
    '--app-text-on-primary': p[12],

    '--app-success': p[13],
    '--app-success-light': p[14],
    '--app-success-text': p[15],

    '--app-warning': p[16],
    '--app-warning-light': p[17],
    '--app-warning-text': p[18],

    '--app-danger': p[19],
    '--app-danger-light': p[20],
    '--app-danger-text': p[21],

    '--app-chart-1': p[22],
    '--app-chart-2': p[23],
    '--app-chart-3': p[24],
    '--app-chart-4': p[25],
    '--app-chart-5': p[26],

    '--app-pure-white': p[27],
    '--app-pure-black': p[28],
    '--app-theme-base': p[27],
    '--app-theme-contrast': p[28],

    '--app-special-gradient': p[29]
  };

  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));

  root.dataset.theme = resolved;
  root.classList.toggle('dark', isThemeDark(resolved));
  root.classList.toggle('theme-liquid-glass', isLiquid);

  if (isLiquid) startLiquidGlassEngine();
  else stopLiquidGlassEngine();
};

export const initThemeEngine = (theme, isColorblind) => {
  injectThemeStyles();
  applyTheme(theme, isColorblind);
};

export const syncThemeEngine = (theme, isColorblind) => {
  applyTheme(theme, isColorblind);

  // ensure no old background overrides linger
  const body = document.body;
  if (body) {
    body.style.backgroundImage = '';
    body.style.backgroundRepeat = '';
    body.style.backgroundPosition = '';
    body.style.backgroundSize = '';
    body.style.backgroundAttachment = '';
  }
};

export const renderPaperBackground = (theme) => {
  if (theme === 'paper') return <PaperBackground />;
  if (theme === 'liquidDark') return <LiquidGlassBackground />;
  return null;
};

/* =========================================================
   Settings normalization / migration / runtime
   ========================================================= */
export const normalizeThemeSettings = (settings, defaultSettings = {}) => {
  const normalized = { ...(defaultSettings || {}), ...(settings || {}) };
  if (!VALID_THEMES.includes(normalized.theme)) {
    normalized.theme = (defaultSettings && defaultSettings.theme) ? defaultSettings.theme : 'light';
  }
  normalized.colorblindMode = !!normalized.colorblindMode;
  return normalized;
};

export const migrateLegacyThemeSettings = (loadedSettings) => {
  if (!loadedSettings || typeof loadedSettings !== 'object') return loadedSettings;

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
   ThemeEngine component (render-only + init)
   ========================================================= */
export const ThemeEngine = ({ theme, colorblindMode }) => {
  const didInit = useRef(false);

  useLayoutEffect(() => {
    initThemeEngine(theme, colorblindMode);
    didInit.current = true;
  }, [theme, colorblindMode]);

  return (
    <>
      {theme === 'paper' && <PaperBackground />}
      {theme === 'liquidDark' && <LiquidGlassBackground />}
    </>
  );
};