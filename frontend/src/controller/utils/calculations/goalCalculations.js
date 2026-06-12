import { roundCurrency, roundNumber } from './balanceCalculations.js';

export const calculateGoalProgress = (goal, currentAmount) => {
  const target = parseFloat(goal.targetAmount) || 0;
  const current = parseFloat(currentAmount) || 0;
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const remaining = Math.max(0, target - current);

  return {
    targetAmount: roundCurrency(target),
    currentAmount: roundCurrency(current),
    remaining: roundCurrency(remaining),
    percentage: roundNumber(percentage, 1),
    isCompleted: current >= target,
    status: percentage >= 100 ? 'completed' : percentage >= 75 ? 'near' : 'progress'
  };
};

export const calculateCompoundInterest = (principal, rate, time, compound = 12) => {
  const P = parseFloat(principal) || 0;
  const r = parseFloat(rate) / 100;
  const t = parseFloat(time) || 0;
  const n = compound;

  const amount = P * Math.pow(1 + r / n, n * t);
  const interest = amount - P;

  return {
    principal: roundCurrency(P),
    finalAmount: roundCurrency(amount),
    totalInterest: roundCurrency(interest),
    rate: roundNumber(rate, 2),
    time: t,
    compoundFrequency: n
  };
};
