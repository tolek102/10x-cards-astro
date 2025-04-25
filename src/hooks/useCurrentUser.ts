import { useAuth } from "../components/providers/AuthProvider";

export const useCurrentUser = () => {
  const { user } = useAuth();

  if (!user) {
    throw new Error("User is not authenticated");
  }

  return {
    userId: user.id,
    email: user.email,
  };
}; 