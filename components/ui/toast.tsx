import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'success', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 rounded-md px-6 py-4 shadow-lg',
        type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
      )}
    >
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
} 