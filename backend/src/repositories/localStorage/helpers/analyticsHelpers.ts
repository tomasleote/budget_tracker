export function generateRecommendations(
  savingsRate: number,
  avgExpense: number,
  avgIncome: number
): string[] {
  const recommendations: string[] = [];

  if (savingsRate < 10) {
    recommendations.push('Consider increasing your savings rate to at least 10% of income');
  }
  if (savingsRate < 5) {
    recommendations.push('Review your expenses to identify areas where you can cut back');
  }
  if (avgExpense > avgIncome * 0.8) {
    recommendations.push('Your expenses are high relative to income - consider creating a budget');
  }
  if (avgIncome === 0) {
    recommendations.push('Track your income sources to get better financial insights');
  }

  if (recommendations.length === 0) {
    recommendations.push('Great job! Keep maintaining your healthy financial habits');
  }

  return recommendations;
}
