import { Button } from "@/components/ui/button";
import { Home, MessageCircle, BookOpen, FileText, Users } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavProps {
  activeTab: string;
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/" },
    { id: "chat", icon: MessageCircle, label: "AI Chat", path: "/chat" },
    { id: "legal", icon: BookOpen, label: "Library", path: "/legal" },
    { id: "complaint", icon: FileText, label: "Complaints", path: "/complaint" },
    { id: "community", icon: Users, label: "Community", path: "/community" },
  ];

  return (
    <nav className="bg-white border-t border-gray-200 p-2">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            onClick={() => setLocation(item.path)}
            className={`flex-1 flex flex-col items-center py-2 hover:bg-gray-100 rounded-lg transition-colors ${
              activeTab === item.id ? "text-primary" : "text-gray-600"
            }`}
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
