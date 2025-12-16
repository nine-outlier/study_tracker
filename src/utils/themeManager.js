import { getPalette } from './themeHelpers.js';

export const applyTheme = (theme, isColorblind) => {
  const p = getPalette(theme, isColorblind);
  
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

    '--app-pure-white': p[27],
    '--app-pure-black': p[28],
    '--app-special-gradient': p[29],
  };

  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  if (theme === 'midnight') {
      root.classList.add('dark');
  } else {
      root.classList.remove('dark');
  }
};

export const injectThemeStyles = () => {
  const styleId = 'theme-manager-styles';
  let style = document.getElementById(styleId);
  if (!style) {
    style = document.createElement('style');
    style.id = styleId;
    document.head.appendChild(style);
  }

  style.textContent = `
    /* CORE TRANSITIONS & FONTS */
    body {
        background-color: var(--app-bg-page) !important;
        color: var(--app-text-main) !important;
        transition: background-color 0.3s ease, color 0.3s ease;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
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
    .app-text-secondary { color: var(--app-text-subtle) !important; } 
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
    
    .app-bg-success { background-color: var(--app-success) !important; color: var(--app-text-on-primary) !important; }
    .app-bg-warning { background-color: var(--app-warning) !important; color: var(--app-text-on-primary) !important; }
    .app-bg-danger { background-color: var(--app-danger) !important; color: var(--app-text-on-primary) !important; }
    
    .app-bg-pure-white { background-color: var(--app-pure-white) !important; }
    .app-bg-pure-black { background-color: var(--app-pure-black) !important; }

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

    /* GRADIENTS (Corrected for Text Clipping) */
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
    
    /* ANIMATIONS */
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
    .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
  `;
};

export const getActiveGradient = () => {
  return 'var(--app-special-gradient)';
};