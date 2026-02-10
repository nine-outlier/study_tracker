/**
 * QuizVariantEngine.js
 * * This engine handles the "Phase 2" randomization logic:
 * 1. Tier 3: Selecting a specific question phrasing variant.
 * 2. Tier 2: Resolving question-specific variable banks.
 * 3. Tier 1: Resolving global/course-wide terminology substitutions.
 */

// Helper to pick a random item from an array
const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const QuizEngine = {
  /**
   * Main entry point to process a raw question object into a displayable question.
   * @param {Object} question - The raw question object from the course file.
   * @param {Object} globalBank - The course-wide dictionary (Tier 1).
   * @returns {Object} - A fully resolved question object ready for the UI.
   */
  processQuestion: (question, globalBank = {}) => {
    // Clone to avoid mutating the original data
    let processedQ = structuredClone(question);
    
    // Metadata to track what specific version the user saw (for analytics)
    let trackingData = {
      variantId: 'default',
      substitutions: {}
    };

    // --- TIER 3: Complete Question Variants ---
    // If the question has multiple entirely different phrasings (variants)
    if (processedQ.variants && processedQ.variants.length > 0) {
      const selectedVariant = pickRandom(processedQ.variants);
      processedQ.question = selectedVariant.text;
      trackingData.variantId = selectedVariant.id;
      
      // If the variant overrides the answer/explanation, apply that too
      if (selectedVariant.correctAnswer) processedQ.correctAnswer = selectedVariant.correctAnswer;
      if (selectedVariant.explanation) processedQ.explanation = selectedVariant.explanation;
    }

    // --- TIER 2: Question-Specific Bank ---
    // Local variables specific to just this question (e.g. [speed_val] for a math Q)
    if (processedQ.localBank) {
      Object.keys(processedQ.localBank).forEach(key => {
        const token = `[${key}]`;
        if (processedQ.question.includes(token) || (processedQ.explanation && processedQ.explanation.includes(token))) {
          const val = pickRandom(processedQ.localBank[key]);
          
          // Replace in Question Text
          processedQ.question = processedQ.question.replaceAll(token, val);
          
          // Replace in Explanation (if exists)
          if (processedQ.explanation) {
            processedQ.explanation = processedQ.explanation.replaceAll(token, val);
          }

          // Track it
          trackingData.substitutions[key] = val;
        }
      });
    }

    // --- TIER 1: Global Identifier System ---
    // Course-wide terms like [router] -> "Layer 3 Switch", "Next-hop Gateway"
    if (globalBank) {
      Object.keys(globalBank).forEach(key => {
        const token = `[${key}]`;
        // Only attempt replacement if the token actually exists in the string to save perf
        if (processedQ.question.includes(token)) {
          const val = pickRandom(globalBank[key]);
          processedQ.question = processedQ.question.replaceAll(token, val);
          trackingData.substitutions[key] = val;
        }
        
        // Also apply to explanation so it matches
        if (processedQ.explanation && processedQ.explanation.includes(token)) {
           // Note: We might want to use the SAME value we picked for the question, 
           // but for simple synonyms, re-rolling is usually fine or sometimes preferred contextually.
           // For strict consistency, we would check trackingData first.
           const val = trackingData.substitutions[key] || pickRandom(globalBank[key]);
           processedQ.explanation = processedQ.explanation.replaceAll(token, val);
        }
      });
    }

    // Attach the tracking data so the UI can log it later
    processedQ._generatedMeta = trackingData;

    return processedQ;
  }
};