import { MessageCircle, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";
  
  return (
    <div className={`flex items-start space-x-2 ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`${isUser ? "chat-bubble-user text-white" : "chat-bubble-ai text-gray-800"} p-3 rounded-lg max-w-xs`}>
        <p className="text-sm">{content}</p>
        {!isUser && content.includes("law") && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600">📚 Learn more about legal topics</p>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}
