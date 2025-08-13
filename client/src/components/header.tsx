import { Button } from "@/components/ui/button";
import { Scale, Bell, User, Sparkles } from "lucide-react";
import { useLocation } from "wouter";

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-4 shadow-lg border-b border-blue-800/50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Scale className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              MyLawyer
            </h1>
            <p className="text-xs text-blue-200/80 flex items-center">
              <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
              AI-Powered Legal Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 text-white hover:scale-110"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/profile")}
            className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 text-white hover:scale-110"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
