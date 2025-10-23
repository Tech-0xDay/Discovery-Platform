import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ArrowUp, ArrowDown, Github, ExternalLink, Award, Star, Calendar, Code } from 'lucide-react';
import { VoteButtons } from '@/components/VoteButtons';
import { CommentSection } from '@/components/CommentSection';
import { BadgeAwarder } from '@/components/BadgeAwarder';
import { IntroRequest } from '@/components/IntroRequest';
import { useAuth } from '@/context/AuthContext';

// Mock data - would come from API
const mockProject = {
  id: '1',
  title: 'DeFi Lending Platform',
  tagline: 'Decentralized lending protocol with AI-powered risk assessment',
  description: `A revolutionary DeFi platform that uses machine learning to assess borrower creditworthiness and optimize interest rates in real-time.

Our platform combines the transparency and security of blockchain technology with advanced AI algorithms to create a fair and efficient lending marketplace. Key features include:

• Real-time risk assessment using multiple data sources
• Dynamic interest rates based on market conditions
• Automated liquidation protection
• Cross-chain compatibility
• Gas-optimized smart contracts

The project was built during ETH Global London 2024 and has already processed over $100k in test transactions.`,
  demoUrl: 'https://demo.example.com',
  githubUrl: 'https://github.com/example/defi-lending',
  hackathonName: 'ETH Global London',
  hackathonDate: '2024-03-15',
  techStack: ['Solidity', 'React', 'Node.js', 'TensorFlow', 'Hardhat', 'Chainlink'],
  screenshots: [],
  authorId: '1',
  author: {
    id: '1',
    username: 'alice_dev',
    email: 'alice@example.com',
    displayName: 'Alice Developer',
    isVerified: true,
    isAdmin: false,
    avatar: '',
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
      type: 'gold' as 'silver' | 'gold' | 'platinum',
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
  userVote: 0,
  isFeatured: true,
  createdAt: '2024-03-15',
  updatedAt: '2024-03-15',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Hero Header Section */}
          <div className="mb-12 card-elevated p-8">
            <div className="flex items-start justify-between gap-8 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  {mockProject.isFeatured && (
                    <span className="badge-primary">⭐ Featured</span>
                  )}
                </div>
                <h1 className="text-5xl font-black text-foreground mb-3">
                  {mockProject.title}
                </h1>
                <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                  {mockProject.tagline}
                </p>
              </div>

              {/* Score Badge */}
              <div className="badge-primary flex flex-col items-center justify-center px-8 py-6 rounded-[15px]">
                <div className="text-4xl font-black text-foreground">{mockProject.proofScore.total}</div>
                <div className="text-sm font-bold text-foreground">Proof Score</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 border-t-4 border-black pt-6">
              {mockProject.demoUrl && (
                <a href={mockProject.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <ExternalLink className="mr-2 h-5 w-5 inline" />
                  View Live Demo
                </a>
              )}
              {mockProject.githubUrl && (
                <a href={mockProject.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <Github className="mr-2 h-5 w-5 inline" />
                  View Code
                </a>
              )}
              <BadgeAwarder projectId={mockProject.id} />
              {user?.id !== mockProject.authorId && (
                <IntroRequest projectId={mockProject.id} builderId={mockProject.authorId} />
              )}
            </div>
          </div>

          {/* Creator & Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* Creator Card */}
            <div className="card-elevated p-6 md:col-span-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-primary">
                  <AvatarImage src={mockProject.author.avatar} alt={mockProject.author.username} />
                  <AvatarFallback className="bg-primary text-foreground font-bold text-lg">
                    {mockProject.author.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link
                    to={`/u/${mockProject.author.username}`}
                    className="text-2xl font-bold text-primary hover:opacity-80 transition-quick"
                  >
                    {mockProject.author.username}
                  </Link>
                  {mockProject.author.isVerified && (
                    <span className="badge-primary ml-3 inline-block">✓ Verified</span>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Calendar className="h-4 w-4" />
                    {mockProject.hackathonName} • {new Date(mockProject.hackathonDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Breakdown Card */}
            <div className="card-elevated p-6">
              <h3 className="font-black text-lg mb-4 text-foreground">Score Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold">Verification</span>
                    <span className="text-primary font-black">{mockProject.proofScore.verification}</span>
                  </div>
                  <div className="h-2 bg-secondary border-2 border-black rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${mockProject.proofScore.verification}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold">Community</span>
                    <span className="text-primary font-black">{mockProject.proofScore.community}</span>
                  </div>
                  <div className="h-2 bg-secondary border-2 border-black rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${mockProject.proofScore.community}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold">Quality</span>
                    <span className="text-primary font-black">{mockProject.proofScore.quality}</span>
                  </div>
                  <div className="h-2 bg-secondary border-2 border-black rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${mockProject.proofScore.quality}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Badges Section */}
          {mockProject.badges.length > 0 && (
            <div className="card-elevated p-8 mb-12">
              <h2 className="text-3xl font-black mb-6 text-foreground flex items-center gap-3">
                <Award className="h-8 w-8 text-primary" />
                Achievements
              </h2>
              <div className="space-y-4">
                {mockProject.badges.map((badge) => {
                  const badgeIcons: Record<string, string> = {
                    gold: '🥇',
                    silver: '🥈',
                    platinum: '💎',
                  };
                  return (
                    <div key={badge.id} className="border-l-4 border-primary pl-6 py-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{badgeIcons[badge.type] || '⭐'}</span>
                        <div>
                          <h4 className="font-bold text-lg text-foreground">{badge.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Awarded by <span className="text-primary font-bold">{badge.awardedBy.username}</span> • {new Date(badge.awardedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground ml-12">{badge.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="card-elevated p-8 mb-12">
            <h2 className="text-3xl font-black mb-6 text-foreground">About This Project</h2>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-foreground leading-relaxed text-lg">
              {mockProject.description}
            </div>
          </div>

          {/* Tech Stack Section */}
          <div className="card-elevated p-8 mb-12">
            <h2 className="text-3xl font-black mb-6 text-foreground flex items-center gap-3">
              <Code className="h-8 w-8 text-primary" />
              Tech Stack
            </h2>
            <div className="flex flex-wrap gap-4">
              {mockProject.techStack.map((tech) => (
                <span key={tech} className="badge-primary font-bold">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="card-elevated p-8">
            <h2 className="text-3xl font-black mb-8 text-foreground">Comments & Discussion</h2>
            <CommentSection projectId={mockProject.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
