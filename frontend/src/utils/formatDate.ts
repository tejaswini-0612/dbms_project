import { format, formatDistanceToNow } from 'date-fns'

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy')
}

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'dd MMM yyyy, hh:mm a')
}

export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}
