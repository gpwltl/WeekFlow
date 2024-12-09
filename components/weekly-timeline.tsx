"use client"

import { useMemo } from 'react'
import { Task } from '@/lib/data'
import { formatDate } from '@/lib/utils'

interface WeeklyTimelineProps {
  tasks: Task[]
  weekDates: Date[]
}

export function WeeklyTimeline({ tasks, weekDates }: WeeklyTimelineProps) {
  const groupedTasks = useMemo(() => {
    return weekDates.map(date => ({
      date,
      tasks: tasks.filter(task => 
        (task.startDate <= date && task.endDate >= date)
      )
    }))
  }, [tasks, weekDates])

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px] p-6">
        <div className="grid grid-cols-5 gap-4"> {/* Changed from grid-cols-7 to grid-cols-5 */}
          {groupedTasks.map(({ date, tasks }) => (
            <div key={date.toISOString()} className="space-y-2">
              <h3 className="text-lg font-semibold">{formatDate(date)}</h3>
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg p-2 text-sm bg-blue-500 text-white"
                  >
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="text-xs truncate">{task.content}</div>
                    <div className="flex justify-between items-end mt-1">
                      <span className="text-xs opacity-75">{task.author}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        task.status === 'completed' ? 'bg-green-700' :
                        task.status === 'in-progress' ? 'bg-yellow-700' : 'bg-red-700'
                      }`}>
                        {task.status === 'completed' ? '완료' : 
                         task.status === 'in-progress' ? '진행중' : '대기중'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

