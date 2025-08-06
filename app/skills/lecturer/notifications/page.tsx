
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  BookOpen,
  Search,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Video,
  BarChart3
} from 'lucide-react';

interface NotificationData {
  notifications: any[];
  summary: {
    total: number;
    unread: number;
    typeBreakdown: Record<string, number>;
  };
  pagination: {
    currentPage: number;
    limit: number;
    hasMore: boolean;
  };
}

export default function EnhancedLecturerNotifications() {
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);

  useEffect(() => {
    fetchNotifications();
  }, [selectedType, selectedStatus]);

  const fetchNotifications = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      if (selectedStatus) params.append('isRead', selectedStatus);
      
      const response = await fetch(`/api/lecturer/notifications?${params}`);
      const data = await response.json();
      setNotificationData(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/lecturer/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          isRead: true,
        }),
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/lecturer/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_all_read',
        }),
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch('/api/lecturer/notifications', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
        }),
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'FEEDBACK':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'PROGRESS_UPDATE':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'SYSTEM_MESSAGE':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'REMINDER':
        return <Clock className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'FEEDBACK':
        return 'bg-blue-100 text-blue-800';
      case 'PROGRESS_UPDATE':
        return 'bg-green-100 text-green-800';
      case 'SYSTEM_MESSAGE':
        return 'bg-orange-100 text-orange-800';
      case 'REMINDER':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const filteredNotifications = notificationData?.notifications?.filter(notification => {
    if (!searchTerm) return true;
    return (
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.relatedData?.skill?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!notificationData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Failed to load notifications</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-2">
              Stay updated on student progress and system activity
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-sm">
              {notificationData.summary.unread} unread
            </Badge>
            {notificationData.summary.unread > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                Mark All as Read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(notificationData.summary.typeBreakdown).map(([type, count]) => (
          <Card key={type}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                {getNotificationIcon(type)}
                <span className="ml-2">{type.replace('_', ' ')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">notifications</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FEEDBACK">Feedback</SelectItem>
                <SelectItem value="PROGRESS_UPDATE">Progress Updates</SelectItem>
                <SelectItem value="SYSTEM_MESSAGE">System Messages</SelectItem>
                <SelectItem value="REMINDER">Reminders</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notifications</SelectItem>
                <SelectItem value="false">Unread Only</SelectItem>
                <SelectItem value="true">Read Only</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedType('');
                setSelectedStatus('');
                setSearchTerm('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              !notification.isRead ? 'bg-blue-50/50 border-blue-200' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <CardTitle className="text-lg">{notification.title}</CardTitle>
                      <Badge className={getNotificationColor(notification.type)}>
                        {notification.type.replace('_', ' ')}
                      </Badge>
                      {!notification.isRead && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          New
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-sm">
                      {notification.message}
                    </CardDescription>
                    {notification.relatedData?.skill && (
                      <div className="flex items-center space-x-2 mt-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {notification.relatedData.skill.name}
                        </span>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: notification.relatedData.skill.category.colorCode }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(notification.createdAt)}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                          {getNotificationIcon(notification.type)}
                          <span>{notification.title}</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Badge className={getNotificationColor(notification.type)}>
                            {notification.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Message</h4>
                          <p className="text-sm">{notification.message}</p>
                        </div>

                        {notification.relatedData?.skill && (
                          <div>
                            <h4 className="font-medium mb-2">Related Skill</h4>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: notification.relatedData.skill.category.colorCode }}
                              />
                              <span className="text-sm">{notification.relatedData.skill.name}</span>
                              <Badge variant="secondary">{notification.relatedData.skill.category.name}</Badge>
                            </div>
                          </div>
                        )}

                        {notification.relatedData?.recentReflections && notification.relatedData.recentReflections.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recent Student Reflections</h4>
                            <div className="space-y-2">
                              {notification.relatedData.recentReflections.map((reflection: any) => (
                                <div key={reflection.id} className="p-3 bg-muted rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{reflection.user.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(reflection.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm line-clamp-2">{reflection.content}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {notification.relatedData?.recentVideoSessions && notification.relatedData.recentVideoSessions.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recent Video Sessions</h4>
                            <div className="space-y-2">
                              {notification.relatedData.recentVideoSessions.map((session: any) => (
                                <div key={session.id} className="p-3 bg-muted rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{session.user.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(session.createdAt)}
                                    </span>
                                  </div>
                                  {session.analysisResults.length > 0 && (
                                    <div className="flex items-center space-x-4 text-sm">
                                      <span>Overall Score: {session.analysisResults[0].overallScore.toFixed(1)}%</span>
                                      <span>Technique: {session.analysisResults[0].techniqueScore.toFixed(1)}%</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {notification.relatedData?.recentProgress && notification.relatedData.recentProgress.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Recent Progress Updates</h4>
                            <div className="space-y-2">
                              {notification.relatedData.recentProgress.map((progress: any) => (
                                <div key={progress.id} className="p-3 bg-muted rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{progress.user.name}</span>
                                    <Badge className={getNotificationColor(progress.status)}>
                                      {progress.status.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {progress.attempts} attempts • {Math.round(progress.timeSpentMinutes / 60)}h practiced
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {!notification.isRead && (
                    <Button
                      onClick={() => markAsRead(notification.id)}
                      variant="ghost"
                      size="sm"
                      title="Mark as read"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => deleteNotification(notification.id)}
                    variant="ghost"
                    size="sm"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No notifications found</h3>
            <p className="text-muted-foreground text-center">
              {notificationData.notifications.length === 0 
                ? "You're all caught up! New notifications will appear here as students interact with the system."
                : "No notifications match your current filters."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
