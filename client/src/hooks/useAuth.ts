import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
}

export function useAuth() {
  // Fetch user data from API
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      // Get userId from sessionStorage if available
      const userId = sessionStorage.getItem('userId');
      console.log('useAuth - userId from sessionStorage:', userId);
      const headers: HeadersInit = {};
      
      if (userId) {
        headers['Authorization'] = `Bearer ${userId}`;
      }
      
      console.log('useAuth - Fetching user with headers:', headers);
      const response = await fetch("/api/auth/user", { headers });
      console.log('useAuth - Response status:', response.status);
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      const userData = await response.json();
      console.log('useAuth - User data:', userData);
      return userData;
    },
    retry: false,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user && !error,
    error,
  };
}
