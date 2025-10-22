import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCard } from '@/components/ProjectCard';
import { SortType, Project } from '@/types';
import { Flame, Clock, TrendingUp, Zap } from 'lucide-react';

// Mock data for demonstration
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'DeFi Lending Platform',
    tagline: 'Decentralized lending protocol with AI-powered risk assessment',
    description: 'A revolutionary DeFi platform that uses machine learning to assess borrower creditworthiness and optimize interest rates in real-time.',
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/defi-lending',
    hackathonName: 'ETH Global London',
    hackathonDate: '2024-03-15',
    techStack: ['Solidity', 'React', 'Node.js', 'TensorFlow', 'Hardhat'],
    screenshots: [],
    authorId: '1',
    author: {
      id: '1',
      username: 'alice_dev',
      email: 'alice@example.com',
      displayName: 'Alice Developer',
      isVerified: true,
      isAdmin: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    proofScore: {
      total: 85,
      verification: 90,
      community: 80,
      validation: 85,
      quality: 85,
    },
    badges: [
      {
        id: '1',
        type: 'gold',
        name: 'Innovation Award',
        description: 'Awarded for exceptional innovation',
        awardedBy: {
          id: '2',
          username: 'curator',
          email: 'curator@example.com',
          isVerified: true,
          isAdmin: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        awardedAt: '2024-03-20',
      },
    ],
    voteCount: 234,
    commentCount: 45,
    isFeatured: true,
    createdAt: '2024-03-15',
    updatedAt: '2024-03-15',
  },
  {
    id: '2',
    title: 'NFT Marketplace for Music',
    tagline: 'Empowering artists with blockchain-based royalty distribution',
    description: 'A platform that enables musicians to tokenize their work and receive instant, transparent royalty payments through smart contracts.',
    githubUrl: 'https://github.com/example/nft-music',
    hackathonName: 'Web3 Music Hackathon',
    hackathonDate: '2024-03-10',
    techStack: ['TypeScript', 'Next.js', 'IPFS', 'Ethereum'],
    screenshots: [],
    authorId: '2',
    author: {
      id: '2',
      username: 'bob_builder',
      email: 'bob@example.com',
      isVerified: true,
      isAdmin: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    proofScore: {
      total: 78,
      verification: 85,
      community: 75,
      validation: 80,
      quality: 72,
    },
    badges: [],
    voteCount: 189,
    commentCount: 32,
    isFeatured: false,
    createdAt: '2024-03-10',
    updatedAt: '2024-03-10',
  },
  {
    id: '3',
    title: 'DAO Governance Dashboard',
    tagline: 'Simplified voting and proposal management for DAOs',
    description: 'An intuitive dashboard that makes DAO governance accessible to everyone with real-time analytics and proposal tracking.',
    demoUrl: 'https://demo.dao.com',
    githubUrl: 'https://github.com/example/dao-dashboard',
    hackathonName: 'DAO Tools Hackathon',
    hackathonDate: '2024-03-05',
    techStack: ['React', 'GraphQL', 'The Graph', 'Snapshot'],
    screenshots: [],
    authorId: '3',
    author: {
      id: '3',
      username: 'charlie_crypto',
      email: 'charlie@example.com',
      isVerified: false,
      isAdmin: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    proofScore: {
      total: 72,
      verification: 70,
      community: 75,
      validation: 70,
      quality: 73,
    },
    badges: [
      {
        id: '2',
        type: 'silver',
        name: 'Community Choice',
        description: 'Voted by the community',
        awardedBy: {
          id: '2',
          username: 'curator',
          email: 'curator@example.com',
          isVerified: true,
          isAdmin: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        awardedAt: '2024-03-08',
      },
    ],
    voteCount: 156,
    commentCount: 28,
    isFeatured: false,
    createdAt: '2024-03-05',
    updatedAt: '2024-03-05',
  },
];

export default function Feed() {
  const [sortType, setSortType] = useState<SortType>('hot');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header section */}
        <div className="mb-12 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Discover Projects
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore amazing hackathon projects with proof-weighted credibility. Find innovative builders, track their growth, and connect.
          </p>
        </div>

        {/* Sorting tabs */}
        <div className="mb-8 flex items-center justify-between">
          <Tabs value={sortType} onValueChange={(v) => setSortType(v as SortType)} className="">
            <TabsList className="inline-flex h-auto rounded-lg bg-secondary/50 p-1 border border-border">
              <TabsTrigger
                value="hot"
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-smooth data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Hot</span>
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-smooth data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </TabsTrigger>
              <TabsTrigger
                value="top"
                className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-smooth data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Top</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Results info */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{mockProjects.length}</span> projects
          </div>
        </div>

        {/* Projects grid */}
        <div className="grid gap-4 lg:gap-6">
          {mockProjects.length === 0 ? (
            <div className="py-20 text-center">
              <div className="space-y-4">
                <div className="text-6xl">🚀</div>
                <p className="text-lg font-semibold text-foreground">No projects found</p>
                <p className="text-muted-foreground">Be the first to publish your amazing hackathon project!</p>
              </div>
            </div>
          ) : (
            mockProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>

        {/* Load more button */}
        {mockProjects.length > 0 && (
          <div className="mt-12 flex justify-center">
            <button className="px-8 py-3 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground font-medium transition-smooth border border-border hover:border-primary">
              Load More Projects
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
