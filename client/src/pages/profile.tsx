import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, FileText, Bookmark, Bell, Settings, HelpCircle, LogOut, Phone, MapPin, Shield, Scale, Mail } from "lucide-react";
import { useLocation } from "wouter";
import BottomNav from "@/components/bottom-nav";
import type { Complaint } from "../../../shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to lawyer dashboard if user is a lawyer
  useEffect(() => {
    if (user?.role === 'lawyer') {
      setLocation('/lawyer-dashboard');
    }
  }, [user, setLocation]);

  const { data: complaints } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints"],
    enabled: !!user,
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      // Clear user ID from sessionStorage
      sessionStorage.removeItem('userId');
      window.location.href = "/home";
    } catch (error) {
      console.error('Logout failed', error);
    }
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



  const getVerificationStatus = (isVerified: boolean, role: string) => {
    if (role === 'lawyer') {
      return isVerified ? 
        <Badge className="bg-green-100 text-green-800">✓ Verified</Badge> :
        <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>;
    }
    return null;
  };

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-200 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/home")}
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
              <div className="text-center mb-4">
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.email || "Profile"
                  }
                </h3>
                <div className="flex items-center justify-center space-x-2 mb-3">
                  {user?.role === 'lawyer' ? (
                    <Badge className="bg-green-100 text-green-800">Lawyer</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-800">User</Badge>
                  )}
                  {user?.role === 'lawyer' && user?.isVerified !== undefined && 
                    getVerificationStatus(user.isVerified, user.role)}
                </div>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>

              {/* User Details */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{user?.email || 'No email provided'}</span>
                </div>

                {user?.phoneNumber ? (
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{user.phoneNumber}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 text-sm text-gray-400">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>No phone number provided</span>
                  </div>
                )}
                
                {user?.address ? (
                  <div className="flex items-start space-x-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-gray-700 text-left">{user.address}</span>
                  </div>
                ) : (
                  <div className="flex items-start space-x-3 text-sm text-gray-400">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span>No address provided</span>
                  </div>
                )}

                {user?.role === 'lawyer' && (
                  <>
                    {user?.barNumber ? (
                      <div className="flex items-center space-x-3 text-sm">
                        <Shield className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Bar #: {user.barNumber}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span>No bar number provided</span>
                      </div>
                    )}
                    
                    {user?.specialization ? (
                      <div className="flex items-center space-x-3 text-sm">
                        <Scale className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{user.specialization}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <Scale className="w-4 h-4 text-gray-400" />
                        <span>No specialization provided</span>
                      </div>
                    )}
                    
                    {user?.experience ? (
                      <div className="flex items-center space-x-3 text-sm">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">{user.experience} years experience</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>No experience information provided</span>
                      </div>
                    )}
                  </>
                )}
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
                  <div className="text-2xl font-bold text-secondary">
                    {complaints?.filter((c: Complaint) => c.status === 'resolved').length || 0}
                  </div>
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
