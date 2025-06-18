import {
  calculateBalance,
  calculateSpendingByCategory,
  calculateCategoryPercentages,
  calculateBudgetProgress,
  isDateInBudgetPeriod,
  getBudgetStatus,
  calculateMonthlySummary,
  calculateTrends,
  calculatePercentageChange,
  calculateFinancialMetrics,
  calculateProjections,
  calculateStatistics,
  calculateFinancialHealthScore,
  getFinancialGrade,
  getFinancialRecommendations,
  getDateRange,
  getFiscalPeriods,
  roundCurrency,
  roundNumber,
  calculateGoalProgress,
  calculateCompoundInterest,
  safeExecute
} from '../../controller/utils/index.js';

class CalculationService {
  // Balance calculations using utility functions
  static calculateBalance(transactions = []) {
    return safeExecute(() => {
      return calculateBalance(transactions);
    }, { income: 0, expenses: 0, balance: 0, netWorth: 0 });
  }

  // Calculate spending by category using utility functions
  static calculateSpendingByCategory(transactions = [], type = 'expense') {
    return safeExecute(() => {
      return calculateSpendingByCategory(transactions, type);
    }, []);
  }

  // Calculate category percentages using utility functions
  static calculateCategoryPercentages(categoryData, totalAmount) {
    return safeExecute(() => {
      return calculateCategoryPercentages(categoryData, totalAmount);
    }, categoryData);
  }

  // Budget calculations using utility functions
  static calculateBudgetProgress(budget, transactions = []) {
    return safeExecute(() => {
      return calculateBudgetProgress(budget, transactions);
    }, {
      budgetAmount: 0,
      spent: 0,
      remaining: 0,
      percentage: 0,
      isExceeded: false,
      isNearLimit: false,
      status: 'normal'
    });
  }

  // Check if date is within budget period using utility functions
  static isDateInBudgetPeriod(date, budget) {
    return safeExecute(() => {
      return isDateInBudgetPeriod(date, budget);
    }, false);
  }

  // Get budget status using utility functions
  static getBudgetStatus(percentage, spent, budgetAmount) {
    return safeExecute(() => {
      return getBudgetStatus(percentage, spent, budgetAmount);
    }, 'normal');
  }

  // Calculate monthly summary using utility functions
  static calculateMonthlySummary(transactions = [], year, month) {
    return safeExecute(() => {
      return calculateMonthlySummary(transactions, year, month);
    }, {
      year,
      month,
      balance: { income: 0, expenses: 0, balance: 0 },
      categoryBreakdown: [],
      incomeBreakdown: [],
      dailyAverage: { income: 0, expenses: 0, net: 0 },
      transactionCount: 0
    });
  }

  // Calculate trend analysis using utility functions
  static calculateTrends(transactions = [], periods = 6) {
    return safeExecute(() => {
      return calculateTrends(transactions, periods);
    }, []);
  }

  // Calculate percentage change using utility functions
  static calculatePercentageChange(oldValue, newValue) {
    return safeExecute(() => {
      return calculatePercentageChange(oldValue, newValue);
    }, 0);
  }

  // Financial ratios and metrics using utility functions
  static calculateFinancialMetrics(transactions = [], budgets = []) {
    return safeExecute(() => {
      return calculateFinancialMetrics(transactions, budgets);
    }, {
      savingsRate: 0,
      budgetUtilization: 0,
      expenseRatios: [],
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      averageTransactionSize: 0
    });
  }

  // Projection calculations using utility functions
  static calculateProjections(transactions = [], months = 12) {
    return safeExecute(() => {
      return calculateProjections(transactions, months);
    }, {
      projectedIncome: 0,
      projectedExpenses: 0,
      projectedSavings: 0,
      monthlyAverages: { income: 0, expenses: 0, savings: 0 },
      basedOnMonths: 0
    });
  }

  // Statistical calculations using utility functions
  static calculateStatistics(values = []) {
    return safeExecute(() => {
      return calculateStatistics(values);
    }, {
      mean: 0,
      median: 0,
      mode: 0,
      standardDeviation: 0,
      variance: 0,
      min: 0,
      max: 0,
      sum: 0,
      count: 0
    });
  }

  // Financial health score using utility functions
  static calculateFinancialHealthScore(transactions = [], budgets = []) {
    return safeExecute(() => {
      return calculateFinancialHealthScore(transactions, budgets);
    }, {
      score: 0,
      maxScore: 100,
      percentage: 0,
      grade: 'F',
      factors: {},
      recommendations: []
    });
  }

  // Get financial grade using utility functions
  static getFinancialGrade(score) {
    return safeExecute(() => {
      return getFinancialGrade(score);
    }, 'F');
  }

