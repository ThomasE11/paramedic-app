'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, CheckCircle, AlertCircle, Users, GraduationCap, BookOpen } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  const sendNotification = async () => {
    if (!notificationMessage.trim()) {
      alert('Please enter a notification message.');
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: notificationMessage,
          role: selectedRole || 'ALL'
        }),
      });
      
      if (response.ok) {
        setLastSent(`Notification sent successfully to ${selectedRole || 'ALL'} users at ${new Date().toLocaleTimeString()}`);
        setNotificationMessage('');
        setSelectedRole('');
      } else {
        alert('Failed to send notification');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification');
    } finally {
      setSending(false);
    }
  };

  const predefinedMessages = [
    {
      title: "System Maintenance",
      message: "The system will undergo scheduled maintenance from 2:00 AM to 4:00 AM. Please save your work before this time."
    },
    {
      title: "New Skills Available",
      message: "New paramedic skills have been added to the system. Check out the latest training modules in your dashboard."
    },
    {
      title: "Assessment Reminder",
      message: "Don't forget to complete your pending skill assessments. Deadline is approaching soon."
    },
    {
      title: "Welcome Message",
      message: "Welcome to the Paramedic Skills Matrix System! Explore your dashboard to start your learning journey."
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Send Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Send system-wide notifications to users
          </p>
        </div>
      </div>

      {/* Success Alert */}
      {lastSent && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            {lastSent}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Notification Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Compose Notification
              </CardTitle>
              <CardDescription>
                Create and send notifications to specific user groups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        All Users
                      </div>
                    </SelectItem>
                    <SelectItem value="STUDENT">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Students Only
                      </div>
                    </SelectItem>
                    <SelectItem value="LECTURER">
                      <div className="flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Lecturers Only
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Administrators Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notification Message</label>
                <Textarea 
                  placeholder="Enter your notification message here..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {notificationMessage.length}/500 characters
                </div>
              </div>

              <Button 
                onClick={sendNotification}
                disabled={!notificationMessage.trim() || sending}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Send Notification'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Templates */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Templates</CardTitle>
              <CardDescription>
                Use predefined message templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predefinedMessages.map((template, index) => (
                  <div key={index} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="font-medium text-sm mb-1">{template.title}</div>
                    <div className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {template.message}
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setNotificationMessage(template.message)}
                    >
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Notification Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Today</span>
                  <span className="font-medium">12 sent</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="font-medium">45 sent</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">This Month</span>
                  <span className="font-medium">128 sent</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Open Rate</span>
                  <span className="font-medium text-green-600">87%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}