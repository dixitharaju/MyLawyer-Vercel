import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Users, FileText, MessageCircle, Shield, BookOpen } from "lucide-react";

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="mobile-container">
      <div className="min-h-screen flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 bg-gradient-to-br from-primary to-blue-700 text-white">
          <div className="text-center fade-in">
            <Scale className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-3xl font-bold mb-4">MyLawyer</h1>
            <p className="text-lg opacity-90 mb-8">AI-Powered Legal Support for All</p>
            <Button 
              onClick={handleGetStarted}
              className="w-full bg-white text-primary hover:bg-gray-100 transition-colors py-3 px-6 rounded-lg font-semibold"
            >
              Get Started
            </Button>
            <p className="text-sm opacity-75 mt-4">Making legal help accessible to everyone</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="p-6 bg-white">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Why Choose MyLawyer?</h2>
          <div className="space-y-4">
            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">AI Legal Assistant</h3>
                    <p className="text-sm text-gray-600">Get instant answers to your legal questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">File Complaints</h3>
                    <p className="text-sm text-gray-600">Submit and track your legal complaints easily</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Legal Library</h3>
                    <p className="text-sm text-gray-600">Access simplified legal information and guides</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Community Support</h3>
                    <p className="text-sm text-gray-600">Connect with others and share experiences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 text-center">
          <p className="text-sm text-gray-600">
            Empowering citizens with accessible legal support
          </p>
        </div>
      </div>
    </div>
  );
}
