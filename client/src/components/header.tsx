import { Button } from "@/components/ui/button";
import { Scale, Bell, User } from "lucide-react";
import { useLocation } from "wouter";

export default function Header() {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-primary text-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Scale className="w-6 h-6" />
          <h1 className="text-xl font-bold">MyLawyer</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors text-white"
          >
            <Bell className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/profile")}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors text-white"
          >
            <User className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
