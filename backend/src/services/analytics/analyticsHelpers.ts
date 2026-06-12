import { AnalyticsQuery } from '../../types/analytics';

export function getDateRange(query: AnalyticsQuery): { start_date: string; end_date: string } {
  if (query.start_date && query.end_date) {
    return { start_date: query.start_date, end_date: query.end_date };
  }

  const now = new Date();
  const end_date: string = now.toISOString().split('T')[0] ?? '';
  let start_date: string;

  switch (query.period) {
    case 'week':
      start_date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '';
      break;
    case 'quarter':
      start_date = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString().split('T')[0] ?? '';
      break;
    case 'year':
      start_date = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0] ?? '';
      break;
    case 'month':
    default:
      start_date = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0] ?? '';
      break;
  }

  return { start_date, end_date };
}

export function getTrend(change: number): 'up' | 'down' | 'stable' {
  if (Math.abs(change) < 0.05) return 'stable';
  return change > 0 ? 'up' : 'down';
}

export function computePreviousPeriodDates(
  start_date: string,
  end_date: string
): { previousStartDate: string; previousEndDate: string } {
  const periodLength = new Date(end_date).getTime() - new Date(start_date).getTime();
  const previousEndDate: string = new Date(new Date(start_date).getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '';
  const previousStartDate: string = new Date(new Date(start_date).getTime() - periodLength - 24 * 60 * 60 * 1000).toISOString().split('T')[0] ?? '';
  return { previousStartDate, previousEndDate };
}
