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
  getByProject: (projectId: string) => api.get(`/projects/${projectId}/comments`),
  create: (projectId: string, data: any) => api.post(`/projects/${projectId}/comments`, data),
  update: (commentId: string, data: any) => api.put(`/comments/${commentId}`, data),
  delete: (commentId: string) => api.delete(`/comments/${commentId}`),
  voteComment: (commentId: string, voteType: 'up' | 'down') =>
    api.post(`/comments/${commentId}/vote`, { voteType }),
};

// Badges
export const badgesService = {
  award: (projectId: string, data: any) => api.post(`/projects/${projectId}/badges`, data),
  getByProject: (projectId: string) => api.get(`/projects/${projectId}/badges`),
};

// Users
export const usersService = {
  getById: (id: string) => api.get(`/users/${id}`),
  getByUsername: (username: string) => api.get(`/users/username/${username}`),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  getProfile: () => api.get('/auth/me'),
};

// Wallet & Verification
export const walletService = {
  verifyCert: (walletAddress: string) => api.post('/blockchain/verify-cert', { wallet_address: walletAddress }),
  connectWallet: (id: string, walletAddress: string) =>
    api.put(`/users/${id}`, { wallet_address: walletAddress }),
};

// Intro Requests
export const introsService = {
  create: (data: any) => api.post('/intros', data),
  getReceived: () => api.get('/intros/received'),
  getSent: () => api.get('/intros/sent'),
  accept: (id: string) => api.post(`/intros/${id}/accept`),
  decline: (id: string) => api.post(`/intros/${id}/decline`),
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
