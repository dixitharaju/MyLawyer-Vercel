import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, FileText, Bookmark, Bell, Settings, HelpCircle, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/bottom-nav";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: complaints } = useQuery({
    queryKey: ["/api/complaints"],
    enabled: !!user,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const menuItems = [
    {
      icon: FileText,
      label: "My Complaints",
      value: complaints?.length || 0,
      action: () => setLocation("/complaint"),
    },
    {
      icon: Bookmark,
      label: "Saved Articles",
      value: 0,
      action: () => {},
    },
    {
      icon: Bell,
      label: "Notifications",
      value: 0,
      action: () => {},
    },
    {
      icon: Settings,
      label: "Settings",
      value: null,
      action: () => {},
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      value: null,
      action: () => {},
    },
  ];

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-200 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">Profile</h2>
        </div>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Profile Info */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  {user?.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-white" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "User"
                  }
                </h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{complaints?.length || 0}</div>
                  <div className="text-sm text-gray-600">Complaints</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">0</div>
                  <div className="text-sm text-gray-600">Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">0</div>
                  <div className="text-sm text-gray-600">Posts</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <Card className="shadow-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-800">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {item.value !== null && (
                        <span className="text-sm text-gray-500">{item.value}</span>
                      )}
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-5 h-5 text-red-600" />
                    <span className="text-red-600">Logout</span>
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </main>

        <BottomNav activeTab="profile" />
      </div>
    </div>
  );
}
