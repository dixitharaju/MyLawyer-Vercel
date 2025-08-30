import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Scale, Shield, MessageSquare, BookOpen, FileText, Menu } from "lucide-react";

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [selectedRole, setSelectedRole] = useState<"user" | "lawyer" | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleGetStarted = () => {
    if (selectedRole) {
      setLocation(`/signup?role=${selectedRole}`);
    } else {
      setLocation("/signup");
    }
  };

  const handleSignIn = () => {
    if (selectedRole) {
      setLocation(`/login?role=${selectedRole}`);
    } else {
      setLocation("/login");
    }
  };

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Logo */}
              <img 
                src="/applogo.png" 
                className="w-10 h-10 rounded-xl object-contain"
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">MyLawyer</h1>
                <p className="text-xs text-gray-500">Legal Help App</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignIn}
                className="text-blue-600 hover:text-blue-700"
              >
                Sign In
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMenu(!showMenu)}
                className="p-2"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {showMenu && (
          <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg border border-gray-200 z-50 w-48">
            <div className="py-2">
              <button
                onClick={handleSignIn}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Hero Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
              Legal Help at Your
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Fingertips
              </span>
            </h1>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Connect with qualified lawyers, get legal advice, and resolve your legal issues 
              with our comprehensive legal assistance platform.
            </p>

            {/* Role Selection */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">I am a:</h3>
              <div className="space-y-3">
                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedRole === "user" 
                      ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedRole("user")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">User</h4>
                        <p className="text-sm text-gray-600">I need legal help</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedRole === "lawyer" 
                      ? "ring-2 ring-blue-500 bg-blue-50 border-blue-200" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedRole("lawyer")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Scale className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">Lawyer</h4>
                        <p className="text-sm text-gray-600">I provide legal services</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleGetStarted}
              >
                Get Started
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleSignIn}
              >
                Sign In
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-6">
            <h2 className="text-lg font-bold text-gray-900 text-center mb-4">What We Offer</h2>
            
            <div className="grid grid-cols-1 gap-3">
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Legal Assistant</h3>
                    <p className="text-sm text-gray-600">Get instant legal guidance</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Connect with Lawyers</h3>
                    <p className="text-sm text-gray-600">Find qualified legal help</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">File Complaints</h3>
                    <p className="text-sm text-gray-600">Submit and track easily</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Legal Library</h3>
                    <p className="text-sm text-gray-600">Access legal resources</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Community Support</h3>
                    <p className="text-sm text-gray-600">Connect with others</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Scale className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Professional Network</h3>
                    <p className="text-sm text-gray-600">Build legal connections</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Beta Features */}
          <div className="text-center bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <Badge variant="secondary" className="mb-2">
              🚀 Beta Features
            </Badge>
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Try Our New Chat System
            </h3>
            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              Experience real-time communication between users and lawyers. 
              Our beta chat system is now available for testing.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full rounded-xl"
              onClick={() => setLocation("/chat")}
            >
              Try Chat System
            </Button>
          </div>
        </main>

        {/* Mobile Footer */}
        <footer className="bg-gray-50 py-4 px-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-600">
              © 2024 MyLawyer. All rights reserved.
            </p>
            <div className="mt-2 space-x-4">
              <button className="text-xs text-blue-600 hover:underline">Privacy</button>
              <button className="text-xs text-blue-600 hover:underline">Terms</button>
              <button className="text-xs text-blue-600 hover:underline">Support</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
