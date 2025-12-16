// --- PALETTE DEFINITIONS (30 Spots: 0-29) ---
// 1PriHoverBrandDarker/lighter shade of Primary for hover states
// 2PriLightBrandVery light shade of Primary for light backgrounds/accents
// 3PriRingBrandPrimary color used for focus rings or subtle borders
// 4BgPageNeutralBackground color for the entire viewport/page (deepest background)
// 5BgSurfaceNeutralBackground color for interactive cards, modals, and charts
// 6BgHighlightNeutralSubtle highlight color for hover states on neutral elements or input backgrounds
// 7BorderNeutralDefault thin border color (e.g., between cards/sections)
// 8BorderStrongNeutralDarker border color for inputs or primary outlines
// 9TextMainTextPrimary text color (headings, main content)
// 10TextMutedTextSecondary/subtle text color (captions, footer text)
// 11TextSubtleTextWeakest text contrast (often used for axis labels)
// 12TextOnPrimaryTextText color used on Primary background colors (must be high contrast, usually white or black)
// 13SuccessStatusBase color for success indicators (e.g., button background)
// 14SuccessLightStatusLight background color for success badges/notifications
// 15SuccessTextStatusText color for success indicators (must contrast with SuccessLight)
// 16WarningStatusBase color for warning indicators
// 17WarningLightStatusLight background color for warning badges/notifications
// 18WarningTextStatusText color for warning indicators (must contrast with WarningLight)
// 19DangerStatusBase color for danger/critical indicators
// 20DangerLightStatusLight background color for danger badges/notifications
// 21DangerTextStatusText color for danger indicators (must contrast with DangerLight)
// 22Chart 1 (Critical)Chart/TrendColor for the lowest tier on charts (e.g., Critical status)
// 23Chart 2 (Weak)Chart/TrendColor for the second tier on charts (e.g., Weak status)
// 24Chart 3 (Developing)Chart/TrendColor for the middle tier on charts (e.g., Developing status)
// 25Chart 4 (Strong)Chart/TrendColor for the strong tier on charts
// 26Chart 5 (Mastered)Chart/TrendColor for the highest tier on charts
// 27ThemeBaseUtilityPrimary base color for high-contrast elements (White for Light, Black for Midnight/Red)
// 28ThemeContrastUtilityPrimary contrast color for high-contrast elements (Black for Light, White for Midnight/Red)
// 29SpecialGradientUtilityCSS gradient string for the "2" and Trophy Icon.


// --- 1. LIGHT THEME ---
const LIGHT_NORMAL = [
    '#0284c7', '#0369a1', '#e0f2fe', '#38bdf8', // 0-3
    '#f8fafc', '#ffffff', '#f1f5f9', '#e2e8f0', '#cbd5e1', // 4-8
    '#0f172a', '#334155', '#475569', '#ffffff', // 9-12
    '#22c55e', '#dcfce7', '#15803d', // 13-15
    '#eab308', '#fef9c3', '#854d0e', // 16-18
    '#ef4444', '#fee2e2', '#991b1b', // 19-21
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', // 22-26 (Chart Colors)
    '#ffffff', '#000000', // 27: Base(White), 28: Contrast(Black)
    'linear-gradient(to right, #38bdf8, #a855f7, #ec4899)' // 29
];

const LIGHT_CB = [
    '#0077BB', '#005588', '#EEF7FA', '#0077BB', 
    '#ffffff', '#f0f0f0', '#e0e0e0', '#000000', '#444444',
    '#000000', '#444444', '#555555', '#ffffff',
    '#009988', '#E0F2F1', '#004D40',
    '#EE7733', '#FBE9E7', '#BF360C',
    '#CC3311', '#FBE9E7', '#8c230d',
    '#0077BB', '#009988', '#EE7733', '#CC3311', '#33BBEE',
    '#ffffff', '#000000',
    'linear-gradient(to right, #33BBEE, #0077BB, #009988)'
];

// --- 2. MIDNIGHT THEME ---
const MIDNIGHT_NORMAL = [
    '#38bdf8', '#0ea5e9', '#0c4a6e', '#0369a1', 
    '#020617', '#0f172a', '#1e293b', '#1e293b', '#334155',
    '#f8fafc', '#cbd5e1', '#94a3b8', '#000000',
    '#22c55e', '#14532d', '#86efac',
    '#eab308', '#713f12', '#fde047',
    '#ef4444', '#7f1d1d', '#fca5a5',
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
    '#000000', '#ffffff', // 27: Base(Black), 28: Contrast(White)
    'linear-gradient(to right, #38bdf8, #a855f7, #ec4899)'
];

const MIDNIGHT_CB = [
    '#33BBEE', '#0077BB', '#002233', '#33BBEE', 
    '#000000', '#111111', '#222222', '#ffffff', '#dddddd',
    '#ffffff', '#dddddd', '#bbbbbb', '#000000',
    '#009988', '#003322', '#66CCBB',
    '#EE7733', '#441100', '#FF9966',
    '#EE3377', '#440011', '#FF6699',
    '#33BBEE', '#009988', '#EE7733', '#EE3377', '#BBBBBB',
    '#000000', '#ffffff',
    'linear-gradient(to right, #33BBEE, #EE3377)'
];

