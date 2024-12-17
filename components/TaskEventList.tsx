import { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface TaskEvent {
  id: number;
  task_id: string;
  event_type: string;
  created_at: string;
  description: string;
}

export function TaskEventList({ taskId }: { taskId: string }) {
  const [events, setEvents] = useState<TaskEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}/events`);
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [taskId]);

  if (loading) return <div>이벤트 로딩 중...</div>;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">작업 이벤트 기록</h3>
      {events.length === 0 ? (
        <p className="text-gray-500">기록된 이벤트가 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {events.map((event) => (
            <div
              key={event.id}
              className="p-3 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                    {event.event_type}
                  </span>
                  {event.description && (
                    <p className="mt-1 text-gray-600">{event.description}</p>
                  )}
                </div>
                <time className="text-sm text-gray-500">
                  {format(new Date(event.created_at), 'yyyy-MM-dd HH:mm:ss')}
                </time>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 