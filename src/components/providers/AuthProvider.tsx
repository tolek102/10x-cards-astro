import { createContext, useContext, useState } from "react";
import type { UserDto } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

interface AuthContextType {
  user: UserDto | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserDto | null>({
    id: DEFAULT_USER_ID,
    email: "demo@example.com",
    created_at: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Commented out authentication check - will be restored later with Supabase Auth
  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       const response = await fetch("/api/me");
  //       if (response.ok) {
  //         const userData = await response.json();
  //         setUser(userData);
  //       }
  //     } catch (err) {
  //       setError("Failed to check authentication status");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   checkAuth();
  // }, []);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Temporarily always set default user
      setUser({
        id: DEFAULT_USER_ID,
        email: email,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, _password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Temporarily always set default user
      setUser({
        id: DEFAULT_USER_ID,
        email: email,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to logout");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (_email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Temporarily do nothing
      console.log("Reset password temporarily disabled");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
