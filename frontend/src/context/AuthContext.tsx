import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { authService } from '@/services/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const response = await authService.getCurrentUser();
          setUser(response.data.data);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const { tokens, user: newUser } = response.data.data;
    localStorage.setItem('token', tokens.access);
    if (tokens.refresh) {
      localStorage.setItem('refreshToken', tokens.refresh);
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    setToken(tokens.access);
    setUser(newUser);
  };

  const register = async (email: string, password: string, username: string) => {
    const response = await authService.register(email, username, password);
    const { tokens, user: newUser } = response.data.data;
    localStorage.setItem('token', tokens.access);
    if (tokens.refresh) {
      localStorage.setItem('refreshToken', tokens.refresh);
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    setToken(tokens.access);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
