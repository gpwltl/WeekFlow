import { useState } from 'react';

export function useFeedback() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFeedback = async (taskId: string, taskName: string, status: 'in-progress' | 'completed') => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, taskName, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate feedback');
      }

      const feedback = await response.json();
      return feedback;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateFeedback, isLoading, error };
} 