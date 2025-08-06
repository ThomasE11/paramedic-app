
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  User, 
  Search, 
  Users,
  MessageCircle,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface MessagingData {
  conversations: Array<{
    student: {
      id: string;
      name: string;
      email: string;
      studentId: string;
    };
    lastMessage: any;
    unreadCount: number;
  }>;
  totalStudents: number;
}

export default function MessagingPage() {
  const searchParams = useSearchParams();
  const [messagingData, setMessagingData] = useState<MessagingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string>('');
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [bulkMessage, setBulkMessage] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [isSendingBulkMessage, setIsSendingBulkMessage] = useState(false);

  useEffect(() => {
    fetchMessagingData();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchConversationMessages();
    }
  }, [selectedConversation]);

  const fetchMessagingData = async () => {
    try {
      const response = await fetch('/api/lecturer/messages');
      const data = await response.json();
      setMessagingData(data);
      
      // Check if there's a student parameter in the URL
      const studentParam = searchParams.get('student');
      if (studentParam && !selectedConversation) {
        setSelectedConversation(studentParam);
      }
    } catch (error) {
      console.error('Error fetching messaging data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationMessages = async () => {
    try {
      const response = await fetch(`/api/lecturer/messages?conversationWith=${selectedConversation}`);
      const data = await response.json();
      setConversationMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    setIsSendingMessage(true);
    try {
      const response = await fetch('/api/lecturer/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedConversation,
          message: newMessage.trim(),
          subject: messageSubject.trim() || undefined,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        setMessageSubject('');
        fetchConversationMessages();
        fetchMessagingData();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const sendBulkMessage = async () => {
    if (selectedStudents.length === 0 || !bulkMessage.trim()) return;

    setIsSendingBulkMessage(true);
    try {
      const response = await fetch('/api/lecturer/bulk-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientIds: selectedStudents,
          message: bulkMessage.trim(),
          subject: bulkSubject.trim() || undefined,
        }),
      });

      if (response.ok) {
        setBulkMessage('');
        setBulkSubject('');
        setSelectedStudents([]);
        fetchMessagingData();
      }
    } catch (error) {
      console.error('Error sending bulk message:', error);
    } finally {
      setIsSendingBulkMessage(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAllStudents = () => {
    if (!messagingData) return;
    setSelectedStudents(messagingData.conversations.map(conv => conv.student.id));
  };

  const clearAllStudents = () => {
    setSelectedStudents([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredConversations = messagingData?.conversations?.filter(conv => {
    if (!searchTerm) return true;
    return (
      conv.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!messagingData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Failed to load messaging data</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card text-card-foreground rounded-lg shadow-sm p-6 border border-border/50">
        <h1 className="text-3xl font-bold text-foreground">Messaging</h1>
        <p className="text-muted-foreground mt-2">
          Send messages to students and manage conversations
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2 text-blue-600" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {messagingData.totalStudents}
            </div>
            <p className="text-xs text-muted-foreground">Available for messaging</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="h-4 w-4 mr-2 text-green-600" />
              Active Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {messagingData.conversations.filter(conv => conv.lastMessage).length}
            </div>
            <p className="text-xs text-muted-foreground">With message history</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
              Unread Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {messagingData.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      {/* Messaging Interface */}
      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="individual">Individual Messages</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Conversation List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Students
                </CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.student.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedConversation === conversation.student.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedConversation(conversation.student.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{conversation.student.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {conversation.student.studentId}
                            </div>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            Last: {formatDate(conversation.lastMessage.createdAt)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Conversation View */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {selectedConversation ? 
                    messagingData.conversations.find(c => c.student.id === selectedConversation)?.student.name
                    : 'Select a conversation'
                  }
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedConversation ? (
                  <div className="space-y-4">
                    {/* Message History */}
                    <ScrollArea className="h-[300px] border rounded-lg p-4">
                      <div className="space-y-3">
                        {conversationMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.userId === selectedConversation ? 'justify-start' : 'justify-end'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.userId === selectedConversation
                                  ? 'bg-muted text-foreground'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              <div className="font-medium text-sm">{message.title}</div>
                              <div className="text-sm mt-1">{message.message}</div>
                              <div className="text-xs mt-2 opacity-70">
                                {formatDate(message.createdAt)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Send Message */}
                    <div className="space-y-3">
                      <Input
                        placeholder="Message subject (optional)"
                        value={messageSubject}
                        onChange={(e) => setMessageSubject(e.target.value)}
                      />
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || isSendingMessage}
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSendingMessage ? 'Sending...' : 'Send Message'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                    <p className="text-muted-foreground text-center">
                      Select a student from the list to start messaging
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Send Bulk Message
              </CardTitle>
              <CardDescription>
                Send a message to multiple students at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Student Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Select Students</label>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={selectAllStudents}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearAllStudents}>
                        Clear All
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[200px] overflow-y-auto">
                    {messagingData.conversations.map((conversation) => (
                      <div
                        key={conversation.student.id}
                        className="flex items-center space-x-2 p-2 border rounded-lg"
                      >
                        <Checkbox
                          id={conversation.student.id}
                          checked={selectedStudents.includes(conversation.student.id)}
                          onCheckedChange={() => toggleStudentSelection(conversation.student.id)}
                        />
                        <label
                          htmlFor={conversation.student.id}
                          className="flex-1 text-sm cursor-pointer"
                        >
                          <div className="font-medium">{conversation.student.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {conversation.student.studentId}
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {selectedStudents.length} students selected
                  </div>
                </div>

                {/* Message Composition */}
                <div className="space-y-3">
                  <Input
                    placeholder="Message subject (optional)"
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                  />
                  <Textarea
                    placeholder="Type your message..."
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    className="min-h-[150px]"
                  />
                  <Button
                    onClick={sendBulkMessage}
                    disabled={selectedStudents.length === 0 || !bulkMessage.trim() || isSendingBulkMessage}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSendingBulkMessage 
                      ? 'Sending...' 
                      : `Send to ${selectedStudents.length} students`
                    }
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
