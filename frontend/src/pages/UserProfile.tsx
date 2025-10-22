import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProjectCard } from '@/components/ProjectCard';
import { Shield, Award } from 'lucide-react';

// Mock user data
const mockUser = {
  username: 'alice_dev',
  displayName: 'Alice Developer',
  bio: 'Full-stack developer passionate about DeFi and Web3. Building the future one hackathon at a time.',
  avatar: '',
  isVerified: true,
  isAdmin: false,
  stats: {
    projects: 5,
    totalVotes: 456,
    badges: 3,
  },
};

export default function UserProfile() {
  const { username } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 p-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <Avatar className="h-32 w-32 border-4 border-primary/20">
            <AvatarImage src={mockUser.avatar} alt={username} />
            <AvatarFallback className="text-3xl">
              {mockUser.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <div className="mb-2 flex flex-col items-center gap-2 md:flex-row md:items-center">
              <h1 className="text-3xl font-bold">{mockUser.displayName || mockUser.username}</h1>
              {mockUser.isVerified && (
                <Badge variant="outline" className="border-primary text-primary">
                  <Shield className="mr-1 h-3 w-3" />
                  Verified Builder
                </Badge>
              )}
              {mockUser.isAdmin && (
                <Badge variant="outline" className="border-destructive text-destructive">
                  <Award className="mr-1 h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>
            <p className="mb-4 text-lg text-muted-foreground">@{mockUser.username}</p>
            {mockUser.bio && <p className="text-foreground">{mockUser.bio}</p>}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{mockUser.stats.projects}</div>
            <div className="text-sm text-muted-foreground">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{mockUser.stats.totalVotes}</div>
            <div className="text-sm text-muted-foreground">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{mockUser.stats.badges}</div>
            <div className="text-sm text-muted-foreground">Badges Given</div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="projects">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">No projects yet</p>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">No recent activity</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
