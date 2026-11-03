'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { StorefrontLayout } from '@/components/storefront/StorefrontLayout';
import { StoreProvider } from '@/store/useStore';
import { RouteScrollToTop } from '@/components/common/RouteScrollToTop';
import { cn } from '@/lib/utils';

const ADMIN_ROUTES = [
  '/dashboard',
  '/pos',
  '/inventory',
  '/products',
  '/orders',
  '/delivery',
  '/customers',
  '/suppliers',
  '/purchases',
  '/stock-alerts',
  '/stock-reports',
  '/analytics',
  '/settings',
  '/my-sales',
];

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
  const isFullWidth = pathname === '/pos';

  return (
    <StoreProvider>
      <RouteScrollToTop />
      {isAdminRoute ? (
        // Admin & Staff ERP Experience
        <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
          {/* Left Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Right Content Area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            <Topbar onMenuClick={() => setSidebarOpen(true)} />
            <main
              className={cn(
                'flex-1',
                isFullWidth
                  ? 'overflow-hidden p-2 sm:p-3 lg:p-4 h-[calc(100dvh-4rem)] max-h-[calc(100dvh-4rem)]'
                  : 'overflow-y-auto p-4 sm:p-6 lg:p-8'
              )}
            >
              <div
                className={cn(
                  'mx-auto',
                  isFullWidth ? 'max-w-[1750px] w-full h-full' : 'max-w-7xl'
                )}
              >
                {children}
              </div>
            </main>
          </div>
        </div>
      ) : isAuthRoute ? (
        // Clean Auth Container (Role Selection, Signup, Forgot Password)
        <main className="min-h-screen bg-slate-50">{children}</main>
      ) : (
        // Public Customer E-Commerce Storefront
        <StorefrontLayout>{children}</StorefrontLayout>
      )}
    </StoreProvider>
  );
};
