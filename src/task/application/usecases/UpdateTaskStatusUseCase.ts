import { Task, TaskStatus } from "../../domain/entities/Task";
import { TaskNotFoundError } from "../../errors/TaskErrors";
import { TaskReader } from "../../repositories/TaskReader";
import { TaskWriter } from "../../repositories/TaskWriter";
import { SQLiteTaskRepository } from "../../repositories/SQLiteTaskRepository";
import { TaskEventPublisher } from "../../infrastructure/events/TaskEventPublisher";

export class UpdateTaskStatusUseCase {
  constructor(
    private taskReader: TaskReader, 
    private taskWriter: TaskWriter,
    private taskEventPublisher: TaskEventPublisher
  ) {}

  async execute(taskId: string, newStatus: TaskStatus): Promise<Task> {
    const task = await this.taskReader.findById(taskId);
    if (!task) throw new TaskNotFoundError(taskId);

    let updatedTask = task.updateStatus(newStatus);
    
    if (newStatus === 'in-progress') {
      const estimatedDuration = await (this.taskWriter as SQLiteTaskRepository)
        .calculateEstimatedDuration(task.title);
      updatedTask = updatedTask.setEstimatedDuration(estimatedDuration);
    }
    
    await this.taskWriter.update(taskId, updatedTask);
    
    await this.taskEventPublisher.publish({
      type: 'TASK_STATUS_UPDATED',
      taskId,
      description: `Task status updated from ${task.status} to ${newStatus}`
    });
    
    return updatedTask;
  }
}
