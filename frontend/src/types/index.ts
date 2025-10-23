export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  isVerified: boolean;
  isAdmin: boolean;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  demoUrl?: string;
  githubUrl?: string;
  hackathonName: string;
  hackathonDate: string;
  techStack: string[];
  screenshots: string[];
  authorId: string;
  author: User;
  proofScore: ProofScore;
  badges: Badge[];
  voteCount: number;
  commentCount: number;
  userVote?: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProofScore {
  total: number;
  verification: number;
  community: number;
  validation: number;
  quality: number;
}

export interface Badge {
  id: string;
  type: 'silver' | 'gold' | 'platinum';
  name: string;
  description: string;
  awardedBy: User;
  awardedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  projectId: string;
  parentId?: string;
  replies?: Comment[];
  voteCount: number;
  userVote?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IntroRequest {
  id: string;
  fromUser: User;
  toUser: User;
  project: Project;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  user?: User;
  project?: Project;
  score: number;
}

export type SortType = 'hot' | 'new' | 'top';
export type TimeFilter = 'week' | 'month' | 'all';
