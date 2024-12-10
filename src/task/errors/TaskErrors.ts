export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}

export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Task with id ${id} not found`);
    this.name = 'TaskNotFoundError';
  }
} 