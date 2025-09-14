
'use client';

import { useState, useEffect } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ModuleOverview } from '@/components/dashboard/module-overview';
import { RecentActivities } from '@/components/dashboard/recent-activities';
import { DashboardStats } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    moduleStats: [],
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong loading the dashboard',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 glass-morphism rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 glass-morphism rounded-lg animate-pulse" />
          <div className="h-96 glass-morphism rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ModuleOverview stats={stats} />
        <RecentActivities stats={stats} />
      </div>
    </div>
  );
}
