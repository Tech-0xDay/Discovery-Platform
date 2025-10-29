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
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Helper to transform backend user data
  const transformUser = (backendUser: any): User => {
    console.log('🔍 AuthContext transformUser - Backend user data:', backendUser);

    const transformed = {
      id: backendUser.id,
      username: backendUser.username,
      email: backendUser.email,
      displayName: backendUser.display_name,
      display_name: backendUser.display_name,
      avatar: backendUser.avatar_url,
      avatar_url: backendUser.avatar_url,
      bio: backendUser.bio,
      isVerified: backendUser.email_verified || false,
      email_verified: backendUser.email_verified || false,
      isAdmin: backendUser.is_admin || false,
      is_admin: backendUser.is_admin || false,
      is_investor: backendUser.is_investor || false,
      is_validator: backendUser.is_validator || false,
      walletAddress: backendUser.wallet_address,
      wallet_address: backendUser.wallet_address,
      full_wallet_address: backendUser.full_wallet_address,
      hasOxcert: backendUser.has_oxcert || false,
      has_oxcert: backendUser.has_oxcert || false,
      oxcert_tx_hash: backendUser.oxcert_tx_hash,
      oxcert_token_id: backendUser.oxcert_token_id,
      oxcert_metadata: backendUser.oxcert_metadata,
      github_username: backendUser.github_username,
      github_connected: backendUser.github_connected || false,
      karma: backendUser.karma || 0,
      createdAt: backendUser.created_at,
      created_at: backendUser.created_at,
      updatedAt: backendUser.updated_at,
      updated_at: backendUser.updated_at,
    };

    console.log('✅ AuthContext transformUser - Transformed user:', {
      username: transformed.username,
      is_investor: transformed.is_investor,
      is_admin: transformed.is_admin,
      is_validator: transformed.is_validator
    });

    return transformed;
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const response = await authService.getCurrentUser();
          setUser(transformUser(response.data.data));
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
    console.log('🔐 AuthContext.login - Starting login process');
    const response = await authService.login(email, password);
    console.log('🔐 AuthContext.login - Response received:', {
      status: response.status,
      dataStructure: Object.keys(response.data),
      fullData: response.data
    });

    const { tokens, user: newUser } = response.data.data;
    console.log('🔐 AuthContext.login - Extracted tokens and user:', {
      hasTokens: !!tokens,
      hasAccess: !!tokens?.access,
      userName: newUser?.username
    });

    localStorage.setItem('token', tokens.access);
    if (tokens.refresh) {
      localStorage.setItem('refreshToken', tokens.refresh);
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    setToken(tokens.access);
    setUser(transformUser(newUser));
    console.log('✅ AuthContext.login - Login successful');
  };

  const register = async (email: string, password: string, username: string) => {
    console.log('🔐 AuthContext.register - Starting registration process');
    const response = await authService.register(email, username, password);
    console.log('🔐 AuthContext.register - Response received:', {
      status: response.status,
      dataStructure: Object.keys(response.data),
      fullData: response.data
    });

    const { tokens, user: newUser } = response.data.data;
    console.log('🔐 AuthContext.register - Extracted tokens and user:', {
      hasTokens: !!tokens,
      hasAccess: !!tokens?.access,
      userName: newUser?.username
    });

    localStorage.setItem('token', tokens.access);
    if (tokens.refresh) {
      localStorage.setItem('refreshToken', tokens.refresh);
    }
    axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access}`;
    setToken(tokens.access);
    setUser(transformUser(newUser));
    console.log('✅ AuthContext.register - Registration successful');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        const response = await authService.getCurrentUser();
        setUser(transformUser(response.data.data));
      } catch (error) {
        console.error('Failed to refresh user:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshUser, isLoading }}>
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
