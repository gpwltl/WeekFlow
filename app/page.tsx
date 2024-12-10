"use client"

import { useState, useCallback, useMemo } from 'react'
import { WeeklyTimeline } from '@/components/weekly-timeline'
import { TaskForm } from '@/components/task-form'
import { DatePicker } from '@/components/ui/date-picker'
import { getWeekDates, formatDateRange } from '@/shared/lib/utils'
import { v4 as uuidv4 } from 'uuid'
import { Task } from '@/src/task/entities/Task'

export default function WeeklyTimelinePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate])

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const taskWithId = { ...newTask, id: uuidv4() }
    setTasks(prevTasks => [...prevTasks, taskWithId])
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
            <TaskForm onAddTask={handleAddTask} />
          </div>
          <div className="rounded-lg border bg-white shadow">
            <WeeklyTimeline 
              tasks={tasks} 
              weekDates={weekDates} 
              onTasksUpdate={handleTasksUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

