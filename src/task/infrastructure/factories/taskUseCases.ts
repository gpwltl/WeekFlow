import { SQLiteEventStore } from '../persistence/SQLiteEventStore';
import { EventBus } from '../events/EventBus';
import { EventPublisher } from '../events/EventPublisher';
import { UpdateTaskStatusUseCase } from '../../application/usecases/UpdateTaskStatusUseCase';
import { TaskReadRepository } from '../persistence/TaskReadRepository';
import { TaskWriteRepository } from '../persistence/TaskWriteRepository';
import { DeleteTaskUseCase } from '../../application/usecases/DeleteTaskUseCase';
import { UpdateTaskUseCase } from '../../application/usecases/UpdateTaskUseCase';
import { GetWeeklyTasksUseCase } from '../../application/usecases/GetWeeklyTasksUseCase';
import { CreateTaskUseCase } from '../../application/usecases/CreateTaskUseCase';
import { db } from '@/shared/db';


export async function TaskUseCases() {
  const eventStore = new SQLiteEventStore(db);
  const eventBus = new EventBus(eventStore);
  const eventPublisher = new EventPublisher(eventBus);
  const taskReadRepository = new TaskReadRepository();
  const taskWriteRepository = new TaskWriteRepository(eventStore, eventPublisher);

  return {
    getWeeklyTasksUseCase: new GetWeeklyTasksUseCase(taskReadRepository),
    createTaskUseCase: new CreateTaskUseCase(taskWriteRepository),
    updateTaskUseCase: new UpdateTaskUseCase(taskReadRepository, taskWriteRepository),
    deleteTaskUseCase: new DeleteTaskUseCase(taskReadRepository, taskWriteRepository),
    updateTaskStatusUseCase: new UpdateTaskStatusUseCase(taskReadRepository, taskWriteRepository),
  };
} 