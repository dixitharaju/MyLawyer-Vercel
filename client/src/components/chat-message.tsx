import { MessageCircle, User, Bot, Sparkles } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";
  
  return (
    <div className={`flex items-start space-x-3 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}
      
      <div className={`${
        isUser 
          ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg" 
          : "bg-white text-gray-800 shadow-lg border border-gray-100"
        } p-4 rounded-2xl max-w-xs relative`}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        
        {!isUser && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <p className="text-xs text-gray-500">AI Legal Assistant</p>
            </div>
          </div>
        )}
        
        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-white transform rotate-45 border-l border-b border-gray-100"></div>
      </div>
      
      {isUser && (
        <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
