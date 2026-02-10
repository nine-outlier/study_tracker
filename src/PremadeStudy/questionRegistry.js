/**
 * Question Registry
 * * This file acts as the central directory for all quiz content.
 * It maps topic keys (e.g., 'network+', 'culinary') to their respective
 * data files. 
 * * As we expand, import new topic files here and add them to the REGISTRY.
 */

import { NETWORK_PLUS_QUESTIONS } from './NetworkPlus';
// Future imports:
// import { CULINARY_QUESTIONS } from './Culinary';
// import { SECURITY_PLUS_QUESTIONS } from './SecurityPlus';

const REGISTRY = {
  'network+': NETWORK_PLUS_QUESTIONS,
  // 'culinary': CULINARY_QUESTIONS,
  // 'security+': SECURITY_PLUS_QUESTIONS,
};

export const getQuestionsByKey = (key = 'network+') => {
  return REGISTRY[key] || [];
};

export const getAvailableTopics = () => {
  return Object.keys(REGISTRY);
};