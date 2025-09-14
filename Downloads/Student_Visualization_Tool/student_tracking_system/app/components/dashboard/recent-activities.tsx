
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, User, FileText, UserPlus, Edit3, Trash2 } from 'lucide-react';
import { DashboardStats } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivitiesProps {
  stats: DashboardStats;
}

export function RecentActivities({ stats }: RecentActivitiesProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'student_created':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'student_updated':
        return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'note_added':
        return <FileText className="w-4 h-4 text-orange-500" />;
      case 'note_updated':
        return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'note_deleted':
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'student_created':
        return 'bg-green-100 text-green-800';
      case 'student_updated':
        return 'bg-blue-100 text-blue-800';
      case 'note_added':
        return 'bg-orange-100 text-orange-800';
      case 'note_updated':
        return 'bg-blue-100 text-blue-800';
      case 'note_deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats?.recentActivities?.length ? (
            stats.recentActivities.map((activity) => (
              <div key={activity?.id} className="flex items-start gap-3 pb-4 border-b last:border-b-0 last:pb-0">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity?.type || '')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity?.student?.fullName || 'Unknown Student'}
                    </p>
                    <Badge variant="outline" className={getActivityColor(activity?.type || '')}>
                      {activity?.type?.replace('_', ' ') || 'unknown'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {activity?.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>
                      {activity?.student?.module?.code || 'No module'}
                    </span>
                    <span>•</span>
                    <span>
                      {activity?.createdAt
                        ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                        : 'Unknown time'
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activities</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
