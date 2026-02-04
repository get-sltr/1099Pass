'use client';

import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAuthStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();
  const { sidebarCollapsed } = useUIStore();

  // Check auth on mount
  useEffect(() => {
    // For development, auto-login
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev && !isAuthenticated) {
      // Auto-set mock user for development
      useAuthStore.setState({
        user: {
          id: 'dev-user',
          email: 'demo@quickmortgage.com',
          firstName: 'John',
          lastName: 'Smith',
          role: 'loan_officer',
          institutionId: 'inst-123',
          institutionName: 'Quick Mortgage Co.',
        },
        token: 'dev-token',
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, setLoading]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useUIStore.getState().setCommandMenuOpen(true);
      }
      // Cmd+/ for sidebar toggle
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        useUIStore.getState().toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div
        className={cn(
          'flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'ml-sidebar-collapsed' : 'ml-sidebar'
        )}
      >
        <Header />
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-content">{children}</div>
        </main>
      </div>
    </div>
  );
}
