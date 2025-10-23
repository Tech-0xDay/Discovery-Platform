export interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
  display_name?: string; // Backend field
  avatar?: string;
  avatar_url?: string; // Backend field
  bio?: string;
  isVerified?: boolean;
  email_verified?: boolean; // Backend field
  isAdmin?: boolean;
  is_admin?: boolean; // Backend field
  walletAddress?: string;
  wallet_address?: string; // Backend field (truncated)
  full_wallet_address?: string; // Full wallet address for explorer links
  hasOxcert?: boolean;
  has_oxcert?: boolean; // Backend field
  oxcert_tx_hash?: string;
  oxcert_token_id?: string;
  oxcert_metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  github_username?: string;
  github_connected?: boolean;
  karma?: number;
  createdAt?: string;
  created_at?: string; // Backend field
  updatedAt?: string;
  updated_at?: string; // Backend field
}

export interface TeamMember {
  name: string;
  role?: string;
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
  teamMembers?: TeamMember[];
  team_members?: TeamMember[]; // Backend field
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
