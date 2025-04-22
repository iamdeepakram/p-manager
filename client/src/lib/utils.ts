import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDate(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  } else {
    return format(dateObj, 'MMM d, yyyy');
  }
}

export function formatDateDistance(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-500';
    case 'planning':
      return 'bg-blue-500';
    case 'on-hold':
      return 'bg-yellow-500';
    case 'review':
      return 'bg-purple-500';
    case 'delayed':
      return 'bg-red-500';
    case 'completed':
      return 'bg-gray-500';
    default:
      return 'bg-neutral-500';
  }
}

export function getProgressColor(progress: number): string {
  if (progress >= 75) return 'bg-primary';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
