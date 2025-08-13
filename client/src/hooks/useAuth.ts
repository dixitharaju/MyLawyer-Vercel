import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  // Always authenticated - no auth logic for now
  const mockUser = {
    id: "user-1",
    email: "user@example.com",
    firstName: "User",
    lastName: "Demo",
    profileImageUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
  };
}
