import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, MessageCircle, FileText, BookOpen, Users } from "lucide-react";
import { useLocation } from "wouter";
import Header from "@/components/header";
import BottomNav from "@/components/bottom-nav";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: complaints } = useQuery({
    queryKey: ["/api/complaints"],
    enabled: !!user,
  });

  const { data: conversations } = useQuery({
    queryKey: ["/api/chat/conversations"],
    enabled: !!user,
  });

  const recentComplaints = complaints?.slice(0, 2) || [];
  const recentChats = conversations?.slice(0, 2) || [];

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Welcome Card */}
          <Card className="shadow-sm fade-in">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Welcome, {user?.firstName || 'User'}!
                  </h2>
                  <p className="text-gray-600">How can we help you today?</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setLocation("/chat")}
                  className="bg-primary text-white p-4 rounded-lg text-center hover:bg-blue-700 transition-colors h-auto flex flex-col"
                >
                  <MessageCircle className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">AI Chat</span>
                </Button>
                <Button 
                  onClick={() => setLocation("/complaint")}
                  className="bg-secondary text-white p-4 rounded-lg text-center hover:bg-green-700 transition-colors h-auto flex flex-col"
                >
                  <FileText className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">File Complaint</span>
                </Button>
                <Button 
                  onClick={() => setLocation("/legal")}
                  className="bg-accent text-white p-4 rounded-lg text-center hover:bg-orange-600 transition-colors h-auto flex flex-col"
                >
                  <BookOpen className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Legal Library</span>
                </Button>
                <Button 
                  onClick={() => setLocation("/community")}
                  className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700 transition-colors h-auto flex flex-col"
                >
                  <Users className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Community</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentChats.length > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        {recentChats[0].title || "AI Chat Session"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(recentChats[0].updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {recentComplaints.length > 0 && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        {recentComplaints[0].complaintNumber} - {recentComplaints[0].subject}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(recentComplaints[0].createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {recentChats.length === 0 && recentComplaints.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No recent activity. Start by asking our AI assistant a question!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        <BottomNav activeTab="home" />
      </div>
    </div>
  );
}
