import { IMPORT_LIMITS } from '../types';

export function parseAmount(value: any): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,€£¥]/g, '').trim();
    return parseFloat(cleaned);
  }
  return NaN;
}

export function parseDateWithFormat(dateStr: string, format: string): Date | null {
  try {
    if (format === 'YYYY-MM-DD') {
      const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (match && match[1] && match[2] && match[3]) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      }
    } else if (format === 'MM/DD/YYYY') {
      const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match && match[1] && match[2] && match[3]) {
        return new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
      }
    } else if (format === 'DD/MM/YYYY') {
      const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (match && match[1] && match[2] && match[3]) {
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function parseDate(value: any): Date | null {
  if (!value) return null;
  const dateStr = value.toString().trim();
  for (const format of IMPORT_LIMITS.SUPPORTED_DATE_FORMATS) {
    const parsed = parseDateWithFormat(dateStr, format);
    if (parsed && !isNaN(parsed.getTime())) return parsed;
  }
  const nativeDate = new Date(dateStr);
  return !isNaN(nativeDate.getTime()) ? nativeDate : null;
}

export function calculateEndDate(startDate: Date, period: string): Date {
  const end = new Date(startDate);
  switch (period.toLowerCase()) {
    case 'weekly':
      end.setDate(startDate.getDate() + 6);
      break;
    case 'monthly':
      end.setMonth(startDate.getMonth() + 1);
      end.setDate(end.getDate() - 1);
      break;
    case 'yearly':
      end.setFullYear(startDate.getFullYear() + 1);
      end.setDate(end.getDate() - 1);
      break;
  }
  return end;
}

export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}
