import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Heart, MessageCircle, Share } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface CommunityPostProps {
  post: {
    id: number;
    userId: string;
    content: string;
    likesCount: number;
    commentsCount: number;
    createdAt: string;
  };
  currentUserId?: string;
}

export default function CommunityPost({ post, currentUserId }: CommunityPostProps) {
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/community/posts/${post.id}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/posts"] });
      setLiked(!liked);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please login to like posts",
        variant: "destructive",
      });
      return;
    }
    likeMutation.mutate();
  };

  const handleComment = () => {
    if (!currentUserId) {
      toast({
        title: "Login Required",
        description: "Please login to comment",
        variant: "destructive",
      });
      return;
    }
    
    const comment = prompt("Add a comment:");
    if (comment && comment.trim()) {
      // This would need to be implemented in the backend
      toast({
        title: "Coming Soon",
        description: "Comment feature will be available soon",
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "MyLawyer Community Post",
        text: post.content,
        url: window.location.href,
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(post.content);
      toast({
        title: "Copied!",
        description: "Post content copied to clipboard",
      });
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-800">Community Member</h4>
            <p className="text-sm text-gray-500">
              {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <p className="text-gray-800 mb-3">{post.content}</p>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className={`flex items-center space-x-1 hover:text-primary transition-colors ${
              liked ? "text-red-500" : ""
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            <span>{post.likesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleComment}
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{post.commentsCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <Share className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
