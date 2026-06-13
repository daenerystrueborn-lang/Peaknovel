import React, { createContext, useContext, useEffect } from "react";
import { useGetMe } from "@workspace/api-client-react";
import type { AuthUser } from "@workspace/api-client-react";
import { getGetMeQueryKey } from "@workspace/api-client-react";

interface AuthContextType {
  user: AuthUser | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  isLoading: true,
  isAuthenticated: false,
  refetch: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user, isLoading, refetch } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
