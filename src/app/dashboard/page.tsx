'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';
import { CashierDashboard } from '@/components/dashboard/CashierDashboard';

export default function DashboardPage() {
  const { currentUser } = useStore();

  if (currentUser?.role === 'cashier') {
    return <CashierDashboard />;
  }

  return <AdminDashboard />;
}