// --- 3. RED THEME ---
const RED_NORMAL = [
    '#e11d48', '#b91c1c', '#fff1f2', '#f43f5e', 
    '#fff1f2', '#ffffff', '#fff1f2', '#f43f5e', '#e11d48',
    '#be123c', '#e11d48', '#f43f5e', '#ffffff',
    '#f43f5e', '#fff1f2', '#be123c',
    '#e11d48', '#fff1f2', '#b91c1c',
    '#b91c1c', '#fff1f2', '#be123c',
    '#dc2626', '#b91c1c', '#e11d48', '#f43f5e', '#be123c',
    '#e11d48', '#ffffff', // 27: Base(Red), 28: Contrast(White)
    'linear-gradient(135deg, #f43f5e, #e11d48, #dc2626, #b91c1c, #be123c)'
];

const RED_CB = [
    '#e11d48', '#b91c1c', '#fff1f2', '#f43f5e', 
    '#ffffff', '#ffffff', '#f0f0f0', '#000000', '#000000',
    '#000000', '#444444', '#b91c1c', '#ffffff',
    '#f43f5e', '#fff1f2', '#be123c', 
    '#e11d48', '#fff1f2', '#b91c1c', 
    '#b91c1c', '#fff1f2', '#be123c', 
    '#dc2626', '#b91c1c', '#e11d48', '#f43f5e', '#be123c',
    '#e11d48', '#ffffff',
    'linear-gradient(135deg, #f43f5e, #e11d48, #dc2626, #b91c1c, #be123c)'
];

export const THEME_PALETTES = {
  light: { normal: LIGHT_NORMAL, colorblind: LIGHT_CB },
  midnight: { normal: MIDNIGHT_NORMAL, colorblind: MIDNIGHT_CB },
  red: { normal: RED_NORMAL, colorblind: RED_CB }
};

// --- HELPER FUNCTIONS ---

export const getPalette = (theme, isColorblind) => {
  const t = THEME_PALETTES[theme] || THEME_PALETTES.light;
  return isColorblind ? t.colorblind : t.normal;
};

export const getChartColors = (appSettings) => {
  const p = getPalette(appSettings.theme, appSettings.colorblindMode);
  return [p[22], p[23], p[24], p[25], p[26]];
};

// Returns the High Contrast Color for Charts/Lines (Pure Black or Pure White)
// For Red Theme (Light BG), we need Black (or Dark Red) for passing lines to be visible.
// Index 28 is "Contrast" (White for Red theme), which works on Red backgrounds but NOT on the white page.
// We should use index 28 for Midnight, and index 28 (Black) for Light.
// For Red, since 28 is White (for use on Red blocks), we actually need a Dark color for the white page chart.
// We will use Index 9 (TextMain) for Red theme charts, or hardcode to Black for safety on Light BGs.
export const getHighContrastColor = (appSettings) => {
  const p = getPalette(appSettings.theme, appSettings.colorblindMode);
  
  if (appSettings.theme === 'midnight') {
      return p[28]; // White
  }
  // For Light and Red (both have light page backgrounds), return Black/Dark
  return '#000000';
};

export const getTrendLineColor = (trend, appSettings) => {
  const p = getPalette(appSettings.theme, appSettings.colorblindMode);
  if (trend === 'Positive') return p[13]; // Success
  if (trend === 'Negative') return p[19]; // Danger
  return p[10]; // Muted
};

export const getTrendColorClass = (trend) => {
  if (trend === 'Positive') return 'app-text-success';
  if (trend === 'Negative') return 'app-text-danger';
  return 'app-text-muted';
};

export const getAxisColors = () => {
    return {
        axis: 'var(--app-text-muted)',
        grid: 'var(--app-border)',
        line: 'var(--app-text-subtle)',
        label: 'var(--app-text-muted)'
    };
};

export const getTopicColorClasses = (score, appSettings) => {
    if (score < 40) {
        return { 
            ring: 'app-ring-danger', 
            bg: 'app-bg-danger-light', 
            text: 'app-text-danger', 
            score: 'app-text-danger', 
            badge: 'app-bg-danger app-text-on-primary' 
        };
    }
    if (score < 60) {
        return { 
            ring: 'app-ring-warning', 
            bg: 'app-bg-warning-light', 
            text: 'app-text-warning', 
            score: 'app-text-warning', 
            badge: 'app-bg-warning app-text-on-primary' 
        };
    }
    if (score < 80) {
        return { 
            ring: 'app-ring-subtle', 
            bg: 'app-bg-highlight', 
            text: 'app-text-main', 
            score: 'app-text-secondary', 
            badge: 'app-bg-secondary app-text-on-primary' 
        };
    }
    return { 
        ring: 'app-ring-success', 
        bg: 'app-bg-success-light', 
        text: 'app-text-success', 
        score: 'app-text-success', 
        badge: 'app-bg-success app-text-on-primary' 
    };
};

export const getScoreClass = (score) => {
  if (score >= 90) return 'app-text-success';
  if (score >= 80) return 'app-text-primary';
  if (score >= 60) return 'app-text-warning';
  return 'app-text-danger';
};

export const getReviewClass = (reviewCount, totalTopics) => {
  if (reviewCount === 0) return 'app-text-success';
  if (totalTopics > 0 && (reviewCount / totalTopics) <= 0.25) return 'app-text-warning';
  return 'app-text-danger';
};

export const getMasteredClass = (masteredCount, totalTopics) => {
  const pct = totalTopics > 0 ? masteredCount / totalTopics : 0;
  if (pct >= 0.9) return 'app-text-success';
  if (pct >= 0.5) return 'app-text-primary';
  if (pct >= 0.25) return 'app-text-warning';
  return 'app-text-danger';
};