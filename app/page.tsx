"use client"

import { useState, useCallback, useMemo, useEffect } from 'react'
import { WeeklyTimeline } from '@/components/weekly-timeline'
import { TaskForm } from '@/components/task-form'
import { DatePicker } from '@/components/ui/date-picker'
import { getWeekDates, formatDateRange } from '@/shared/lib/utils'
import { Task, TaskData } from '@/src/task/entities/Task'

export default function WeeklyTimelinePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate])

  // 태스크 목록 불러오기
  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch tasks')
      }
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 초기 로딩 및 날짜 변경시 데이터 조회
  useEffect(() => {
    fetchTasks()
  }, [selectedDate])

  // 새 태스크가 추가되면 목록 새로고침
  const handleTaskAdded = (newTask: TaskData & { id: string }) => {
    fetchTasks()  // 전체 목록 새로고침
  }

  const handleTasksUpdate = useCallback((updatedTasks: Task[]) => {
    setTasks(updatedTasks)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">주간 일정 타임라인</h1>
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium">
              {formatDateRange(weekDates[0], weekDates[4])}
            </span>
            <DatePicker
              date={selectedDate}
              setDate={(date) => date && setSelectedDate(date)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-lg border bg-white shadow p-6">
            <h2 className="text-2xl font-bold mb-4">새 일정 추가</h2>
            <TaskForm onTaskAdded={handleTaskAdded} />
          </div>
          <div className="rounded-lg border bg-white shadow">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <WeeklyTimeline 
                tasks={tasks} 
                weekDates={weekDates} 
                onTasksUpdate={handleTasksUpdate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

