// General utility functions

export const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const calculatePercentage = (correct, total) => (total > 0 ? Math.round((correct / total) * 100) : 0);

export const calculateWeightedAverage = (list) => {
  if (list.length === 0) return 0;
  let totalScore = 0;
  let totalWeight = 0;
  list.forEach(item => {
    totalScore += item.score * item.weight;
    totalWeight += item.weight;
  });
  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
};

export const calculateRawAverage = (list) => {
  if (list.length === 0) return 0;
  const totalScore = list.reduce((acc, item) => acc + item.score, 0);
  return Math.round(totalScore / list.length);
};

export const calculateTrendSlope = (scores) => {
  const n = scores.length;
  if (n < 2) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    const x = i + 1; const y = scores[i];
    sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x;
  }
  const numerator = n * sumXY - sumX * sumY;
  const denominator = n * sumX2 - sumX * sumX;
  return denominator === 0 ? 0 : numerator / denominator;
};