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
import { Task } from '@/lib/data'

interface TaskFormProps {
  onAddTask: (task: Omit<Task, 'id'>) => void
}

export function TaskForm({ onAddTask }: TaskFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [author, setAuthor] = useState('')
  const [status, setStatus] = useState<Task['status']>('pending')
  const [type, setType] = useState<Task['type']>('task')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title && content && startDate && endDate && author) {
      onAddTask({
        title,
        content,
        startDate,
        endDate,
        author,
        status,
        type,
      })
      setTitle('')
      setContent('')
      setStartDate(undefined)
      setEndDate(undefined)
      setAuthor('')
      setStatus('pending')
      setType('task')
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
      <Select value={status} onValueChange={(value: Task['status']) => setStatus(value)}>
        <SelectTrigger>
          <SelectValue placeholder="진행 상황" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">대기중</SelectItem>
          <SelectItem value="in-progress">진행중</SelectItem>
          <SelectItem value="completed">완료</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit">일정 추가</Button>
    </form>
  )
}

