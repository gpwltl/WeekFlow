import { Task, TaskStatus } from "../../domain/entities/Task";
import { Result } from '@/shared/core/Result';
import { TaskStatusChangedEvent, TaskCompletedEvent } from '../../domain/events/TaskEvents';
import { IEventBus } from '../ports/IEventBus';
import { SQLiteTaskRepository } from '../../repositories/SQLiteTaskRepository';

export class UpdateTaskStatusUseCase {
  constructor(
    private taskRepository: SQLiteTaskRepository,
    private eventBus: IEventBus
  ) {}

  async execute(taskId: string, newStatus: TaskStatus): Promise<Result<Task>> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      return Result.fail(`Task not found: ${taskId}`);
    }

    const oldStatus = task.status;
    const updatedTask = task.updateStatus(newStatus);

    const statusChangedResult = await this.eventBus.publish(
      new TaskStatusChangedEvent(taskId, oldStatus, newStatus)
    );

    if (!statusChangedResult.isSuccess) {
      return Result.fail(statusChangedResult.error || 'Unknown error');
    }

    if (newStatus === 'completed') {
      const completedResult = await this.eventBus.publish(
        new TaskCompletedEvent(
          taskId,
          new Date(),
          updatedTask.actual_duration || 0
        )
      );

      if (!completedResult.isSuccess) {
        return Result.fail(completedResult.error || 'Unknown error');
      }
    }

    return Result.ok(updatedTask);
  }
}
