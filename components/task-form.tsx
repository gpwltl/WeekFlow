"use client"

import { useState, useEffect } from 'react'
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
import { TaskData } from '@/src/task/domain/entities/Task'

interface TaskFormProps {
  mode?: 'create' | 'edit'
  initialData?: TaskData & { id: string }
  onTaskAdded?: (task: TaskData & { id: string }) => void
  onTaskUpdated?: (task: TaskData & { id: string }) => void
  onCancel?: () => void
}

export function TaskForm({ 
  mode = 'create', 
  initialData,
  onTaskAdded,
  onTaskUpdated,
  onCancel 
}: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [author, setAuthor] = useState('')
  const [status, setStatus] = useState<TaskData['status']>('pending')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 폼 초기화 함수
  const resetForm = () => {
    setTitle('')
    setContent('')
    setStartDate(undefined)
    setEndDate(undefined)
    setAuthor('')
    setStatus('pending')
  }

  // mode나 initialData가 변경될 때마다 실행
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // 수정 모드일 때는 초기 데이터로 설정
      setTitle(initialData.title)
      setContent(initialData.content)
      setStartDate(new Date(initialData.start_date))
      setEndDate(new Date(initialData.end_date))
      setAuthor(initialData.author)
      setStatus(initialData.status)
    } else if (mode === 'create') {
      // 생성 모드로 전환될 때는 폼 초기화
      resetForm()
    }
  }, [mode, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return;  // 중복 제출 방지
    
    if (title && content && startDate && endDate && author) {
      try {
        setIsSubmitting(true)
        
        // ID 존재 여부 확인
        if (mode === 'edit' && !initialData?.id) {
          throw new Error('Task ID is missing');
        }
        
        const taskData: TaskData = {
          title,
          content,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(), 
          author,
          status,
        }

        const url = mode === 'edit' && initialData 
          ? `/api/tasks/${initialData.id}`
          : '/api/tasks'

        const response = await fetch(url, {
          method: mode === 'edit' ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || '일정 추리에 실패했습니다.')
        }

        // 콜백 호출
        if (mode === 'edit') {
          onTaskUpdated?.(result)
        } else {
          onTaskAdded?.(result)
          resetForm()  // 생성 모드에서만 폼 초기화
        }

      } catch (error) {
        console.error('Failed to process task:', error)
        if (error instanceof Error) {
          alert(error.message)
        }
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // 취소 핸들러
  const handleCancel = () => {
    resetForm()  // 폼 초기화
    onCancel?.()  // 부모 컴포���트에 취소 알림
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
      <div className="flex justify-end space-x-2">
        <Button 
          type="submit" 
          className="w-20"
          disabled={isSubmitting}
        >
          {isSubmitting ? '처리중' : mode === 'edit' ? '수정' : '추가'}
        </Button>
        {mode === 'edit' && (
          <Button 
            type="button" 
            variant="outline" 
            className="w-20"
            onClick={handleCancel}
          >
            취소
          </Button>
        )}
      </div>
    </form>
  )
}

