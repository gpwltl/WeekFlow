"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TaskData } from '@/src/task/entities/Task'

interface TaskFormProps {
  onTaskAdded?: (task: TaskData & { id: string }) => void  // 선택적 콜백
}

export function TaskForm({ onTaskAdded }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [author, setAuthor] = useState('')
  const [status, setStatus] = useState<TaskData['status']>('pending')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (title && content && startDate && endDate && author) {
      try {
        setIsSubmitting(true)
        
        const taskData: TaskData = {
          title,
          content,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(), 
          author,
          status,
        }

        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to create task')
        }

        const newTask = await response.json()
        
        // 폼 초기화
        setTitle('')
        setContent('')
        setStartDate(undefined)
        setEndDate(undefined)
        setAuthor('')
        setStatus('pending')

        // 부모 컴포넌트에 새로운 태스크 알림
        onTaskAdded?.(newTask)

      } catch (error) {
        console.error('Failed to create task:', error)
        // TODO: 에러 처리 (예: 토스트 메시지)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        placeholder="업무 타이틀"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="업무 내용"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <div className="flex space-x-4">
        <div className="w-1/2">
          <DatePicker
            date={startDate}
            setDate={setStartDate}
          />
        </div>
        <div className="w-1/2">
          <DatePicker
            date={endDate}
            setDate={setEndDate}
          />
        </div>
      </div>
      <Input
        placeholder="작성자"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
      />
      <Select value={status} onValueChange={(value: TaskData['status']) => setStatus(value)}>
        <SelectTrigger>
          <SelectValue placeholder="진행 상황" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">대기중</SelectItem>
          <SelectItem value="in-progress">진행중</SelectItem>
          <SelectItem value="completed">완료</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '추가 중...' : '일정 추가'}
      </Button>
    </form>
  )
}

