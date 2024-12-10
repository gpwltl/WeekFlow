"use client"

import { useMemo } from 'react'
import { Task } from '@/lib/data'
import { getTimePosition, formatDate } from '@/lib/utils'

interface TimelineProps {
  tasks: Task[]
  weekDates: Date[]
}

export function Timeline({ tasks, weekDates }: TimelineProps) {
  // 주간의 시작일과 종료일
  const startDate = weekDates[0]
  const endDate = weekDates[weekDates.length - 1]

  // 해당 주의 태스크만 필터링
  const weekTasks = useMemo(() => {
    return tasks.filter(task => {
      const taskStart = new Date(task.startDate)
      return taskStart >= startDate && taskStart <= endDate
    })
  }, [tasks, startDate, endDate])

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] p-6">
        {/* 날짜 표시 */}
        <div className="relative h-8 border-b border-gray-200">
          {weekDates.map((date) => (
            <div
              key={date.toISOString()}
              className="absolute text-sm text-gray-500"
              style={{ left: `${getTimePosition(date, startDate, endDate)}%` }}
            >
              {formatDate(date)}
            </div>
          ))}
        </div>

        {/* Timeline content */}
        <div className="relative mt-4 h-[200px]">
          {/* 세로 구분선 */}
          {weekDates.map((date) => (
            <div
              key={date.toISOString()}
              className="absolute h-full w-px bg-gray-100"
              style={{ left: `${getTimePosition(date, startDate, endDate)}%` }}
            />
          ))}

          {/* Tasks */}
          {weekTasks.map((task, index) => {
            const startPosition = getTimePosition(task.startDate, startDate, endDate)
            const endPosition = getTimePosition(task.endDate, startDate, endDate)
            const width = endPosition - startPosition

            return (
              <div
                key={task.id}
                className="absolute flex flex-col"
                style={{
                  left: `${startPosition}%`,
                  width: `${width}%`,
                  top: `${index * 50}px`
                }}
              >
                {/* Connecting line */}
                <div className="absolute -left-2 top-1/2 h-px w-2 bg-gray-300" />
                
                {/* Task block */}
                <div
                  className={`h-10 rounded-lg p-2 text-sm text-white ${
                    task.type === 'meeting' ? 'bg-blue-500' :
                    task.type === 'break' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{task.title}</span>
                    <span className="text-xs">
                      {formatDate(task.startDate)} - {formatDate(task.endDate)}
                    </span>
                  </div>
                  <div className="text-xs opacity-75">{task.author}</div>
                </div>

                {/* Time dot */}
                <div className="absolute -left-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white bg-gray-300" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

