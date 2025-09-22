import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Settings,
  Bell,
  Shield,
  LogOut,
  Save,
  MessageCircle,
  Clock,
  FileText,
  HelpCircle
} from 'lucide-react';

export default function LawyerSetting() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Redirect to dashboard if user is not a lawyer
  useEffect(() => {
    if (user && user.role !== 'lawyer') {
      window.location.href = '/home';
    }
  }, [user]);

  const [profile, setProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: '',
    barNumber: '',
    specialization: '',
    experience: '',
    bio: '',
    address: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    newCaseAlerts: true,
    messageAlerts: true,
    statusUpdates: true
  });

  const [availability, setAvailability] = useState({
    availableForNewCases: true,
    autoAcceptCases: false,
    workingHours: '9:00 AM - 5:00 PM',
    workingDays: 'Monday - Friday'
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAvailabilityChange = (key: keyof typeof availability) => {
    if (typeof availability[key] === 'boolean') {
      setAvailability(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile settings have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      // Clear user ID from sessionStorage
      sessionStorage.removeItem('userId');
      window.location.href = "/";
    } catch (error) {
      console.error('Logout failed', error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-900 via-blue-900/20 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation('/lawyer-dashboard')}
            className="text-white hover:text-blue-300"
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Profile Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-gray-300">{user?.email}</p>
                <p className="text-xs text-blue-300">Lawyer</p>
              </div>
            </div>

            <Separator className="bg-white/10" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="text-white">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-white">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleProfileChange}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="bg-white/10 border-white/20 text-white"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber" className="text-white">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleProfileChange}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="barNumber" className="text-white">Bar Number</Label>
                <Input
                  id="barNumber"
                  name="barNumber"
                  value={profile.barNumber}
                  onChange={handleProfileChange}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="specialization" className="text-white">Specialization</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleProfileChange}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="bio" className="text-white">Professional Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleProfileChange}
                  className="bg-white/10 border-white/20 text-white h-24"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address" className="text-white">Office Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleProfileChange}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Profile Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Notification Settings</h2>
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Email Notifications</p>
                  <p className="text-xs text-gray-400">Receive email updates</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={() => handleNotificationChange('emailNotifications')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">New Case Alerts</p>
                  <p className="text-xs text-gray-400">Get notified when new cases are assigned</p>
                </div>
                <Switch
                  checked={notifications.newCaseAlerts}
                  onCheckedChange={() => handleNotificationChange('newCaseAlerts')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Message Alerts</p>
                  <p className="text-xs text-gray-400">Notifications for new messages</p>
                </div>
                <Switch
                  checked={notifications.messageAlerts}
                  onCheckedChange={() => handleNotificationChange('messageAlerts')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Status Updates</p>
                  <p className="text-xs text-gray-400">Get notified when case status changes</p>
                </div>
                <Switch
                  checked={notifications.statusUpdates}
                  onCheckedChange={() => handleNotificationChange('statusUpdates')}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Availability Settings</h2>
            </div>

            <Separator className="bg-white/10" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Available for New Cases</p>
                  <p className="text-xs text-gray-400">Toggle your availability for new cases</p>
                </div>
                <Switch
                  checked={availability.availableForNewCases}
                  onCheckedChange={() => handleAvailabilityChange('availableForNewCases')}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Auto-Accept Cases</p>
                  <p className="text-xs text-gray-400">Automatically accept new case assignments</p>
                </div>
                <Switch
                  checked={availability.autoAcceptCases}
                  onCheckedChange={() => handleAvailabilityChange('autoAcceptCases')}
                />
              </div>
              
              <div>
                <Label htmlFor="workingHours" className="text-white">Working Hours</Label>
                <Input
                  id="workingHours"
                  name="workingHours"
                  value={availability.workingHours}
                  onChange={(e) => setAvailability(prev => ({ ...prev, workingHours: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="workingDays" className="text-white">Working Days</Label>
                <Input
                  id="workingDays"
                  name="workingDays"
                  value={availability.workingDays}
                  onChange={(e) => setAvailability(prev => ({ ...prev, workingDays: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold text-white">Security</h2>
            </div>

            <Separator className="bg-white/10" />

            <Button 
              variant="outline" 
              className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/lawyer-dashboard")}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/lawyer-chat")}
            className="flex flex-col items-center space-y-1 p-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-xs">Chat</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/lawyer-setting")}
            className="flex flex-col items-center space-y-1 p-2 text-blue-600"
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs">Settings</span>
          </Button>
        </div>
      </nav>
    </div>
  );
}