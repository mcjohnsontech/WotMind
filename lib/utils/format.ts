import { formatDistanceToNow, format } from 'date-fns';

export function formatCurrency(amount: number, currency: string = 'NGN'): string {
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
  return formatted;
}

export function formatDate(date: string | Date, fmt: string = 'PPp'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, fmt);
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '...' : str;
}

export function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return address.slice(0, 8) + '...' + address.slice(-8);
}
