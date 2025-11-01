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
  is_investor?: boolean; // Backend field
  is_validator?: boolean; // Backend field
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
  avatar?: string;
  avatar_url?: string;
  image?: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  // Extended project information
  project_story?: string; // Backend field - Project journey
  inspiration?: string; // Backend field - What inspired the project
  pitch_deck_url?: string; // Backend field - Link to pitch deck
  market_comparison?: string; // Backend field - Market landscape
  novelty_factor?: string; // Backend field - What makes it unique
  categories?: string[]; // Backend field - Project categories
  // URLs
  demoUrl?: string;
  demo_url?: string; // Backend field
  githubUrl?: string;
  github_url?: string; // Backend field
  // Hackathon info
  hackathonName: string;
  hackathon_name?: string; // Backend field
  hackathonDate: string;
  hackathon_date?: string; // Backend field
  // Arrays
  techStack: string[];
  tech_stack?: string[]; // Backend field
  teamMembers?: TeamMember[];
  team_members?: TeamMember[]; // Backend field
  screenshots: string[];
  // Relations
  authorId: string;
  user_id?: string; // Backend field
  author: User;
  creator?: User; // Backend field
  // Scores and badges
  proofScore: ProofScore;
  proof_score?: ProofScore; // Backend field
  badges: Badge[];
  // Engagement metrics
  voteCount: number;
  vote_count?: number; // Backend field
  commentCount: number;
  comment_count?: number; // Backend field
  viewCount?: number;
  view_count?: number; // Backend field
  shareCount?: number;
  share_count?: number; // Backend field
  // Votes
  userVote?: 'up' | 'down' | null;
  user_vote?: 'up' | 'down' | null; // Backend field
  // Status flags
  isFeatured: boolean;
  is_featured?: boolean; // Backend field
  isDeleted?: boolean;
  is_deleted?: boolean; // Backend field
  // Timestamps
  createdAt: string;
  created_at?: string; // Backend field
  updatedAt: string;
  updated_at?: string; // Backend field
  featured_at?: string; // Backend field
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
