import { useMemo } from 'react';
import { formatCurrency } from '../../../controller/utils/formatters';

/**
 * Derives filtered transactions/summary/categoryBreakdown from raw hook data
 * based on the selected dateRange string.
 */
export function useReportsData({ dateRange, transactions, getTransactionsByDateRange, summary, categoryBreakdown }) {
  return useMemo(() => {
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'last3Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        endDate = now;
        break;
      case 'last6Months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        endDate = now;
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      default:
        return { transactions, summary, categoryBreakdown };
    }

    const filteredTransactions = getTransactionsByDateRange(startDate, endDate);

    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const filteredSummary = {
      income,
      expenses,
      balance: income - expenses,
      formattedIncome: formatCurrency(income),
      formattedExpenses: formatCurrency(expenses),
      formattedBalance: formatCurrency(income - expenses),
      isPositiveBalance: (income - expenses) >= 0
    };

    const filteredCategoryBreakdown = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Other';
        const existing = acc.find(item => item.category === category);
        if (existing) {
          existing.amount += transaction.amount;
          existing.count += 1;
        } else {
          acc.push({
            category,
            amount: transaction.amount,
            count: 1,
            formattedAmount: formatCurrency(transaction.amount)
          });
        }
        return acc;
      }, [])
      .sort((a, b) => b.amount - a.amount);

    return {
      transactions: filteredTransactions,
      summary: filteredSummary,
      categoryBreakdown: filteredCategoryBreakdown
    };
  }, [dateRange, transactions, getTransactionsByDateRange]);
}
