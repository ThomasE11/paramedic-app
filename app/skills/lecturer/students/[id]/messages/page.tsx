'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  MessageSquare,
  Send,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  FileText,
  Paperclip
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: 'LECTURER' | 'STUDENT';
  toId: string;
  toName: string;
  subject: string;
  content: string;
  isRead: boolean;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  status: 'ACTIVE' | 'INACTIVE';
  lastSeen: string;
}

export default function StudentMessages() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
    fetchMessages();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      // Mock student data
      const mockStudent: Student = {
        id: studentId,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        studentId: 'STU001',
        status: 'ACTIVE',
        lastSeen: '2024-12-19T08:30:00Z'
      };
      
      setStudent(mockStudent);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      // Mock messages data
      const mockMessages: Message[] = [
        {
          id: 'msg-1',
          fromId: 'lecturer-1',
          fromName: 'Dr. Sarah Wilson',
          fromRole: 'LECTURER',
          toId: studentId,
          toName: 'Sarah Johnson',
          subject: 'Great work on CPR practice today!',
          content: 'Hi Sarah, I wanted to reach out and congratulate you on your excellent CPR performance today. Your compression depth has improved significantly, and you maintained the correct rate throughout the entire session. Keep up the fantastic work!\n\nFor next week, I\'d like you to focus on:\n- Maintaining hand position during longer sessions\n- Practicing with background distractions\n- Working on team communication during scenarios\n\nLet me know if you have any questions.',
          isRead: true,
          isImportant: false,
          createdAt: '2024-12-18T16:30:00Z',
          updatedAt: '2024-12-18T16:30:00Z'
        },
        {
          id: 'msg-2',
          fromId: studentId,
          fromName: 'Sarah Johnson',
          fromRole: 'STUDENT',
          toId: 'lecturer-1',
          toName: 'Dr. Sarah Wilson',
          subject: 'Re: Great work on CPR practice today!',
          content: 'Thank you so much for the feedback, Dr. Wilson! I really appreciate you taking the time to recognize my progress. \n\nI have been practicing at home with the techniques you showed us, and it\'s great to hear that it\'s paying off. I\'ll definitely focus on those areas you mentioned for next week.\n\nI do have a question about the team communication aspect - could we perhaps practice some scenarios where I need to coordinate with other team members?',
          isRead: true,
          isImportant: false,
          createdAt: '2024-12-19T08:15:00Z',
          updatedAt: '2024-12-19T08:15:00Z'
        },
        {
          id: 'msg-3',
          fromId: 'lecturer-2',
          fromName: 'Prof. Michael Chen',
          fromRole: 'LECTURER',
          toId: studentId,
          toName: 'Sarah Johnson',
          subject: 'IV Insertion Practice - Additional Resources',
          content: 'Hi Sarah,\n\nI noticed you\'ve been working hard on improving your IV insertion technique. I wanted to share some additional resources that might help:\n\n1. Anatomy review videos in the learning portal\n2. Practice schedule for the skills lab (attached)\n3. Peer study group information\n\nI\'ve also scheduled some one-on-one practice time with you next Tuesday at 2 PM. We\'ll focus specifically on palpation techniques.\n\nKeep up the great effort!',
          isRead: false,
          isImportant: true,
          createdAt: '2024-12-19T10:00:00Z',
          updatedAt: '2024-12-19T10:00:00Z',
          attachments: [
            {
              id: 'att-1',
              name: 'IV_Practice_Schedule.pdf',
              url: '/attachments/iv-practice-schedule.pdf',
              type: 'application/pdf'
            }
          ]
        },
        {
          id: 'msg-4',
          fromId: 'lecturer-1',
          fromName: 'Dr. Sarah Wilson',
          fromRole: 'LECTURER',
          toId: studentId,
          toName: 'Sarah Johnson',
          subject: 'Upcoming Assessment Preparation',
          content: 'Hi Sarah,\n\nI wanted to remind you about the upcoming practical assessment next Friday. Based on your recent performance, I\'m confident you\'ll do well.\n\nPlease make sure to:\n- Review all Basic Life Support procedures\n- Practice with the assessment checklist (attached)\n- Get plenty of rest the night before\n\nIf you have any last-minute questions or want to schedule a quick review session, please let me know.\n\nGood luck!',
          isRead: false,
          isImportant: true,
          createdAt: '2024-12-17T14:20:00Z',
          updatedAt: '2024-12-17T14:20:00Z'
        }
      ];
      
      setMessages(mockMessages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !newSubject.trim()) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      fromId: 'lecturer-current',
      fromName: 'Current Lecturer',
      fromRole: 'LECTURER',
      toId: studentId,
      toName: student?.name || '',
      subject: newSubject,
      content: newMessage,
      isRead: false,
      isImportant,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage('');
    setNewSubject('');
    setIsImportant(false);
  };

  const markAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, isRead: true } : msg
      )
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const unreadCount = messages.filter(msg => !msg.isRead && msg.fromRole === 'STUDENT').length;
  const importantCount = messages.filter(msg => msg.isImportant && !msg.isRead).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/lecturer/students/${studentId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Student
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground">
              Communication with {student?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Student Info Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">
                {student ? getInitials(student.name) : ''}
              </span>
            </div>
            
            <div className="flex-1">
              <CardTitle className="text-2xl">{student?.name}</CardTitle>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-gray-600">{student?.email}</span>
                <Badge variant="outline">{student?.studentId}</Badge>
                <Badge className={getStatusColor(student?.status || '')}>
                  {student?.status}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600">Last seen</div>
              <div className="font-medium">
                {student?.lastSeen ? formatDate(student.lastSeen) : 'Never'}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Message Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{messages.length}</div>
            <div className="text-sm text-blue-600">Total Messages</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-800">{unreadCount}</div>
            <div className="text-sm text-orange-600">Unread from Student</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-6 w-6 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-800">{importantCount}</div>
            <div className="text-sm text-red-600">Important Unread</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Message Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="h-5 w-5 mr-2" />
              Send New Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Subject
              </label>
              <Input
                placeholder="Enter message subject..."
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Message
              </label>
              <Textarea
                placeholder="Type your message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Mark as important</span>
              </label>

              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-1" />
                Attach File
              </Button>
            </div>

            <Button 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !newSubject.trim()}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setNewSubject('Feedback on Recent Performance');
                setNewMessage('Hi ' + student?.name + ',\n\nI wanted to provide you with feedback on your recent performance...\n\n');
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Send Performance Feedback
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setNewSubject('Practice Session Scheduling');
                setNewMessage('Hi ' + student?.name + ',\n\nI\'d like to schedule an additional practice session with you...\n\n');
              }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Practice Session
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setNewSubject('Assessment Reminder');
                setNewMessage('Hi ' + student?.name + ',\n\nThis is a reminder about your upcoming assessment...\n\n');
                setIsImportant(true);
              }}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Assessment Reminder
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setNewSubject('Encouragement and Support');
                setNewMessage('Hi ' + student?.name + ',\n\nI wanted to reach out and recognize your hard work...\n\n');
              }}
            >
              <Star className="h-4 w-4 mr-2" />
              Send Encouragement
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Message History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Message History</span>
            <Badge variant="outline">{messages.length} messages</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  !message.isRead && message.fromRole === 'STUDENT' 
                    ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' 
                    : 'bg-gray-50 hover:bg-gray-100'
                } ${message.isImportant ? 'border-l-4 border-l-red-500' : ''}`}
                onClick={() => !message.isRead && markAsRead(message.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${
                      message.fromRole === 'LECTURER' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                      {getInitials(message.fromName)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{message.fromName}</span>
                        <Badge variant="outline" className="text-xs">
                          {message.fromRole}
                        </Badge>
                        {message.isImportant && (
                          <Star className="h-4 w-4 text-red-500 fill-red-500" />
                        )}
                        {!message.isRead && message.fromRole === 'STUDENT' && (
                          <Badge variant="destructive" className="text-xs">NEW</Badge>
                        )}
                      </div>
                      <h4 className="font-medium text-gray-900 mt-1">{message.subject}</h4>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{formatDate(message.createdAt)}</div>
                    {message.isRead ? (
                      <CheckCircle className="h-4 w-4 text-green-500 ml-auto mt-1" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400 ml-auto mt-1" />
                    )}
                  </div>
                </div>

                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>

                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Attachments:</div>
                    {message.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                        <Paperclip className="h-4 w-4 text-gray-500" />
                        <a 
                          href={attachment.url} 
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                          download
                        >
                          {attachment.name}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                <p className="text-gray-600">
                  Start a conversation with {student?.name} by sending a message above.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}