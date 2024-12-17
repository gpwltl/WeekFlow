import { useState } from 'react';

export function useTaskEvents(taskId: string) {
  const [isLoading, setIsLoading] = useState(false);

  const recordEvent = async (eventType: string, description?: string) => {
    try {
      await fetch(`/api/tasks/${taskId}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventType,
          description
        })
      });
    } catch (error) {
      console.error('Failed to record event:', error);
    }
  };

  const handleInterruption = async (reason: string) => {
    await recordEvent('INTERRUPTED', reason);
  };

  const handleResume = async () => {
    await recordEvent('RESUMED', 'Task resumed');
  };

  return {
    isLoading,
    recordEvent,
    handleInterruption,
    handleResume
  };
} 