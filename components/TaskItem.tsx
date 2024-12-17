import { Task } from '@/src/task/entities/Task';
import { useTaskEvents } from '../hooks/useTaskEvents';
import { TaskEventList } from './TaskEventList';
import { useState } from 'react';

export function TaskItem({ task }: { task: Task }) {
  const { handleInterruption, handleResume, isLoading } = useTaskEvents(task.id);
  const [showEvents, setShowEvents] = useState(false);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="text-gray-600">{task.content}</p>
        </div>
        <div className="space-x-2">
          {task.status === 'in-progress' && (
            <button
              onClick={() => handleInterruption('사용자 요청으로 중단')}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
              disabled={isLoading}
            >
              작업 중단
            </button>
          )}
          {task.status === 'pending' && (
            <button
              onClick={handleResume}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={isLoading}
            >
              작업 재개
            </button>
          )}
          <button
            onClick={() => setShowEvents(!showEvents)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            {showEvents ? '이벤트 숨기기' : '이벤트 보기'}
          </button>
        </div>
      </div>
      
      {showEvents && <TaskEventList taskId={task.id} />}
    </div>
  );
} 