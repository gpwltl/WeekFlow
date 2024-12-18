import { Task } from '@/src/task/domain/entities/Task';
import { useTaskEvents } from '../hooks/useTaskEvents';
import { TaskEventList } from './TaskEventList';
import { useState } from 'react';

export function TaskItem({ task }: { task: Task }) {
  const { handleInterruption, handleResume, isLoading } = useTaskEvents(task.id);
  const [showEvents, setShowEvents] = useState(false);
  const [status, setStatus] = useState(task.status);

  const handleStatusChange = async (newStatus: 'pending' | 'in-progress' | 'completed') => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setStatus(newStatus);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{task.title}</h3>
          <p className="text-gray-600">{task.content}</p>
        </div>
        <div className="space-x-2">
          {status === 'pending' && (
            <button
              onClick={() => handleStatusChange('in-progress')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              시작하기
            </button>
          )}
          
          {status === 'in-progress' && (
            <button
              onClick={() => handleInterruption('사용자 요청으로 중단')}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              disabled={isLoading}
            >
              작업 중단
            </button>
          )}
          
          {status === 'in-progress' && (
            <button
              onClick={() => handleStatusChange('completed')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={isLoading}
            >
              완료
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
      
      <div className="mb-4">
        <span className={`inline-block px-2 py-1 text-sm rounded ${
          status === 'completed' ? 'bg-green-100 text-green-800' :
          status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {status === 'completed' ? '완료됨' :
           status === 'in-progress' ? '진행중' : '대기중'}
        </span>
      </div>
      
      {showEvents && <TaskEventList taskId={task.id} />}
    </div>
  );
} 