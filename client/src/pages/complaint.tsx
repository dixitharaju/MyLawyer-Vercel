import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNav from "@/components/bottom-nav";
import ComplaintForm from "@/components/complaint-form";

export default function Complaint() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"form" | "list">("form");
  const { toast } = useToast();

  const { data: complaints = [] } = useQuery<any[]>({
    queryKey: ["/api/complaints"],
    enabled: !!user,
    // Add refetch interval to dynamically update complaints when changed by admin
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    return status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase());
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
          <h2 className="text-xl font-semibold text-gray-800">Complaints</h2>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 flex">
          <Button
            variant={activeTab === "form" ? "default" : "ghost"}
            onClick={() => setActiveTab("form")}
            className="flex-1 rounded-none"
          >
            File Complaint
          </Button>
          <Button
            variant={activeTab === "list" ? "default" : "ghost"}
            onClick={() => setActiveTab("list")}
            className="flex-1 rounded-none"
          >
            My Complaints
          </Button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "form" && <ComplaintForm />}

          {activeTab === "list" && (
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-800 mb-3">My Complaints</h3>
                <div className="space-y-3">
                  {complaints?.length > 0 ? complaints.map((complaint) => (
                    <div key={complaint.id} className="border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-800">
                          {complaint.complaintNumber} - {complaint.subject}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getStatusColor(complaint.status)}`}>
                          {formatStatus(complaint.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{complaint.description}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Filed: {new Date(complaint.createdAt).toLocaleDateString()}
                        </p>
                        <span className="text-xs text-gray-500">
                          Type: {complaint.type}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 mb-4">No complaints filed yet</p>
                      <Button onClick={() => setActiveTab("form")}>
                        File Your First Complaint
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </main>

        <BottomNav activeTab="complaint" />
      </div>
    </div>
  );
}
