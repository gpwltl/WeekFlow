"use client"

import { Task } from '@/lib/data'
import { format, isSameDay } from 'date-fns'

interface WeeklyTimelineProps {
  tasks: Task[]
  weekDates: Date[]
}

export function WeeklyTimeline({ tasks, weekDates }: WeeklyTimelineProps) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-400'
      case 'in-progress': return 'bg-blue-400'
      case 'completed': return 'bg-green-400'
      default: return 'bg-gray-400'
    }
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      isSameDay(new Date(task.startDate), date) || 
      isSameDay(new Date(task.endDate), date)
    )
  }

  return (
    <div className="p-6">
      {/* 요일 헤더 */}
      <div className="grid grid-cols-5 gap-4 mb-4">
        {weekDates.map((date) => (
          <div key={date.toISOString()} className="text-center">
            <div className="font-medium">{format(date, 'EEE')}</div>
            <div className="text-sm text-gray-500">{format(date, 'MM/dd')}</div>
          </div>
        ))}
      </div>

      {/* 타임라인 그리드 */}
      <div className="grid grid-cols-5 gap-4">
        {weekDates.map((date) => (
          <div key={date.toISOString()} className="min-h-[200px] border-l border-gray-200 p-2">
            {getTasksForDate(date).map((task) => (
              <div
                key={task.id}
                className={`${getStatusColor(task.status)} rounded-md p-2 mb-2 text-sm shadow-sm`}
              >
                <div className="font-medium truncate">{task.title}</div>
                <div className="text-xs mt-1">
                  <div>{task.author}</div>
                  <div>{format(new Date(task.startDate), 'HH:mm')} - {format(new Date(task.endDate), 'HH:mm')}</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

