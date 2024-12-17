import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-4 mb-6">
      <Link 
        href="/" 
        className={`${pathname === '/' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-700`}
      >
        홈
      </Link>
      <Link 
        href="/dashboard" 
        className={`${pathname === '/dashboard' ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-700`}
      >
        대시보드
      </Link>
    </nav>
  );
} 