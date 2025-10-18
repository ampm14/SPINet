import React, { createContext, useContext, useState, ReactNode } from "react";

type User = { id: string; name: string } | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  signIn: (user: User) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(false);

  async function signIn(newUser: User) {
    setLoading(true);
    // placeholder for real auth work (API call, token storage, etc.)
    // keep this async so you can await real calls later
    setUser(newUser);
    setLoading(false);
  }

  function signOut() {
    // clear user/token here when you add real auth
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}

export default AuthProvider;
