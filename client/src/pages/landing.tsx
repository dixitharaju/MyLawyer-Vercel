import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Users, FileText, MessageCircle, Shield, BookOpen, Sparkles, Zap, Heart, Bot } from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();
  const handleGetStarted = () => {
    setLocation("/chat"); // Go directly to chatbot
  };

  return (
    <div className="mobile-container">
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-cyan-500/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="text-center fade-in relative z-10">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 transform hover:scale-110 mx-auto">
                <Scale className="w-12 h-12 text-white" />
              </div>
              <Sparkles className="w-6 h-6 text-cyan-300 absolute -top-2 -right-2 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-cyan-200 bg-clip-text text-transparent animate-pulse">
              MyLawyer
            </h1>
            <p className="text-xl opacity-95 mb-8 font-medium">Your AI-Powered Legal Companion</p>
            <Button 
              onClick={handleGetStarted}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-500 py-4 px-8 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 hover:-translate-y-1"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Start Chatting Now
            </Button>
            <p className="text-sm opacity-90 mt-4 flex items-center justify-center">
              <Heart className="w-4 h-4 mr-1 text-cyan-300 animate-pulse" />
              Get instant legal guidance 24/7
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">
            Why Choose <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">MyLawyer</span>?
          </h2>
          <div className="space-y-6">
            <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">AI-Powered Legal Assistant</h3>
                    <p className="text-slate-300">Get instant, accurate answers to your legal questions 24/7</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-110">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Smart Complaint Filing</h3>
                    <p className="text-slate-300">Submit and track your legal complaints with intelligent guidance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-110">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Legal Knowledge Hub</h3>
                    <p className="text-slate-300">Access simplified legal information and comprehensive guides</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-sky-500/25 transition-all duration-300 transform hover:scale-110">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Community Support</h3>
                    <p className="text-slate-300">Connect with others and share experiences in our legal community</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="transform hover:scale-105 transition-all duration-300">
              <div className="text-2xl font-bold text-blue-400">10K+</div>
              <div className="text-sm opacity-90">Users Helped</div>
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <div className="text-2xl font-bold text-cyan-400">24/7</div>
              <div className="text-sm opacity-90">AI Support</div>
            </div>
            <div className="transform hover:scale-105 transition-all duration-300">
              <div className="text-2xl font-bold text-indigo-400">100%</div>
              <div className="text-sm opacity-90">Free Access</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-950 text-center">
          <p className="text-sm text-slate-400">
            Empowering citizens with accessible legal support
          </p>
          <p className="text-xs text-slate-500 mt-2">
            © 2024 MyLawyer. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
