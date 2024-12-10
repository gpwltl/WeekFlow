import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { startOfWeek, addDays, format, isWeekend, differenceInDays } from 'date-fns'
import { ko } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getWeekDates(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // 1 represents Monday
  return Array.from({ length: 5 }, (_, i) => addDays(start, i)) // Only return Mon-Fri
}

export function formatDate(date: Date): string {
  return format(date, 'MM/dd', { locale: ko })
}

export function formatDateRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, 'yyyy년 M월 d일', { locale: ko })} - ${format(endDate, 'M월 d일', { locale: ko })}`
}

export function formatTaskDateRange(startDate: Date, endDate: Date): string {
  return `${format(startDate, 'MM/dd')} - ${format(endDate, 'MM/dd')}`
}

export function getTimePosition(date: Date, startDate: Date, endDate: Date): number {
  // 시작일로부터의 일수 차이 계산
  const daysDiff = differenceInDays(date, startDate)
  // 전체 기간 계산
  const totalDays = differenceInDays(endDate, startDate) + 1
  
  // 위치를 백분율로 계산
  const position = (daysDiff / totalDays) * 100

  // 0-100 사이의 값으로 제한
  return Math.max(0, Math.min(100, position))
}

