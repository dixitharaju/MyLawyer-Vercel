import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, MessageCircle, FileText, BookOpen, Users, Sparkles, TrendingUp, Clock, Bot, Scale } from "lucide-react";
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

  const recentComplaints = Array.isArray(complaints) ? complaints.slice(0, 2) : [];
  const recentChats = Array.isArray(conversations) ? conversations.slice(0, 2) : [];

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-slate-900 via-blue-900/20 to-slate-900">
          {/* Welcome Card */}
          <Card className="shadow-2xl border-none bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white fade-in hover:shadow-blue-500/25 transition-all duration-500">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm hover:scale-110 transition-all duration-300">
                  <Scale className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">
                    Welcome back, {(user as any)?.firstName || 'User'}! 👋
                  </h2>
                  <p className="text-blue-100">Ready to get legal help from your AI assistant?</p>
                </div>
                <Sparkles className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-2xl border-none bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 transition-all duration-500">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-500 animate-pulse" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setLocation("/chat")}
                  className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl text-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-500 h-auto flex flex-col shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 hover:-translate-y-1"
                >
                  <Bot className="w-8 h-8 mb-3" />
                  <span className="text-sm font-bold">AI Chat</span>
                  <span className="text-xs opacity-90 mt-1">Get instant help</span>
                </Button>
                <Button 
                  onClick={() => setLocation("/complaint")}
                  className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-6 rounded-xl text-center hover:from-cyan-600 hover:to-blue-700 transition-all duration-500 h-auto flex flex-col shadow-lg hover:shadow-2xl hover:shadow-cyan-500/25 transform hover:scale-105 hover:-translate-y-1"
                >
                  <FileText className="w-8 h-8 mb-3" />
                  <span className="text-sm font-bold">File Complaint</span>
                  <span className="text-xs opacity-90 mt-1">Submit your case</span>
                </Button>
                <Button 
                  onClick={() => setLocation("/legal")}
                  className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-6 rounded-xl text-center hover:from-indigo-600 hover:to-purple-700 transition-all duration-500 h-auto flex flex-col shadow-lg hover:shadow-2xl hover:shadow-indigo-500/25 transform hover:scale-105 hover:-translate-y-1"
                >
                  <BookOpen className="w-8 h-8 mb-3" />
                  <span className="text-sm font-bold">Legal Library</span>
                  <span className="text-xs opacity-90 mt-1">Browse resources</span>
                </Button>
                <Button 
                  onClick={() => setLocation("/community")}
                  className="bg-gradient-to-br from-sky-500 to-blue-600 text-white p-6 rounded-xl text-center hover:from-sky-600 hover:to-blue-700 transition-all duration-500 h-auto flex flex-col shadow-lg hover:shadow-2xl hover:shadow-sky-500/25 transform hover:scale-105 hover:-translate-y-1"
                >
                  <Users className="w-8 h-8 mb-3" />
                  <span className="text-sm font-bold">Community</span>
                  <span className="text-xs opacity-90 mt-1">Connect & share</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-2xl border-none bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 transition-all duration-500">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentChats.length > 0 && (
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-xl border border-blue-700/30 hover:border-blue-600/50 transition-all duration-300 transform hover:scale-105">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {recentChats[0].title || "AI Chat Session"}
                      </p>
                      <p className="text-xs text-blue-200 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(recentChats[0].updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                  </div>
                )}
                
                {recentComplaints.length > 0 && (
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-cyan-900/50 to-blue-900/50 rounded-xl border border-cyan-700/30 hover:border-cyan-600/50 transition-all duration-300 transform hover:scale-105">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-110">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-white">
                        {recentComplaints[0].complaintNumber} - {recentComplaints[0].subject}
                      </p>
                      <p className="text-xs text-cyan-200 flex items-center mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(recentComplaints[0].createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  </div>
                )}

                {recentChats.length === 0 && recentComplaints.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-slate-300 font-medium">No recent activity</p>
                    <p className="text-sm text-slate-400 mt-1">Start by chatting with our AI assistant!</p>
                    <Button 
                      onClick={() => setLocation("/chat")}
                      className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
                    >
                      Start Chat
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="shadow-2xl border-none bg-gradient-to-r from-slate-800 to-slate-900 text-white hover:shadow-blue-500/25 transition-all duration-500">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Your Progress</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="transform hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-blue-400">{Array.isArray(conversations) ? conversations.length : 0}</div>
                  <div className="text-xs opacity-80">Chat Sessions</div>
                </div>
                <div className="transform hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-cyan-400">{Array.isArray(complaints) ? complaints.length : 0}</div>
                  <div className="text-xs opacity-80">Complaints Filed</div>
                </div>
                <div className="transform hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-indigo-400">24/7</div>
                  <div className="text-xs opacity-80">AI Support</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        <BottomNav activeTab="home" />
      </div>
    </div>
  );
}
