'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const modes = [
  { href: '/tailor', label: '📄 Tailor a JD' },
  { href: '/search', label: '🔍 Search for jobs' },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-700 mr-4 text-sm hidden sm:block">CV Tailor</span>
          {modes.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith(m.href)
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {m.label}
            </Link>
          ))}
        </div>
        <Link
          href="/settings"
          className={cn(
            'p-2 rounded-md transition-colors',
            pathname.startsWith('/settings')
              ? 'bg-indigo-100 text-indigo-700'
              : 'text-gray-500 hover:bg-gray-100'
          )}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}
