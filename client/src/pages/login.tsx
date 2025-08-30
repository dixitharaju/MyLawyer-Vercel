import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Scale, Users, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const role = new URLSearchParams(window.location.search).get("role") as "user" | "lawyer" || "user";
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }
      
      // Store user ID in session storage for persistence
      if (result.user && result.user.id) {
        sessionStorage.setItem('userId', result.user.id);
      }
      
      toast({
        title: "Welcome back!",
        description: `Successfully logged in as ${role}`,
      });

      // Redirect based on role
      setTimeout(() => {
        if (role === "lawyer") {
          setLocation("/lawyer-dashboard");
        } else {
          setLocation("/home");
        }
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleSwitch = (newRole: string) => {
    setLocation(`/login?role=${newRole}`);
  };

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                role === "lawyer" ? "bg-green-100" : "bg-blue-100"
              }`}>
                {role === "lawyer" ? (
                  <Scale className="w-6 h-6 text-green-600" />
                ) : (
                  <Users className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {role === "lawyer" ? "Lawyer" : "User"} Login
                </h1>
                <p className="text-xs text-gray-500">Sign in to your account</p>
              </div>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Mobile Form */}
        <main className="flex-1 overflow-y-auto p-4">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              {/* Role switcher */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  onClick={() => handleRoleSwitch("user")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    role === "user"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-2" />
                  User
                </button>
                <button
                  onClick={() => handleRoleSwitch("lawyer")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    role === "lawyer"
                      ? "bg-white text-green-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Scale className="w-4 h-4 inline mr-2" />
                  Lawyer
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    className="mt-1 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Enter your password"
                      className="rounded-lg pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 text-base font-semibold rounded-xl mt-6"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    `Sign in as ${role === "lawyer" ? "Lawyer" : "User"}`
                  )}
                </Button>
              </form>

              {/* Signup link */}
              <div className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setLocation(`/signup?role=${role}`)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign up here
                </button>
              </div>

              {/* Beta features notice */}
              <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800 text-center">
                  🚀 <strong>Beta:</strong> Try our new chat system for real-time communication between users and lawyers!
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}