'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  FileText,
  Edit,
  Trash2,
  Plus,
  Target,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { ModuleActivityModal } from './module-activity-modal';

interface ModuleActivityTimelineProps {
  moduleId: string;
  moduleCode: string;
  moduleName: string;
}

export function ModuleActivityTimeline({
  moduleId,
  moduleCode,
  moduleName
}: ModuleActivityTimelineProps) {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const { toast } = useToast();

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/module-activities?moduleId=${moduleId}`);
      const data = await response.json();

      if (response.ok) {
        setActivities(data.activities || []);
      } else {
        throw new Error(data.error || 'Failed to load activities');
      }
    } catch (error) {
      console.error('Activities fetch error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load module activities',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [moduleId]);

  const handleDelete = async (activityId: string) => {
    if (!confirm('Are you sure you want to delete this activity?')) return;

    try {
      const response = await fetch(`/api/module-activities/${activityId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Activity deleted successfully'
        });
        fetchActivities();
      } else {
        throw new Error(data.error || 'Failed to delete activity');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete activity',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (activity: any) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedActivity(null);
    setIsModalOpen(true);
  };

  const getActivityTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      seminar: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      workshop: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      simulation: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      lecture: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      fieldtrip: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
      presentation: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
      discussion: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[type] || colors.other;
  };

  const getActivityTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading activities...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Module Activities Log</CardTitle>
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Log Activity
          </Button>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No activities logged yet</p>
              <Button onClick={handleAdd} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Log Your First Activity
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{activity.title}</h3>
                        <Badge className={getActivityTypeColor(activity.activityType)}>
                          {getActivityTypeLabel(activity.activityType)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(activity.date), 'MMMM d, yyyy')}
                        </div>
                        {activity.duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {activity.duration} minutes
                          </div>
                        )}
                        {activity.targetAudience && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            {activity.targetAudience}
                          </div>
                        )}
                        {activity.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {activity.location}
                          </div>
                        )}
                      </div>

                      {activity.description && (
                        <p className="text-sm text-muted-foreground mb-3">{activity.description}</p>
                      )}

                      {activity.objectives && activity.objectives.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1 text-sm font-medium mb-1">
                            <Target className="h-4 w-4" />
                            Learning Objectives:
                          </div>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {activity.objectives.map((obj: string, idx: number) => (
                              <li key={idx}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {activity.outcomes && (
                        <div className="mb-3">
                          <div className="flex items-center gap-1 text-sm font-medium mb-1">
                            <CheckCircle2 className="h-4 w-4" />
                            Outcomes:
                          </div>
                          <p className="text-sm text-muted-foreground">{activity.outcomes}</p>
                        </div>
                      )}

                      {activity.notes && (
                        <div className="bg-muted/50 rounded-md p-3 text-sm">
                          <div className="font-medium mb-1">Notes:</div>
                          <p className="text-muted-foreground">{activity.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(activity)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(activity.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                    <span>Facilitator: {activity.facilitator || 'Not specified'}</span>
                    {activity.studentCount && <span>Students: {activity.studentCount}</span>}
                    <span>Logged: {format(new Date(activity.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ModuleActivityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedActivity(null);
        }}
        onSave={fetchActivities}
        module={{ id: moduleId, code: moduleCode, name: moduleName }}
        activity={selectedActivity}
      />
    </>
  );
}
