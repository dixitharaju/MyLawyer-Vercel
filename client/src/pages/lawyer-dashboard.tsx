import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scale, 
  Users, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  Settings,
  ArrowRight,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Complaint {
  id: string;
  userId: string;
  complaintNumber: string;
  type: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

export default function LawyerDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });
  
  // Redirect to profile if user is not a lawyer
  useEffect(() => {
    if (user && user.role !== 'lawyer') {
      setLocation('/profile');
    }
  }, [user, setLocation]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/lawyer/complaints');
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
        
        // Calculate stats
        const stats = {
          total: data.length,
          pending: data.filter((c: Complaint) => c.status === 'pending').length,
          inProgress: data.filter((c: Complaint) => c.status === 'in_progress').length,
          resolved: data.filter((c: Complaint) => c.status === 'resolved').length
        };
        setStats(stats);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch complaints",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast({
        title: "Error",
        description: "Failed to load complaints",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/lawyer/complaints/${complaintId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Complaint status updated successfully",
        });
        fetchComplaints(); // Refresh the list
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update complaint status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-xs">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-xs">Low</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{priority}</Badge>;
    }
  };

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Scale className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Lawyer Dashboard</h1>
                <p className="text-xs text-gray-500">Manage legal cases</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/profile")}
              className="p-2"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Lawyer Profile Card */}
          {user && (
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    {user.profileImageUrl ? (
                      <img 
                        src={user.profileImageUrl} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Scale className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.email || "Lawyer"}
                    </h3>
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className="bg-green-100 text-green-800">Lawyer</Badge>
                      {user.isVerified !== undefined && (
                        user.isVerified ? 
                          <Badge className="bg-green-100 text-green-800">✓ Verified</Badge> :
                          <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending Verification</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{user.specialization || "General Practice"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Stats Cards */}
          {/* Lawyer Details Card */}
          {user && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Lawyer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium">{user.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Specialization</p>
                    <p className="text-sm font-medium">{user.specialization || 'General Practice'}</p>
                  </div>
                  <div>
                     <p className="text-xs text-gray-500">Bar Number</p>
                     <p className="text-sm font-medium">{user.barNumber || 'Not provided'}</p>
                   </div>
                   <div>
                     <p className="text-xs text-gray-500">Experience</p>
                     <p className="text-sm font-medium">{user.experience ? `${user.experience} years` : 'Not provided'}</p>
                   </div>
                   <div className="col-span-2">
                     <p className="text-xs text-gray-500">Address</p>
                     <p className="text-sm font-medium">{user.address || 'Not provided'}</p>
                   </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Total Cases</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Pending</p>
                  <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">In Progress</p>
                  <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">Resolved</p>
                  <p className="text-xl font-bold text-green-600">{stats.resolved}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs">Pending</TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs">Active</TabsTrigger>
              <TabsTrigger value="resolved" className="text-xs">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading complaints...</p>
                </div>
              ) : complaints.length === 0 ? (
                <Card className="p-6 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Complaints Yet</h3>
                  <p className="text-sm text-gray-600">When users file complaints, they will appear here.</p>
                </Card>
              ) : (
                complaints.map((complaint) => (
                  <Card key={complaint.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{complaint.subject}</h3>
                            {getPriorityBadge(complaint.priority)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{complaint.description.substring(0, 100)}...</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>#{complaint.complaintNumber}</span>
                            <span>•</span>
                            <span>{complaint.type}</span>
                            <span>•</span>
                            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="ml-3">
                          {getStatusBadge(complaint.status)}
                        </div>
                      </div>
                      
                      {complaint.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(complaint.id, 'in_progress')}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            Start Working
                          </Button>
                        </div>
                      )}
                      
                      {complaint.status === 'in_progress' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(complaint.id, 'pending')}
                            className="flex-1"
                          >
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            Mark Resolved
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-3">
              {complaints.filter(c => c.status === 'pending').map((complaint) => (
                <Card key={complaint.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{complaint.subject}</h3>
                          {getPriorityBadge(complaint.priority)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{complaint.description.substring(0, 100)}...</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>#{complaint.complaintNumber}</span>
                          <span>•</span>
                          <span>{complaint.type}</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        {getStatusBadge(complaint.status)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(complaint.id, 'in_progress')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Start Working
                    </Button>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-3">
              {complaints.filter(c => c.status === 'in_progress').map((complaint) => (
                <Card key={complaint.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{complaint.subject}</h3>
                          {getPriorityBadge(complaint.priority)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{complaint.description.substring(0, 100)}...</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>#{complaint.complaintNumber}</span>
                          <span>•</span>
                          <span>{complaint.type}</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        {getStatusBadge(complaint.status)}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(complaint.id, 'pending')}
                        className="flex-1"
                      >
                        Pause
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(complaint.id, 'resolved')}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="resolved" className="space-y-3">
              {complaints.filter(c => c.status === 'resolved').map((complaint) => (
                <Card key={complaint.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{complaint.subject}</h3>
                          {getPriorityBadge(complaint.priority)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{complaint.description.substring(0, 100)}...</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>#{complaint.complaintNumber}</span>
                          <span>•</span>
                          <span>{complaint.type}</span>
                          <span>•</span>
                          <span>Resolved: {new Date(complaint.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-3">
                        {getStatusBadge(complaint.status)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-around">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/home")}
              className="flex flex-col items-center space-y-1 p-2"
            >
              <Users className="w-5 h-5" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/chat")}
              className="flex flex-col items-center space-y-1 p-2"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">Chat</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/legal-library")}
              className="flex flex-col items-center space-y-1 p-2"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-xs">Library</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/profile")}
              className="flex flex-col items-center space-y-1 p-2"
            >
              <Settings className="w-5 h-5" />
              <span className="text-xs">Profile</span>
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
}