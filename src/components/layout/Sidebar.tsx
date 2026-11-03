'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  ReceiptText,
  Boxes,
  AlertTriangle,
  FileBarChart,
  Truck,
  Building2,
  Users,
  Bike,
  TrendingUp,
  Settings,
  PackageCheck,
  Banknote,
  LogOut,
  Repeat,
  Store,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';
import brandLogo from '@/data/logo.png';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, login, logout, getLowStockProducts, getOutOfStockProducts, settings } =
    useStore();

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key press
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const lowStockCount = getLowStockProducts().length + getOutOfStockProducts().length;

  const isAdmin = currentUser?.role === 'admin';

  const adminNavItems: NavItem[] = [
    { name: 'Admin Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      name: 'POS Terminal',
      href: '/pos',
      icon: ShoppingCart,
      badge: 'ACTIVE POS',
      badgeColor: 'bg-emerald-500 text-white animate-pulse',
    },
    { name: 'Orders & Dispatch', href: '/orders', icon: ReceiptText },
    { name: 'Products', href: '/products', icon: PackageCheck },
    { name: 'Inventory Valuation', href: '/inventory', icon: Boxes },
    {
      name: 'Low-Stock Alerts',
      href: '/stock-alerts',
      icon: AlertTriangle,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-amber-500 text-white font-bold',
    },
    { name: 'Stock Reports', href: '/stock-reports', icon: FileBarChart },
    { name: 'Storefront & GST', href: '/settings', icon: Settings },
    { name: 'Suppliers', href: '/suppliers', icon: Building2 },
    { name: 'Purchases', href: '/purchases', icon: Truck },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Delivery', href: '/delivery', icon: Bike },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  ];

  const cashierNavItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    {
      name: 'POS & Billing',
      href: '/pos',
      icon: ShoppingCart,
      badge: 'START SALE',
      badgeColor: 'bg-emerald-600 text-white',
    },
    { name: 'Orders', href: '/orders', icon: ReceiptText },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'My Sales', href: '/my-sales', icon: Banknote },
  ];

  const navItems = isAdmin ? adminNavItems : cashierNavItems;

  const handleSwitchAccount = async () => {
    await logout();
    router.push('/login');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 sm:w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 shadow-2xl lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        aria-label="Navigation sidebar"
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2.5">
            <img
              src={brandLogo.src}
              alt={settings.companyName || 'Avani Grocers'}
              className="h-9 w-auto max-w-[130px] object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
                const fallback = e.currentTarget.parentElement?.querySelector('#sidebar-logo-fallback') as HTMLElement | null;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className="hidden items-center gap-2.5" id="sidebar-logo-fallback">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md shadow-emerald-700/20">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-slate-900">
                    {settings.companyName}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-400">Grocery POS & ERP</p>
              </div>
            </div>
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800 ml-auto">
              PRO
            </span>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition lg:hidden"
            aria-label="Close navigation sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Store Live Status Pill */}
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>{settings.operations.storeStatus === 'open' ? 'Store is Open' : 'Store Closed'}</span>
            </div>
            <span className="text-[11px] text-slate-400 capitalize">{currentUser?.role} Till</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'relative group flex items-center justify-between rounded-xl px-3 py-2.5 min-h-[44px] text-xs sm:text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.99]'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-600 rounded-r-full" />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-colors shrink-0',
                      isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide',
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Card & Role Switcher */}
        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-2.5">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/20"
            />
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">
                {currentUser?.name}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                {isAdmin ? (
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                ) : (
                  <UserCheck className="h-3 w-3 text-blue-600" />
                )}
                <span className="capitalize">{currentUser?.role}</span>
              </div>
            </div>
          </div>

          {/* Switch Account & Logout Actions */}
          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwitchAccount}
              title="Safely end session and switch account (/login)"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-800 px-2.5 py-2 text-[11px] font-bold transition active:scale-95 shadow-2xs"
            >
              <Repeat className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              <span>Switch Account</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out to Storefront"
              className="flex items-center justify-center gap-1 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2.5 py-2 text-[11px] font-bold transition active:scale-95 shadow-2xs"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-600 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
