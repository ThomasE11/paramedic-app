
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users } from 'lucide-react';
import { DashboardStats } from '@/lib/types';

interface ModuleOverviewProps {
  stats: DashboardStats;
}

export function ModuleOverview({ stats }: ModuleOverviewProps) {
  const maxStudents = Math.max(...(stats?.moduleStats?.map(m => m?.studentCount || 0) || [1]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Module Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stats?.moduleStats?.map((module) => (
            <div key={module?.moduleId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sm">{module?.moduleCode || 'Unknown'}</h4>
                  <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                    {module?.moduleName || 'No name'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {module?.studentCount || 0}
                  </Badge>
                </div>
              </div>
              <Progress
                value={maxStudents > 0 ? ((module?.studentCount || 0) / maxStudents) * 100 : 0}
                className="h-2"
              />
            </div>
          )) || (
            <p className="text-sm text-muted-foreground">No modules found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
