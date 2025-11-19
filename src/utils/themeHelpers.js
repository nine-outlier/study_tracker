import { config } from '../config/appConfig.js';

// [Critical, Weak, Developing, Strong, Mastered]
// Per spec: Chart fills are static and do not change in dark mode.
export const NORMAL_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2']; 
export const COLORBLIND_SAFE_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2'];

/**
 * Gets the semantic color class for a score (e.g., for Stats Cards).
 */
export const getScoreClass = (score, isColorblind = false) => {
    if (isColorblind) {
        if (score >= 90) return 'text-cb-mastered dark:text-cyan-400';
        if (score >= 80) return 'text-cb-strong dark:text-green-400';
        if (score >= 60) return 'text-cb-developing dark:text-yellow-400';
        if (score >= 40) return 'text-cb-weak dark:text-orange-400';
        return 'text-cb-critical dark:text-red-400';
    }
    // Standard Semantic Colors (with dark mode)
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
        if (reviewCount === 0) return 'text-cb-strong dark:text-green-400';
        if (reviewPct <= 0.25) return 'text-cb-weak dark:text-orange-400';
        return 'text-cb-critical dark:text-red-400';
    }
    // Standard Semantic Colors (Green, Orange, Red)
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
        if (masteredPct >= 0.90) return 'text-cb-mastered dark:text-cyan-400';
        if (masteredPct >= 0.75) return 'text-cb-strong dark:text-green-400';
        if (masteredPct >= 0.50) return 'text-cb-developing dark:text-yellow-400';
        if (masteredPct >= 0.25) return 'text-cb-weak dark:text-orange-400';
        return 'text-cb-critical dark:text-red-400';
    }
    
    // Standard Semantic Colors
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
        if (score < 40) { // Critical
            return { ring: 'ring-cb-critical dark:ring-red-500/30', bg: 'bg-cb-critical-light dark:bg-red-900/50', text: 'text-cb-critical dark:text-red-300', score: 'text-cb-critical dark:text-red-400' };
        }
        if (score < 60) { // Weak
            return { ring: 'ring-cb-weak dark:ring-orange-500/30', bg: 'bg-cb-weak-light dark:bg-orange-900/50', text: 'text-cb-weak dark:text-orange-300', score: 'text-cb-weak dark:text-orange-400' };
        }
        // Developing (60-79)
        return { ring: 'ring-cb-developing dark:ring-yellow-500/30', bg: 'bg-cb-developing-light dark:bg-yellow-900/50', text: 'text-cb-developing dark:text-yellow-300', score: 'text-cb-developing dark:text-yellow-400' };
    }
    
    // Standard Colors (per dark mode spec)
    if (score < 40) { // Critical (Red)
        return { ring: 'ring-red-200 dark:ring-red-500/30', bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300', score: 'text-red-600 dark:text-red-400' };
    }
    if (score < 60) { // Weak (Orange, 40-59)
        return { ring: 'ring-orange-200 dark:ring-orange-500/30', bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-700 dark:text-orange-300', score: 'text-orange-600 dark:text-orange-400' };
    }
    // Developing (Yellow, 60-79)
    return { ring: 'ring-yellow-200 dark:ring-yellow-500/30', bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300', score: 'text-yellow-500 dark:text-yellow-400' };
};