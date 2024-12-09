"use client"

import { useMemo } from 'react'
import { Task } from '@/lib/data'
import { getTimePosition, formatTime } from '@/lib/utils'

interface TimelineProps {
  tasks: Task[]
  date: Date
}

export function Timeline({ tasks, date }: TimelineProps) {
  const startHour = 8
  const endHour = 18
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  const dayTasks = useMemo(() => {
    return tasks.filter(task => 
      task.startTime.getDate() === date.getDate() &&
      task.startTime.getMonth() === date.getMonth() &&
      task.startTime.getFullYear() === date.getFullYear()
    )
  }, [tasks, date])

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] p-6">
        {/* Time markers */}
        <div className="relative h-8 border-b border-gray-200">
          {hours.map(hour => (
            <div
              key={hour}
              className="absolute text-sm text-gray-500"
              style={{ left: `${getTimePosition(new Date(2024, 0, 1, hour), startHour, endHour)}%` }}
            >
              {`${hour}:00`}
            </div>
          ))}
        </div>

        {/* Timeline content */}
        <div className="relative mt-4 h-[200px]">
          {/* Background grid */}
          {hours.map(hour => (
            <div
              key={hour}
              className="absolute h-full w-px bg-gray-100"
              style={{ left: `${getTimePosition(new Date(2024, 0, 1, hour), startHour, endHour)}%` }}
            />
          ))}

          {/* Tasks */}
          {dayTasks.map((task, index) => {
            const startPosition = getTimePosition(task.startTime, startHour, endHour)
            const endPosition = getTimePosition(task.endTime, startHour, endHour)
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
                      {formatTime(task.startTime)} - {formatTime(task.endTime)}
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

