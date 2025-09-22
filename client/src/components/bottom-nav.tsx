import { Button } from "@/components/ui/button";
import { Home, Bot, BookOpen, FileText, Users } from "lucide-react";
import { useLocation } from "wouter";

interface BottomNavProps {
  activeTab: string;
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const [, setLocation] = useLocation();

  const navItems = [
    { id: "home", icon: Home, label: "Home", path: "/home" },
    { id: "chat", icon: Bot, label: "AI Chat", path: "/chat" },
    { id: "legal", icon: BookOpen, label: "Library", path: "/legal-library" },
    { id: "complaint", icon: FileText, label: "Complaints", path: "/complaint" },
    { id: "community", icon: Users, label: "Community", path: "/community" },
  ];

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-blue-900 border-t border-blue-800/50 p-3 shadow-2xl backdrop-blur-sm">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`flex-1 flex flex-col items-center py-3 px-2 rounded-xl transition-all duration-500 ${
                isActive 
                  ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/25 transform scale-105 hover:scale-110" 
                  : "text-slate-400 hover:text-blue-400 hover:bg-slate-800/50 hover:scale-105"
              }`}
            >
              <item.icon className={`w-5 h-5 mb-1 transition-all duration-300 ${isActive ? 'animate-pulse' : 'hover:scale-110'}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
