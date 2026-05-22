export const calculateGrade = (g) => {
  const scores = [g.oralScore, g.fifteenMinuteScore, g.onePeriodScore, g.midtermScore, g.finalScore].map(Number);
  const weights = [1, 1, 2, 2, 3];
  const total = scores.reduce((sum, score, i) => sum + (Number.isFinite(score) ? score * weights[i] : 0), 0);
  const weight = scores.reduce((sum, score, i) => sum + (Number.isFinite(score) ? weights[i] : 0), 0);
  return weight ? (total / weight).toFixed(2) : "0.00";
};
