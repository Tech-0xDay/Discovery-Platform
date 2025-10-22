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
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-start gap-4">
            {/* Voting Component */}
            <VoteButtons
              projectId={mockProject.id}
              voteCount={mockProject.voteCount}
              userVote={mockProject.userVote}
            />

            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                {mockProject.isFeatured && (
                  <Star className="h-5 w-5 fill-primary text-primary" />
                )}
                <h1 className="text-3xl font-bold">{mockProject.title}</h1>
              </div>
              <p className="mb-4 text-lg text-muted-foreground">{mockProject.tagline}</p>

              <div className="flex flex-wrap gap-3">
                {mockProject.demoUrl && (
                  <Button variant="default" size="sm" asChild>
                    <a href={mockProject.demoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Live Demo
                    </a>
                  </Button>
                )}
                {mockProject.githubUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={mockProject.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="mr-2 h-4 w-4" />
                      GitHub
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Author Info & Actions */}
          <Card className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={mockProject.author.avatar} alt={mockProject.author.username} />
                  <AvatarFallback className="bg-card">
                    {mockProject.author.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    to={`/u/${mockProject.author.username}`}
                    className="font-medium hover:text-primary transition-smooth"
                  >
                    {mockProject.author.username}
                    {mockProject.author.isVerified && (
                      <Badge variant="outline" className="ml-2 border-primary text-primary">
                        Verified
                      </Badge>
                    )}
                  </Link>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {mockProject.hackathonName} • {new Date(mockProject.hackathonDate).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <BadgeAwarder projectId={mockProject.id} />
                {user?.id !== mockProject.authorId && (
                  <IntroRequest projectId={mockProject.id} builderId={mockProject.authorId} />
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Proof Score */}
        <Card className="mb-8 p-6">
          <h2 className="mb-4 text-xl font-semibold">Proof Score</h2>
          <div className="mb-4 flex items-center gap-4">
            <div className="text-4xl font-bold text-primary">{mockProject.proofScore.total.toFixed(1)}</div>
            <div className="flex-1">
              <div className="h-4 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${mockProject.proofScore.total}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="mb-1 text-sm text-muted-foreground">Verification</div>
              <div className="text-2xl font-bold">{mockProject.proofScore.verification}</div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="mb-1 text-sm text-muted-foreground">Community</div>
              <div className="text-2xl font-bold">{mockProject.proofScore.community}</div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="mb-1 text-sm text-muted-foreground">Validation</div>
              <div className="text-2xl font-bold">{mockProject.proofScore.validation}</div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <div className="mb-1 text-sm text-muted-foreground">Quality</div>
              <div className="text-2xl font-bold">{mockProject.proofScore.quality}</div>
            </div>
          </div>
        </Card>

        {/* Badges */}
        {mockProject.badges.length > 0 && (
          <Card className="mb-8 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Award className="h-5 w-5 text-primary" />
              Badges
            </h2>
            <div className="space-y-3">
              {mockProject.badges.map((badge) => {
                let iconColor = 'text-gray-400';
                if (badge.type === 'platinum') iconColor = 'text-blue-400';
                else if (badge.type === 'gold') iconColor = 'text-yellow-400';
                
                return (
                  <div key={badge.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-4">
                    <Award className={`h-6 w-6 ${iconColor}`} />
                    <div>
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Awarded by {badge.awardedBy.username} • {new Date(badge.awardedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Description */}
        <Card className="mb-8 p-6">
          <h2 className="mb-4 text-xl font-semibold">About</h2>
          <div className="prose prose-invert max-w-none whitespace-pre-wrap text-foreground">
            {mockProject.description}
          </div>
        </Card>

        {/* Tech Stack */}
        <Card className="mb-8 p-6">
          <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
            <Code className="h-5 w-5" />
            Tech Stack
          </h2>
          <div className="flex flex-wrap gap-2">
            {mockProject.techStack.map((tech) => (
              <Badge key={tech} variant="secondary" className="text-sm">
                {tech}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Comments Section */}
        <Card className="p-6">
          <CommentSection projectId={mockProject.id} />
        </Card>
      </div>
    </div>
  );
}
