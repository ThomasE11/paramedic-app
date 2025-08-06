'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, Search, Calendar, User, ArrowLeft } from 'lucide-react';

interface Message {
  id: string;
  fromId: string;
  fromName: string;
  fromRole: string;
  toId: string;
  toName: string;
  subject: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  participantName: string;
  participantRole: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: Message[];
}

export default function StudentMessaging() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        const formattedConversations: Conversation[] = data.map((conv: any) => ({
          id: conv.id,
          participantName: conv.participantName,
          participantRole: conv.participantRole,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: conv.unreadCount,
          messages: conv.messages
        }));
        setConversations(formattedConversations);
      } else {
        console.error('Failed to fetch conversations');
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // Find the recipient ID from the conversation
      const recipientId = selectedConversation.messages[0]?.fromRole === 'STUDENT' 
        ? selectedConversation.messages[0]?.toId 
        : selectedConversation.messages[0]?.fromId;
      
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toId: recipientId,
          toName: selectedConversation.participantName,
          subject: 'Re: ' + (selectedConversation.messages[0]?.subject || 'Message'),
          content: newMessage,
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        
        // Update the conversation with the new message
        const updatedConversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, sentMessage],
          lastMessage: newMessage,
          lastMessageAt: sentMessage.createdAt,
        };

        setSelectedConversation(updatedConversation);
        
        // Update the conversations list
        setConversations(prev => 
          prev.map(conv => 
            conv.id === selectedConversation.id ? updatedConversation : conv
          )
        );

        setNewMessage('');
      } else {
        console.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
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

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-8 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 p-8 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-3xl" />
            <div className="relative">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Messages
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-3 text-lg">
                View messages from instructors and communicate about your learning progress
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 shadow-2xl">
              <div className="p-6 border-b border-white/20 dark:border-slate-800/50">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center mb-4">
                  <MessageSquare className="h-6 w-6 mr-3 text-blue-500" />
                  Conversations
                </h3>
                <div className="relative">
                  <Search className="absolute left-4 top-4 h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="p-2">
                <div className="space-y-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 m-2 cursor-pointer rounded-2xl transition-all duration-300 ${
                        selectedConversation?.id === conversation.id 
                          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-300/30 dark:border-blue-600/30 shadow-lg scale-[1.02]' 
                          : 'bg-white/40 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/20 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:scale-[1.01]'
                      } backdrop-blur-sm`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                              {conversation.participantName}
                            </h3>
                            <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30">
                              {conversation.participantRole}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-2">
                            {conversation.lastMessage}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
                            {formatDate(conversation.lastMessageAt)}
                          </p>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="ml-2 bg-red-500 text-white border-0 px-2 py-1 text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 shadow-2xl">
                <div className="p-6 border-b border-white/20 dark:border-slate-800/50">
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="lg:hidden bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <User className="h-6 w-6 text-blue-500" />
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedConversation.participantName}</h3>
                      <p className="text-slate-600 dark:text-slate-400">{selectedConversation.participantRole}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {selectedConversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.fromRole === 'STUDENT' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-6 py-4 rounded-2xl backdrop-blur-sm ${
                            message.fromRole === 'STUDENT'
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                              : 'bg-white/60 dark:bg-slate-800/60 text-slate-900 dark:text-white border border-white/30 dark:border-slate-700/30'
                          }`}
                        >
                          <div className="text-sm font-semibold mb-2">
                            {message.fromName}
                          </div>
                          <div className="text-sm">{message.content}</div>
                          <div className={`text-xs mt-2 flex items-center ${
                            message.fromRole === 'STUDENT' ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(message.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="mt-6 space-y-4">
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[100px] bg-white/80 dark:bg-slate-800/80 border border-white/30 dark:border-slate-700/30 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <div className="flex justify-end">
                      <Button 
                        onClick={sendMessage} 
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl px-6 py-3 font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-800/50 shadow-2xl">
                <div className="flex flex-col items-center justify-center py-16 px-8">
                  <MessageSquare className="h-16 w-16 text-slate-400 dark:text-slate-500 mb-6" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Select a conversation</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center text-lg max-w-md">
                    Choose a conversation from the list to start viewing and sending messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}