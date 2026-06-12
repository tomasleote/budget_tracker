import { TransactionSummary } from '../../types/transaction';

export function computeTransactionSummary(
  transactions: Array<{ type: string; amount: number | string; date: string }>,
  startDate?: string,
  endDate?: string
): TransactionSummary {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const netAmount = totalIncome - totalExpenses;
  const averageTransaction = transactions.length > 0
    ? (totalIncome + totalExpenses) / transactions.length
    : 0;

  const dates = transactions.map(t => t.date).sort();
  const today = new Date().toISOString().split('T')[0] ?? '';
  const dateRange = {
    start: dates[0] ?? (startDate ?? today),
    end: dates[dates.length - 1] ?? (endDate ?? today)
  };

  return {
    total_transactions: transactions.length,
    total_income: Number(totalIncome.toFixed(2)),
    total_expenses: Number(totalExpenses.toFixed(2)),
    net_amount: Number(netAmount.toFixed(2)),
    average_transaction: Number(averageTransaction.toFixed(2)),
    date_range: dateRange
  };
}

export function isFutureDateExceeded(dateValue: string | Date): boolean {
  const transactionDate = new Date(dateValue);
  const maxFutureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return transactionDate > maxFutureDate;
}

export function roundAmount(amount: number): number {
  return Number(amount.toFixed(2));
}
