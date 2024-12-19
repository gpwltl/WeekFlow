"use client"

import { Task } from '@/src/task/domain/entities/Task'
import { format, isSameDay } from 'date-fns'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { TaskForm } from './task-form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface WeeklyTimelineProps {
  tasks: Task[]
  weekDates: Date[]
  onTasksUpdate?: (tasks: Task[]) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  onStatusChange?: (taskId: string, newStatus: Task['status']) => void
}

export const WeeklyTimeline: React.FC<WeeklyTimelineProps> = ({ 
  tasks, 
  weekDates,
  onTasksUpdate,
  onEditTask,
  onDeleteTask,
  onStatusChange
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isSubscribed = true

    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        const startDate = weekDates[0].toISOString()
        const endDate = weekDates[weekDates.length - 1].toISOString()
        
        const response = await fetch(
          `/api/tasks?startDate=${startDate}&endDate=${endDate}`,
          { cache: 'no-store' }
        )
        
        if (!response.ok) throw new Error('Failed to fetch tasks')
        
        const data = await response.json()
        if (isSubscribed) {
          onTasksUpdate?.(data)
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false)
        }
      }
    }

    fetchTasks()

    return () => {
      isSubscribed = false
    }
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

  // 날짜별 칸의 너비 산 (20%씩)
  const getTaskPosition = (date: Date) => {
    const dayIndex = weekDates.findIndex(d => 
      isSameDay(d, date)
    )
    return dayIndex * 20 // 각 칸이 20%
  }

  const handleEditClick = (task: Task) => {
    onEditTask?.(task)
  }

  const handleDeleteClick = async (taskId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      onDeleteTask?.(taskId)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      // 상태 업데이트 후 전체 목록 새로고침
      const startDate = weekDates[0].toISOString()
      const endDate = weekDates[weekDates.length - 1].toISOString()
      const tasksResponse = await fetch(
        `/api/tasks?startDate=${startDate}&endDate=${endDate}`,
        { cache: 'no-store' }
      )
      
      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch updated tasks')
      }
      
      const updatedTasks = await tasksResponse.json()
      onTasksUpdate?.(updatedTasks)
      
    } catch (error) {
      console.error('Error updating status:', error)
      alert('상태 변경에 실패했습니다.')
    }
  }

  return (
    <div className="p-6 pr-12">
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
              const width = endPos - startPos + 20

              return (
                <Popover key={task.id}>
                  <PopoverTrigger asChild>
                    <div
                      className={`absolute h-6 ${getStatusColor(task.status)} rounded-md shadow-sm transition-all 
                        hover:brightness-110 cursor-pointer`}
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
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-80 p-4 bg-gray-100/95 backdrop-blur-sm border shadow-lg" 
                    side="right"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{task.title}</h3>
                          <div className="text-sm text-gray-500">
                            작성자: {task.author}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClick(task)}
                          >
                            수정
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteClick(task.id)}
                          >
                            삭제
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>
                          {format(new Date(task.start_date), 'yyyy년 MM월 dd일')} ~ {format(new Date(task.end_date), 'yyyy년 MM월 dd일')}
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="text-sm font-medium mb-1">업무 내용</div>
                        <p className="text-sm text-gray-600">{task.content}</p>
                      </div>
                      <div className="pt-2">
                        <Select
                          value={task.status}
                          onValueChange={(value: Task['status']) => handleStatusChange(task.id, value)}
                        >
                          <SelectTrigger className="w-[120px] bg-transparent border-none p-0">
                            <SelectValue>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer
                                ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'}`}>
                                {task.status === 'completed' ? '완료' :
                                 task.status === 'in-progress' ? '진행중' : '대기중'}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent 
                            className="min-w-[100px] bg-white rounded-lg shadow-lg border-none"
                            align="start"
                          >
                            <SelectItem 
                              value="pending" 
                              className="hover:bg-yellow-100/50 rounded-md m-1 cursor-pointer"
                            >
                              대기중
                            </SelectItem>
                            <SelectItem 
                              value="in-progress" 
                              className="hover:bg-blue-100/50 rounded-md m-1 cursor-pointer"
                            >
                              진행중
                            </SelectItem>
                            <SelectItem 
                              value="completed" 
                              className="hover:bg-green-100/50 rounded-md m-1 cursor-pointer"
                            >
                              완료
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

