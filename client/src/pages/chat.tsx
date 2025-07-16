import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, MessageCircle, User } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNav from "@/components/bottom-nav";
import ChatMessage from "@/components/chat-message";

export default function Chat() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: conversations } = useQuery({
    queryKey: ["/api/chat/conversations"],
    enabled: !!user,
  });

  const { data: messages } = useQuery({
    queryKey: ["/api/chat/conversations", currentConversationId, "messages"],
    enabled: !!currentConversationId,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/chat/conversations", {
        title: "New Conversation"
      });
    },
    onSuccess: (response) => {
      const conversation = response.json();
      setCurrentConversationId(conversation.id);
      queryClient.invalidateQueries({ queryKey: ["/api/chat/conversations"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", `/api/chat/conversations/${currentConversationId}/messages`, {
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/chat/conversations", currentConversationId, "messages"] 
      });
      setMessageInput("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (conversations && conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    if (!currentConversationId) {
      createConversationMutation.mutate();
      // Message will be sent after conversation is created
      return;
    }
    
    sendMessageMutation.mutate(messageInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewConversation = () => {
    createConversationMutation.mutate();
  };

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col">
        {/* Chat Header */}
        <div className="bg-white p-4 border-b border-gray-200 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Legal AI Assistant</h3>
              <p className="text-sm text-green-600">Online</p>
            </div>
          </div>
          <Button
            onClick={startNewConversation}
            className="ml-auto bg-primary text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
            disabled={createConversationMutation.isPending}
          >
            New
          </Button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!currentConversationId || !messages ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">Start a conversation with our AI assistant</p>
                <Button onClick={startNewConversation} disabled={createConversationMutation.isPending}>
                  {createConversationMutation.isPending ? "Starting..." : "Start Chat"}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <ChatMessage
                  role="assistant"
                  content="Hello! I'm your AI legal assistant. How can I help you with your legal questions today?"
                  timestamp={new Date().toISOString()}
                />
              )}
              
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.createdAt}
                />
              ))}
              
              {sendMessageMutation.isPending && (
                <div className="flex items-start space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div className="chat-bubble-ai text-gray-800 p-3 rounded-lg max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Chat Input */}
        <div className="bg-white p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your legal question..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || sendMessageMutation.isPending}
              className="bg-primary text-white hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <BottomNav activeTab="chat" />
      </div>
    </div>
  );
}
