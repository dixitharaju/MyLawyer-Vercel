import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, User, Plus, MessageCircle, ArrowLeft, Settings } from "lucide-react";
import ChatMessage from "@/components/chat-message";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type Message = {
  id: number;
  conversationId: number;
  role: "user" | "assistant" | "lawyer";
  content: string;
  createdAt: string;
};

type Conversation = {
  id: number;
  title: string;
  userId: string;
  userName: string;
  complaintId?: string;
  complaintNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export default function LawyerChat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Redirect to dashboard if user is not a lawyer
  useEffect(() => {
    console.log('LawyerChat - Current user:', user);
    console.log('LawyerChat - User role:', user?.role);
    console.log('LawyerChat - Session storage userId:', sessionStorage.getItem('userId'));
    
    if (user && user.role !== 'lawyer') {
      console.log('LawyerChat - Redirecting non-lawyer to home');
      window.location.href = '/home';
    }
  }, [user]);

  // Fetch lawyer's client conversations
  const { data: conversations, isError: conversationsError } = useQuery({
    queryKey: ["lawyer-conversations"],
    queryFn: async () => {
      const userId = sessionStorage.getItem('userId');
      const headers: any = {};
      
      if (userId) {
        headers['Authorization'] = `Bearer ${userId}`;
      }
      
      const response = await fetch('/api/lawyer/conversations', {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      return response.json();
    },
    enabled: !!user && user.role === 'lawyer'
  });

  // Fetch messages for selected conversation
  const { data: conversationMessages, refetch: refetchMessages } = useQuery({
    queryKey: ["lawyer-messages", selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      
      const userId = sessionStorage.getItem('userId');
      const headers: any = {};
      
      if (userId) {
        headers['Authorization'] = `Bearer ${userId}`;
      }
      
      const response = await fetch(`/api/lawyer/conversations/${selectedConversation}/messages`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      return response.json();
    },
    enabled: !!selectedConversation
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedConversation) {
        throw new Error('No conversation selected');
      }
      
      const userId = sessionStorage.getItem('userId');
      const headers: any = {};
      
      if (userId) {
        headers['Authorization'] = `Bearer ${userId}`;
      }
      
      const response = await fetch(`/api/lawyer/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          content: content,
          role: "lawyer"
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Add lawyer message to the conversation
      setMessages(prev => [...prev, data.lawyerMessage]);
      queryClient.invalidateQueries({ queryKey: ["lawyer-conversations"] });
      refetchMessages();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update messages when conversation messages change
  useEffect(() => {
    if (conversationMessages) {
      setMessages(conversationMessages);
    }
  }, [conversationMessages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation) return;
    
    setIsLoading(true);
    try {
      await sendMessageMutation.mutateAsync(message);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversationSelect = (conversationId: number) => {
    setSelectedConversation(conversationId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-900 via-blue-900/20 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/lawyer-dashboard')}
            className="text-white hover:text-blue-300"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold text-white">Client Conversations</h1>
          <div className="w-10"></div> {/* Empty div for flex spacing */}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {/* Conversations Layout */}
        <div className="h-full flex">
          {/* Conversations List */}
          <div className="w-1/3 bg-white/10 backdrop-blur-sm border-r border-white/20">
            <div className="p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Client Conversations</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations?.map((conversation: Conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={`p-4 cursor-pointer border-b border-white/10 hover:bg-white/5 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-white truncate">
                      {conversation.userName || "Client"}
                    </span>
                  </div>
                  {conversation.complaintNumber && (
                    <p className="text-xs text-blue-300 mt-1">
                      Case: {conversation.complaintNumber}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(conversation.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}

              {(!conversations || conversations.length === 0) && (
                <div className="p-6 text-center">
                  <p className="text-gray-400 text-sm">No client conversations yet</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <ChatMessage
                      key={msg.id}
                      role={msg.role === "lawyer" ? "user" : "assistant"}
                      content={msg.content}
                      timestamp={msg.createdAt}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="p-4 bg-white/5 backdrop-blur-sm border-t border-white/20">
                  <div className="flex space-x-2">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your response to client..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || isLoading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* Welcome Screen */
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">
                    Client Communication
                  </h2>
                  <p className="text-gray-300 mb-6 max-w-md">
                    Select a client conversation from the sidebar to begin messaging.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/lawyer-dashboard")}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/lawyer-chat")}
            className="flex flex-col items-center space-y-1 p-2 text-blue-600"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Chat</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/lawyer-setting")}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}