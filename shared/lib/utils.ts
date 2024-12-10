import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { startOfWeek, addDays, format } from 'date-fns'
import { ko } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWeekDates(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 5 }, (_, i) => addDays(start, i))
}

export function formatDate(date: Date): string {
  return format(date, 'MM/dd', { locale: ko })
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, 'yyyy년 M월 d일', { locale: ko })} - ${format(endDate, 'M월 d일', { locale: ko })}`
}

