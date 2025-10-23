import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Profile Header Card */}
          <div className="card-elevated p-8 mb-10">
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              <Avatar className="h-32 w-32 border-4 border-primary flex-shrink-0">
                <AvatarImage src={mockUser.avatar} alt={username} />
                <AvatarFallback className="text-4xl font-black bg-primary text-foreground">
                  {mockUser.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="mb-4 flex flex-col items-center gap-3 md:items-start md:flex-row">
                  <h1 className="text-4xl font-black text-foreground">
                    {mockUser.displayName || mockUser.username}
                  </h1>
                  {mockUser.isVerified && (
                    <Badge className="badge-primary">
                      <Shield className="mr-1 h-3 w-3" />
                      Verified Builder
                    </Badge>
                  )}
                  {mockUser.isAdmin && (
                    <Badge className="bg-destructive text-white">
                      <Award className="mr-1 h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="mb-4 text-lg font-bold text-primary mb-3">@{mockUser.username}</p>
                {mockUser.bio && <p className="text-base text-foreground leading-relaxed">{mockUser.bio}</p>}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t-4 border-primary pt-8">
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">{mockUser.stats.projects}</div>
                <div className="text-sm font-bold text-muted-foreground">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">{mockUser.stats.totalVotes}</div>
                <div className="text-sm font-bold text-muted-foreground">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">{mockUser.stats.badges}</div>
                <div className="text-sm font-bold text-muted-foreground">Badges Given</div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="projects">
            <TabsList className="inline-flex h-auto rounded-[15px] bg-secondary border-4 border-black p-1 mb-8">
              <TabsTrigger
                value="projects"
                className="rounded-md px-4 py-2 text-sm font-bold transition-quick data-[state=active]:bg-primary data-[state=active]:text-foreground"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-md px-4 py-2 text-sm font-bold transition-quick data-[state=active]:bg-primary data-[state=active]:text-foreground"
              >
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              <div className="card-elevated p-12 text-center">
                <div className="space-y-3">
                  <p className="text-lg font-bold text-foreground">No projects yet</p>
                  <p className="text-sm text-muted-foreground">Check back soon to see {mockUser.displayName}'s projects</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <div className="card-elevated p-12 text-center">
                <div className="space-y-3">
                  <p className="text-lg font-bold text-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground">Stay tuned for updates from this builder</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
