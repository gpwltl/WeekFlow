import { Task } from '@/src/task/entities/Task';
import { useTaskEvents } from '../hooks/useTaskEvents';

export function TaskItem({ task }: { task: Task }) {
  const { handleInterruption, handleResume } = useTaskEvents(task.id);

  return (
    <div>
      {/* 기존 작업 표시 UI */}
      
      {/* 작업 중단 버튼 */}
      <button
        onClick={() => handleInterruption('사용자 요청으로 중단')}
        className="btn btn-warning"
      >
        작업 중단
      </button>

      {/* 작업 재개 버튼 */}
      <button
        onClick={handleResume}
        className="btn btn-primary"
      >
        작업 재개
      </button>
    </div>
  );
} 