import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Plus, Users } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import BottomNav from "@/components/bottom-nav";
import CommunityPost from "@/components/community-post";

export default function Community() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: posts } = useQuery({
    queryKey: ["/api/community/posts"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest("POST", "/api/community/posts", { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      toast({
        title: "Success",
        description: "Your post has been shared with the community",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          setLocation("/login"); // Use a client-side route for login
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = () => {
    const content = prompt("Share your legal experience or question:");
    if (content && content.trim()) {
      createPostMutation.mutate(content);
    }
  };

  return (
    <div className="mobile-container">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-200 flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">Community</h2>
          <Button
            onClick={handleCreatePost}
            disabled={createPostMutation.isPending}
            className="ml-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            Post
          </Button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome Message */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-gray-800">Community Support</h3>
              </div>
              <p className="text-sm text-gray-600">
                Share your legal experiences, ask questions, and learn from others in the community.
                Remember to keep discussions respectful and avoid sharing sensitive personal information.
              </p>
            </CardContent>
          </Card>

          {/* Community Posts */}
          <div className="space-y-4">
            {Array.isArray(posts) && posts.map((post: any) => (
              <CommunityPost
                key={post.id}
                post={post}
                currentUserId={user?.id}
              />
            )) || (
              <div className="text-center py-8">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">No posts yet</p>
                <Button onClick={handleCreatePost}>
                  Share Your Experience
                </Button>
              </div>
            )}
          </div>
        </main>

        <BottomNav activeTab="community" />
      </div>
    </div>
  );
}
