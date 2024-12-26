import { TaskStatus } from "@/src/task/domain/entities/Task"
import { Task } from "@/src/task/domain/entities/Task"

export class TaskMapper {
  static toDomain(raw: any): Task {
    return Task.create({
      id: raw.id,
      title: raw.title,
      content: raw.content ?? '',
      start_date: raw.start_date,
      end_date: raw.end_date,
      author: raw.author,
      status: raw.status as TaskStatus,
      started_at: raw.started_at,
      completed_at: raw.completed_at,
      estimated_duration: raw.estimated_duration,
      actual_duration: raw.actual_duration,
      interruption_count: raw.interruption_count ?? 0
    })
  }

  static toPersistence(task: Task): any {
    return {
      id: task.id,
      title: task.title,
      content: task.content,
      start_date: task.start_date,
      end_date: task.end_date,
      author: task.author,
      status: task.status,
      started_at: task.started_at,
      completed_at: task.completed_at,
      estimated_duration: task.estimated_duration,
      actual_duration: task.actual_duration,
      interruption_count: task.interruption_count
    }
  }
} 