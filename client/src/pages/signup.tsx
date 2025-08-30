import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Users, ArrowLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const role = new URLSearchParams(window.location.search).get("role") as "user" | "lawyer" || "user";
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    // Lawyer-specific fields
    barNumber: "",
    specialization: "",
    experience: "",
    // Common fields
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (role === "lawyer" && (!formData.barNumber || !formData.specialization)) {
      toast({
        title: "Error",
        description: "Please fill in all required lawyer fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Call the signup API
      const response = await fetch('/api/auth/signup', {
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
        throw new Error(result.error || 'Signup failed');
      }
      
      toast({
        title: "Success!",
        description: `Welcome to LawyerConnect! Your ${role} account has been created.`,
      });

      // Redirect to login
      setTimeout(() => {
        setLocation(`/login?role=${role}`);
      }, 1500);
      
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                  {role === "lawyer" ? "Lawyer" : "User"} Signup
                </h1>
                <p className="text-xs text-gray-500">Create your account</p>
              </div>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Mobile Form */}
        <main className="flex-1 overflow-y-auto p-4">
          <Card className="shadow-sm border-0">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Basic Information</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        className="mt-1 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        className="mt-1 rounded-lg"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="mt-1 rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1 rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your address"
                      rows={3}
                      className="mt-1 rounded-lg resize-none"
                    />
                  </div>
                </div>

                {/* Lawyer-specific fields */}
                {role === "lawyer" && (
                  <div className="space-y-4 border-t pt-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Professional Information</h3>
                    
                    <div>
                      <Label htmlFor="barNumber" className="text-sm font-medium">Bar Number *</Label>
                      <Input
                        id="barNumber"
                        value={formData.barNumber}
                        onChange={(e) => handleInputChange("barNumber", e.target.value)}
                        placeholder="Enter your bar association number"
                        className="mt-1 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="specialization" className="text-sm font-medium">Legal Specialization *</Label>
                      <Select
                        value={formData.specialization}
                        onValueChange={(value) => handleInputChange("specialization", value)}
                      >
                        <SelectTrigger className="mt-1 rounded-lg">
                          <SelectValue placeholder="Select specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Civil Law">Civil Law</SelectItem>
                          <SelectItem value="Criminal Law">Criminal Law</SelectItem>
                          <SelectItem value="Family Law">Family Law</SelectItem>
                          <SelectItem value="Corporate Law">Corporate Law</SelectItem>
                          <SelectItem value="Labor Law">Labor Law</SelectItem>
                          <SelectItem value="Property Law">Property Law</SelectItem>
                          <SelectItem value="Constitutional Law">Constitutional Law</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="experience" className="text-sm font-medium">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={formData.experience}
                        onChange={(e) => handleInputChange("experience", e.target.value)}
                        placeholder="5"
                        min="0"
                        className="mt-1 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Password fields */}
                <div className="space-y-4 border-t pt-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Security</h3>
                  
                  <div>
                    <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="mt-1 rounded-lg"
                      required
                      minLength={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="mt-1 rounded-lg"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 text-base font-semibold rounded-xl mt-6"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    `Create ${role === "lawyer" ? "Lawyer" : "User"} Account`
                  )}
                </Button>
              </form>

              {/* Login link */}
              <div className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setLocation(`/login?role=${role}`)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in here
                </button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
} 