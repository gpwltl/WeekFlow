"use client"

import { Task } from '@/lib/data'
import { format, isSameDay } from 'date-fns'
import { useState, useEffect } from 'react'

interface WeeklyTimelineProps {
  weekDates: Date[]
}

export function WeeklyTimeline({ weekDates }: WeeklyTimelineProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        const startDate = weekDates[0].toISOString()
        const endDate = weekDates[weekDates.length - 1].toISOString()
        
        const response = await fetch(
          `/api/tasks?startDate=${startDate}&endDate=${endDate}`
        )
        
        if (!response.ok) throw new Error('Failed to fetch tasks')
        
        const data = await response.json()
        setTasks(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [weekDates])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  const startDate = weekDates[0]
  const endDate = weekDates[weekDates.length - 1]

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-400' //대기중
      case 'in-progress': return 'bg-blue-400'  //진행중 
      case 'completed': return 'bg-green-400' //완료
      default: return 'bg-gray-400'
    }
  }

  // 주간에 해당하는 태스크만 필터링
  const weekTasks = Array.isArray(tasks) ? tasks.filter(task => {
    const taskStart = new Date(task.start_date)
    const taskEnd = new Date(task.end_date)
    return taskStart <= endDate && taskEnd >= startDate
  }) : [];

  // 태스크를 시작일 기준으로 정렬
  const sortedTasks = weekTasks.sort((a, b) => 
    new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  )

  // 날짜별 칸의 너비 계산 (20%씩)
  const getTaskPosition = (date: Date) => {
    const dayIndex = weekDates.findIndex(d => 
      isSameDay(d, date)
    )
    return dayIndex * 20 // 각 칸이 20%
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

      {/* 타임라인 */}
      <div className="relative">
        {/* 배경 그리드 */}
        <div className="grid grid-cols-5 gap-4">
          {weekDates.map((date) => (
            <div key={date.toISOString()} className="h-full border-l border-gray-200" />
          ))}
        </div>

        {/* 태스크 */}
        <div className="absolute top-0 left-0 w-full">
          <div className="relative min-h-[200px] space-y-2 pt-2">
            {sortedTasks.map((task, index) => {
              const taskStart = new Date(task.start_date)
              const taskEnd = new Date(task.end_date)
              
              const startPos = getTaskPosition(taskStart)
              const endPos = getTaskPosition(taskEnd)
              const width = endPos - startPos + 20 // 마지막 날짜의 칸도 포함

              return (
                <div
                  key={task.id}
                  className={`absolute h-6 ${getStatusColor(task.status)} rounded-md shadow-sm transition-all`}
                  style={{
                    left: `${startPos}%`,
                    width: `${width}%`,
                    top: `${index * 32}px`,
                  }}
                >
                  <div className="px-2 h-full flex items-center whitespace-nowrap overflow-hidden">
                    <span className="text-xs font-medium text-white">{task.title}</span>
                    <span className="text-[10px] text-white/75 ml-1">{task.author}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

