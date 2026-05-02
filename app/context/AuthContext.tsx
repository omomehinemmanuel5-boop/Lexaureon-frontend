/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: null | { email: string; plan: string };
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, company: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<null | { email: string; plan: string }>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setUser({ email, plan: 'free' });
    setToken('demo-token');
  };

  const register = async (email: string, password: string, company: string) => {
    setUser({ email, plan: 'free' });
    setToken('demo-token');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
