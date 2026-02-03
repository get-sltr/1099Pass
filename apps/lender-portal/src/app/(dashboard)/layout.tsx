'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Route } from 'next';

const navItems: Array<{ href: Route; label: string; icon: string }> = [
  { href: '/' as Route, label: 'Dashboard', icon: 'D' },
  { href: '/reports' as Route, label: 'Reports', icon: 'R' },
  { href: '/criteria' as Route, label: 'Criteria', icon: 'C' },
  { href: '/messaging' as Route, label: 'Messages', icon: 'M' },
  { href: '/analytics' as Route, label: 'Analytics', icon: 'A' },
  { href: '/settings' as Route, label: 'Settings', icon: 'S' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-primary text-white">
        <div className="p-6">
          <h1 className="text-xl font-bold">1099Pass</h1>
          <p className="text-sm text-gray-300">Lender Portal</p>
        </div>
        <nav className="mt-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-6 py-3 hover:bg-white/10 transition ${
                pathname === item.href ? 'bg-white/10 border-r-4 border-accent' : ''
              }`}
            >
              <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mr-3">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1">
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <span className="sr-only">Notifications</span>
              🔔
            </button>
            <div className="w-8 h-8 bg-primary rounded-full" />
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
