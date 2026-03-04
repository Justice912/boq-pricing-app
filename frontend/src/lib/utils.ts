import type { Currency } from '@/types';
import { CURRENCY_SYMBOLS } from '@/data/constants';

/** Format a number as currency: R 1,234,567.89 */
export function formatCurrency(amount: number, currency: Currency = 'ZAR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = Math.abs(amount).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${symbol} ${formatted}` : `${symbol} ${formatted}`;
}

/** Format a number with thousand separators */
export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString('en-ZA', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a percentage: 10.00% */
export function formatPct(value: number): string {
  return `${(value).toFixed(2)}%`;
}

/** Generate a short date string */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Relative time (e.g., "2 hours ago") */
export function timeAgo(isoString: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(isoString);
}

/** Merge class names (simple concat, no clsx needed) */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/** Compute total rate from breakdown */
export function computeTotalRate(
  materials: number,
  labour: number,
  plant: number,
  subcontract: number,
  overheadsPct: number,
  profitPct: number,
): number {
  const directCost = materials + labour + plant + subcontract;
  const overheads = directCost * (overheadsPct / 100);
  const subtotal = directCost + overheads;
  const profit = subtotal * (profitPct / 100);
  return subtotal + profit;
}
