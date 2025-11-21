// [Critical, Weak, Developing, Strong, Mastered]
// Standard: Red, Orange, Yellow, Green, Cyan
export const NORMAL_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2']; 

// Okabe-Ito Palette (Universal Colorblind Safe):
// 1. Vermilion (Critical) - Distinct from Teal
// 2. Orange (Weak)
// 3. Yellow (Developing)
// 4. Bluish Green/Teal (Strong) - Keeps the "Success" vibe without conflict
// 5. Blue (Mastered)
export const COLORBLIND_SAFE_COLORS = ['#D55E00', '#E69F00', '#F0E442', '#009E73', '#0072B2'];

/**
 * Gets the semantic color class for a score (e.g., for Stats Cards).
 */
export const getScoreClass = (score, isColorblind = false) => {
    if (isColorblind) {
        // Okabe-Ito Mapping
        if (score >= 90) return 'text-blue-700 dark:text-blue-400';   // Mastered (Blue)
        if (score >= 80) return 'text-teal-600 dark:text-teal-400';   // Strong (Teal/Bluish Green) - Fixes "jarring" blue
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'; // Developing (Yellow)
        if (score >= 40) return 'text-orange-600 dark:text-orange-500'; // Weak (Orange)
        return 'text-red-600 dark:text-red-500'; // Critical (Vermilion-ish)
    }
    // Standard Semantic Colors (Red/Green)
    if (score >= 90) return 'text-sky-600 dark:text-sky-400';
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-500 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
};

/**
 * Gets the semantic color class for the "Domains for Review" card.
 */
export const getReviewClass = (reviewCount, totalTopics, isColorblind = false) => {
    const reviewPct = totalTopics > 0 ? (reviewCount / totalTopics) : 0;
    if (isColorblind) {
        if (reviewCount === 0) return 'text-teal-600 dark:text-teal-400'; // Good (Teal)
        if (reviewPct <= 0.25) return 'text-orange-600 dark:text-orange-400'; // Warning (Orange)
        return 'text-red-600 dark:text-red-500'; // Critical (Vermilion)
    }
    // Standard
    if (reviewCount === 0) return 'text-green-600 dark:text-green-400';
    if (reviewPct <= 0.25) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
};

/**
 * Gets the semantic color class for the "Mastered Domains" card.
 */
export const getMasteredClass = (masteredCount, totalTopics, isColorblind = false) => {
    const masteredPct = totalTopics > 0 ? (masteredCount / totalTopics) : 0;
    
    if (isColorblind) {
        if (masteredPct >= 0.90) return 'text-blue-700 dark:text-blue-400';
        if (masteredPct >= 0.75) return 'text-teal-600 dark:text-teal-400';
        if (masteredPct >= 0.50) return 'text-yellow-600 dark:text-yellow-400';
        if (masteredPct >= 0.25) return 'text-orange-600 dark:text-orange-500';
        return 'text-red-600 dark:text-red-500';
    }
    
    // Standard
    if (masteredPct >= 0.90) return 'text-sky-600 dark:text-sky-400';
    if (masteredPct >= 0.75) return 'text-cyan-500 dark:text-cyan-400';
    if (masteredPct >= 0.50) return 'text-yellow-500 dark:text-yellow-400';
    if (masteredPct >= 0.25) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
};

/**
 * Gets the correct Tailwind classes for a "Topic for Review" item.
 */
export const getTopicColorClasses = (score, isColorblind = false) => {
    if (isColorblind) {
        if (score < 40) { // Critical (Vermilion/Red)
            return { ring: 'ring-red-300 dark:ring-red-500/30', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-200', score: 'text-red-700 dark:text-red-400' };
        }
        if (score < 60) { // Weak (Orange)
            return { ring: 'ring-orange-300 dark:ring-orange-500/30', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-800 dark:text-orange-200', score: 'text-orange-600 dark:text-orange-400' };
        }
        // Developing (Yellow)
        return { ring: 'ring-yellow-300 dark:ring-yellow-500/30', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-200', score: 'text-yellow-600 dark:text-yellow-400' };
    }
    
    // Standard Colors
    if (score < 40) { // Critical (Red)
        return { ring: 'ring-red-200 dark:ring-red-500/30', bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300', score: 'text-red-600 dark:text-red-400' };
    }
    if (score < 60) { // Weak (Orange)
        return { ring: 'ring-orange-200 dark:ring-orange-500/30', bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-700 dark:text-orange-300', score: 'text-orange-600 dark:text-orange-400' };
    }
    // Developing (Yellow)
    return { ring: 'ring-yellow-200 dark:ring-yellow-500/30', bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300', score: 'text-yellow-500 dark:text-yellow-400' };
};