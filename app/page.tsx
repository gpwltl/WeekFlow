"use client"

import { useState, useCallback, useMemo, useEffect } from 'react'
import { WeeklyTimeline } from '@/components/weekly-timeline'
import { TaskForm } from '@/components/task-form'
import { DatePicker } from '@/components/ui/date-picker'
import { getWeekDates, formatDateRange } from '@/shared/lib/utils'
import { Task, TaskData } from '@/src/task/domain/entities/Task'
import Link from 'next/link'

export default function WeeklyTimelinePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate])
  const [editingTask, setEditingTask] = useState<Task | null>(null)

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

  // 태스크 수정 완료 처리
  const handleTaskUpdated = async (updatedTask: TaskData & { id: string }) => {
    fetchTasks()
    setEditingTask(null)
  }

  // 태스크 삭제 후 처리
  const handleTaskDeleted = async (taskId: string) => {
    // DELETE 요청은 WeeklyTimeline 컴포넌트에서 처리하고
    // 여기서는 목록 새로고침만 수행
    fetchTasks()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pr-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">주간 일정 타임라인</h1>
            <Link 
              href="/dashboard" 
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              대시보드
            </Link>
          </div>
          <div className="date-selector">
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[40%_60%] gap-8">
          <div className="rounded-lg border bg-white shadow p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingTask ? '일정 수정' : '새 일정 추가'}
            </h2>
            <TaskForm 
              mode={editingTask ? 'edit' : 'create'}
              initialData={editingTask || undefined}
              onTaskAdded={handleTaskAdded}
              onTaskUpdated={handleTaskUpdated}
              onCancel={() => setEditingTask(null)}
            />
          </div>
          <div className="rounded-lg border bg-white shadow">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <WeeklyTimeline 
                tasks={tasks} 
                weekDates={weekDates} 
                onTasksUpdate={handleTasksUpdate}
                onEditTask={setEditingTask}
                onDeleteTask={handleTaskDeleted}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

