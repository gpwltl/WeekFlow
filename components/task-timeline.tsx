"use client"

import { useMemo } from "react"
import { format, isSameMonth } from "date-fns"
import { ko } from "date-fns/locale"
import type { Task } from "@/types/task"

interface TaskTimelineProps {
  tasks: Task[]
  selectedMonth: Date
}

export function TaskTimeline({ tasks, selectedMonth }: TaskTimelineProps) {
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => isSameMonth(task.deadline, selectedMonth))
  }, [tasks, selectedMonth])

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      const author = task.author
      if (!acc[author]) {
        acc[author] = []
      }
      acc[author].push(task)
      return acc
    }, {} as Record<string, Task[]>)
  }, [filteredTasks])

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-4">
        {format(selectedMonth, "yyyy년 MM월", { locale: ko })}
      </h2>
      {Object.keys(groupedTasks).length === 0 ? (
        <p className="text-center text-gray-500">이 달에는 업무가 없습니다.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedTasks).map(([author, authorTasks]) => (
            <div key={author} className="space-y-2">
              <h3 className="text-lg font-semibold">{author}</h3>
              <div className="relative">
                <div className="absolute left-0 top-0 w-px h-full bg-gray-200" />
                <div className="space-y-4 pl-4">
                  {authorTasks.map((task) => (
                    <div
                      key={task.id}
                      className="relative bg-white p-4 rounded-lg shadow border border-gray-200"
                    >
                      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary" />
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-500">
                        기한: {format(new Date(task.deadline), "yyyy년 MM월 dd일", { locale: ko })}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {task.status === 'completed' ? '완료' : '진행중'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

