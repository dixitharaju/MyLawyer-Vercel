import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, Plus, MessageCircle } from "lucide-react";
import ChatMessage from "@/components/chat-message";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: number;
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

type Conversation = {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
};

export default function ChatScreen() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch existing conversations
  const { data: conversations, isError: conversationsError } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const userId = sessionStorage.getItem('userId');
      const headers: any = {};
      
      if (userId) {
        headers['Authorization'] = `Bearer ${userId}`;
      }
      
      const response = await fetch('/api/chat/conversations', {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }
      
      return response.json();
    },
    enabled: !!user
  });

  // Fetch messages for selected conversation
  const { data: conversationMessages, refetch: refetchMessages } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      
      const userId = sessionStorage.getItem('userId');
      const headers: any = {};
      
      if (userId) {
        headers['Authorization'] = `Bearer ${userId}`;
      }
      
      const response = await fetch(`/api/chat/conversations/${selectedConversation}/messages`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      
      return response.json();
    },
    enabled: !!selectedConversation
  });

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const userId = sessionStorage.getItem('userId');
      const headers: any = {};
      
      if (userId) {
        headers['Authorization'] = `Bearer ${userId}`;
      }
      
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          title: 'New Conversation'
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }
      
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setSelectedConversation(newConversation.id);
      setConversationId(newConversation.id);
      setMessages([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive"
      });
    }
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
      
      const response = await fetch(`/api/chat/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify({
          content: content,
          role: "user"
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Add both user and assistant messages to the conversation
      setMessages(prev => [...prev, data.userMessage, data.assistantMessage]);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
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

  const handleNewConversation = () => {
    createConversationMutation.mutate();
  };

  const handleConversationSelect = (conversationId: number) => {
    setSelectedConversation(conversationId);
    setConversationId(conversationId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col bg-gradient-to-b from-slate-900 via-blue-900/20 to-slate-900">
        {/* Header */}
        <Header />
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {/* Conversations Sidebar */}
          <div className="h-full flex">
            {/* Conversations List */}
            <div className="w-1/3 bg-white/10 backdrop-blur-sm border-r border-white/20">
              <div className="p-4">
                <Button
                  onClick={handleNewConversation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={createConversationMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Chat
                </Button>
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
                        {conversation.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
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
                        role={msg.role}
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
                        placeholder="Ask your legal question..."
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
                      <Bot className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      AI Legal Assistant
                    </h2>
                    <p className="text-gray-300 mb-6 max-w-md">
                      Get instant legal guidance and answers to your legal questions. 
                      Start a new conversation to begin.
                    </p>
                    <Button
                      onClick={handleNewConversation}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={createConversationMutation.isPending}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start New Chat
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
        
        {/* Bottom Navigation */}
        <BottomNav activeTab="chat" />
      </div>
    </div>
  );
}