  // Get financial recommendations using utility functions
  static getFinancialRecommendations(factors, metrics) {
    return safeExecute(() => {
      return getFinancialRecommendations(factors, metrics);
    }, []);
  }

  // Date utilities using utility functions
  static getDateRange(period, referenceDate = new Date()) {
    return safeExecute(() => {
      return getDateRange(period, referenceDate);
    }, { start: referenceDate, end: referenceDate });
  }

  // Get fiscal periods using utility functions
  static getFiscalPeriods(transactions = []) {
    return safeExecute(() => {
      return getFiscalPeriods(transactions);
    }, []);
  }

  // Goal calculations using utility functions
  static calculateGoalProgress(goal, currentAmount) {
    return safeExecute(() => {
      return calculateGoalProgress(goal, currentAmount);
    }, {
      targetAmount: 0,
      currentAmount: 0,
      remaining: 0,
      percentage: 0,
      isCompleted: false,
      status: 'progress'
    });
  }

  // Compound interest calculations using utility functions
  static calculateCompoundInterest(principal, rate, time, compound = 12) {
    return safeExecute(() => {
      return calculateCompoundInterest(principal, rate, time, compound);
    }, {
      principal: 0,
      finalAmount: 0,
      totalInterest: 0,
      rate: 0,
      time: 0,
      compoundFrequency: 12
    });
  }

