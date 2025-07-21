import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return 'Not specified'
  if (!min) return `Up to $${max?.toLocaleString()}`
  if (!max) return `From $${min?.toLocaleString()}`
  return `$${min?.toLocaleString()} - $${max?.toLocaleString()}`
}

export function getDaysAgo(date: string | Date) {
  const now = new Date()
  const then = new Date(date)
  const diffTime = Math.abs(now.getTime() - then.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}