'use client';

import { useState } from 'react';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { subDays } from 'date-fns';

export default function DashboardPage() {
  const [dateRange] = useState({
    startDate: subDays(new Date(), 30),  // 최근 30일
    endDate: new Date()
  });

  return (
    <div className="container mx-auto py-8">
      <AnalyticsDashboard
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />
    </div>
  );
} 