  // Enhanced business calculations
  static calculateCashFlow(transactions = [], period = 'month') {
    return safeExecute(() => {
      const dateRange = getDateRange(period);
      const periodTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= dateRange.start && date <= dateRange.end;
      });

      const balance = calculateBalance(periodTransactions);
      const dailyTransactions = {};

      // Group transactions by day
      periodTransactions.forEach(t => {
        const dateKey = new Date(t.date).toISOString().split('T')[0];
        if (!dailyTransactions[dateKey]) {
          dailyTransactions[dateKey] = { income: 0, expenses: 0 };
        }
        if (t.type === 'income') {
          dailyTransactions[dateKey].income += parseFloat(t.amount) || 0;
        } else {
          dailyTransactions[dateKey].expenses += parseFloat(t.amount) || 0;
        }
      });

      // Calculate daily cash flow
      const cashFlowData = Object.entries(dailyTransactions).map(([date, amounts]) => ({
        date,
        income: roundCurrency(amounts.income),
        expenses: roundCurrency(amounts.expenses),
        netFlow: roundCurrency(amounts.income - amounts.expenses)
      }));

      return {
        period,
        totalIncome: balance.income,
        totalExpenses: balance.expenses,
        netCashFlow: balance.balance,
        dailyCashFlow: cashFlowData,
        averageDailyIncome: roundCurrency(balance.income / cashFlowData.length),
        averageDailyExpenses: roundCurrency(balance.expenses / cashFlowData.length)
      };
    }, {
      period,
      totalIncome: 0,
      totalExpenses: 0,
      netCashFlow: 0,
      dailyCashFlow: [],
      averageDailyIncome: 0,
      averageDailyExpenses: 0
    });
  }

  // Calculate expense velocity (rate of spending)
  static calculateExpenseVelocity(transactions = [], days = 30) {
    return safeExecute(() => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const recentTransactions = transactions.filter(t => 
        t.type === 'expense' && new Date(t.date) >= cutoffDate
      );

      const totalExpenses = recentTransactions.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
      const dailyVelocity = totalExpenses / days;
      const weeklyVelocity = dailyVelocity * 7;
      const monthlyVelocity = dailyVelocity * 30;

      return {
        period: `${days} days`,
        totalExpenses: roundCurrency(totalExpenses),
        dailyVelocity: roundCurrency(dailyVelocity),
        weeklyVelocity: roundCurrency(weeklyVelocity),
        monthlyVelocity: roundCurrency(monthlyVelocity),
        transactionCount: recentTransactions.length,
        averageTransactionSize: recentTransactions.length > 0 ? 
          roundCurrency(totalExpenses / recentTransactions.length) : 0
      };
    }, {
      period: `${days} days`,
      totalExpenses: 0,
      dailyVelocity: 0,
      weeklyVelocity: 0,
      monthlyVelocity: 0,
      transactionCount: 0,
      averageTransactionSize: 0
    });
  }

  // Calculate category trends over time
  static calculateCategoryTrends(transactions = [], category, periods = 6) {
    return safeExecute(() => {
      const trends = calculateTrends(transactions, periods);
      const categoryTrends = trends.map(trend => {
        const categoryData = trend.categoryBreakdown.find(c => c.category === category);
        return {
          period: trend.periodName,
          amount: categoryData ? categoryData.amount : 0,
          percentage: categoryData ? categoryData.percentage : 0,
          transactionCount: categoryData ? categoryData.count : 0
        };
      });

      // Calculate trend direction
      const amounts = categoryTrends.map(t => t.amount);
      const stats = calculateStatistics(amounts);
      
      let trendDirection = 'stable';
      if (amounts.length >= 2) {
        const firstHalf = amounts.slice(0, Math.floor(amounts.length / 2));
        const secondHalf = amounts.slice(Math.floor(amounts.length / 2));
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg * 1.1) trendDirection = 'increasing';
        else if (secondAvg < firstAvg * 0.9) trendDirection = 'decreasing';
      }

      return {
        category,
        trends: categoryTrends,
        statistics: stats,
        trendDirection,
        volatility: stats.standardDeviation / (stats.mean || 1) // Coefficient of variation
      };
    }, {
      category,
      trends: [],
      statistics: { mean: 0, standardDeviation: 0 },
      trendDirection: 'stable',
      volatility: 0
    });
  }

  // Calculate budget efficiency score
  static calculateBudgetEfficiency(budgets = [], transactions = []) {
    return safeExecute(() => {
      if (budgets.length === 0) return { score: 0, details: [] };

      const budgetEfficiencies = budgets.map(budget => {
        const progress = calculateBudgetProgress(budget, transactions);
        let efficiency = 0;

        // Perfect efficiency is spending exactly the budget amount
        if (progress.percentage <= 100) {
          efficiency = progress.percentage; // 0-100
        } else {
          // Penalty for exceeding budget
          efficiency = Math.max(0, 100 - (progress.percentage - 100));
        }

        return {
          category: budget.category,
          efficiency: roundNumber(efficiency, 1),
          budgetAmount: progress.budgetAmount,
          spent: progress.spent,
          utilization: progress.percentage
        };
      });

      const averageEfficiency = budgetEfficiencies.reduce((sum, b) => sum + b.efficiency, 0) / budgets.length;

      return {
        score: roundNumber(averageEfficiency, 1),
        details: budgetEfficiencies.sort((a, b) => b.efficiency - a.efficiency),
        recommendation: averageEfficiency >= 80 ? 'excellent' : 
                      averageEfficiency >= 60 ? 'good' : 
                      averageEfficiency >= 40 ? 'fair' : 'poor'
      };
    }, { score: 0, details: [], recommendation: 'poor' });
  }

  // Calculate income stability score
  static calculateIncomeStability(transactions = [], months = 6) {
    return safeExecute(() => {
      const incomeTransactions = transactions.filter(t => t.type === 'income');
      const trends = calculateTrends(incomeTransactions, months);
      
      if (trends.length < 2) {
        return { score: 0, trend: 'insufficient_data', monthlyIncomes: [] };
      }

      const monthlyIncomes = trends.map(t => t.balance.income);
      const stats = calculateStatistics(monthlyIncomes);
      
      // Stability score based on coefficient of variation (lower is better)
      const coefficientOfVariation = stats.mean > 0 ? stats.standardDeviation / stats.mean : 1;
      const stabilityScore = Math.max(0, 100 - (coefficientOfVariation * 100));

      // Determine trend
      let trend = 'stable';
      const recentAvg = monthlyIncomes.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
      const earlierAvg = monthlyIncomes.slice(0, 3).reduce((sum, val) => sum + val, 0) / 3;
      
      if (recentAvg > earlierAvg * 1.1) trend = 'increasing';
      else if (recentAvg < earlierAvg * 0.9) trend = 'decreasing';

      return {
        score: roundNumber(stabilityScore, 1),
        trend,
        monthlyIncomes: monthlyIncomes.map(income => roundCurrency(income)),
        averageIncome: roundCurrency(stats.mean),
        incomeVariability: roundCurrency(stats.standardDeviation)
      };
    }, { 
      score: 0, 
      trend: 'insufficient_data', 
      monthlyIncomes: [],
      averageIncome: 0,
      incomeVariability: 0
    });
  }

  // Utility methods - keeping these for backward compatibility
  static roundCurrency(amount, decimals = 2) {
    return roundCurrency(amount, decimals);
  }

  static roundNumber(number, decimals = 2) {
    return roundNumber(number, decimals);
  }

  // Enhanced formatting for financial calculations
  static formatCurrency(amount, currency = 'USD') {
    return safeExecute(() => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(parseFloat(amount) || 0);
    }, `$${(parseFloat(amount) || 0).toFixed(2)}`);
  }

  static formatPercentage(value, decimals = 1) {
    return safeExecute(() => {
      return `${roundNumber(value, decimals)}%`;
    }, '0%');
  }
}

export default CalculationService;
