import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses and errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Handle 401 Unauthorized - try to refresh token
    if (error.response?.status === 401 && !config._retry) {
      config._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });

          if (response.data?.access_token) {
            localStorage.setItem('token', response.data.access_token);
            api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
            config.headers['Authorization'] = `Bearer ${response.data.access_token}`;
            return api(config);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    // Handle other error statuses
    if (error.response?.status === 403) {
      error.message = 'You do not have permission to perform this action';
    } else if (error.response?.status === 404) {
      error.message = 'Resource not found';
    } else if (error.response?.status === 500) {
      error.message = 'Server error. Please try again later';
    }

    return Promise.reject(error);
  }
);

// Projects
export const projectsService = {
  getAll: (sort: string = 'hot', page: number = 1) =>
    api.get(`/projects?sort=${sort}&page=${page}`),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  getByUser: (userId: string) => api.get(`/users/${userId}/projects`),
};

// Voting
export const votesService = {
  upvote: (projectId: string) => api.post(`/projects/${projectId}/upvote`),
  downvote: (projectId: string) => api.post(`/projects/${projectId}/downvote`),
  removeVote: (projectId: string) => api.delete(`/projects/${projectId}/vote`),
};

// Comments
export const commentsService = {
  getByProject: (projectId: string) => api.get(`/comments?project_id=${projectId}`),
  create: (data: any) => api.post('/comments', data),
  update: (commentId: string, data: any) => api.put(`/comments/${commentId}`, data),
  delete: (commentId: string) => api.delete(`/comments/${commentId}`),
};

// Badges
export const badgesService = {
  award: (data: any) => api.post('/badges/award', data),
  getByProject: (projectId: string) => api.get(`/badges/${projectId}`),
};

// Users
export const usersService = {
  getByUsername: (username: string) => api.get(`/users/${username}`),
  update: (data: any) => api.put('/users/profile', data),
  getProfile: () => api.get('/auth/me'),
  getStats: () => api.get('/users/stats'),
};

// Wallet & Verification
export const walletService = {
  verifyCert: (walletAddress: string) => api.post('/blockchain/verify-cert', { wallet_address: walletAddress }),
  getCertInfo: (walletAddress: string) => api.get(`/blockchain/cert-info/${walletAddress}`),
  checkHealth: () => api.get('/blockchain/health'),
};

// Authentication
export const authService = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, username: string, password: string, display_name?: string) =>
    api.post('/auth/register', { email, username, password, display_name }),
  getCurrentUser: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

// File Upload
export const uploadService = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  testConnection: () => api.get('/upload/test'),
};

// Intro Requests
export const introsService = {
  create: (data: any) => api.post('/intros/request', data),
  getReceived: () => api.get('/intros/received'),
  getSent: () => api.get('/intros/sent'),
  accept: (id: string) => api.put(`/intros/${id}/accept`),
  decline: (id: string) => api.put(`/intros/${id}/decline`),
};

// Search & Leaderboard
export const searchService = {
  search: (query: string, type?: string) =>
    api.get(`/search?q=${query}${type ? `&type=${type}` : ''}`),
};

export const leaderboardService = {
  getProjects: (timeframe: string = 'month') => api.get(`/leaderboard/projects?timeframe=${timeframe}`),
  getBuilders: (timeframe: string = 'month') => api.get(`/leaderboard/builders?timeframe=${timeframe}`),
  getFeatured: () => api.get('/leaderboard/featured'),
};

export default api;
