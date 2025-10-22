import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal } from 'lucide-react';
import { Link } from 'react-router-dom';

type LeaderboardTab = 'projects' | 'builders' | 'featured';

const mockLeaderboard = {
  projects: [
    { rank: 1, title: 'DeFi Lending Platform', score: 234, author: 'alice_dev' },
    { rank: 2, title: 'NFT Marketplace for Music', score: 189, author: 'bob_builder' },
    { rank: 3, title: 'DAO Governance Dashboard', score: 156, author: 'charlie_crypto' },
  ],
  builders: [
    { rank: 1, username: 'alice_dev', score: 456, projects: 5 },
    { rank: 2, username: 'bob_builder', score: 389, projects: 3 },
    { rank: 3, username: 'charlie_crypto', score: 298, projects: 4 },
  ],
};

export default function Leaderboard() {
  const [tab, setTab] = useState<LeaderboardTab>('projects');

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">Leaderboard</h1>
        <p className="text-muted-foreground">Top projects and builders on 0x.ship</p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as LeaderboardTab)} className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="builders">Builders</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mx-auto max-w-3xl space-y-4">
        {tab === 'projects' &&
          mockLeaderboard.projects.map((item) => (
            <Card key={item.rank} className="p-6 transition-smooth hover:scale-[1.02] hover:glow-accent">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center">
                  {getRankIcon(item.rank)}
                </div>
                <div className="flex-1">
                  <Link to={`/project/${item.rank}`} className="text-lg font-semibold hover:text-primary transition-smooth">
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">by {item.author}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{item.score}</div>
                  <div className="text-xs text-muted-foreground">votes</div>
                </div>
              </div>
            </Card>
          ))}

        {tab === 'builders' &&
          mockLeaderboard.builders.map((item) => (
            <Card key={item.rank} className="p-6 transition-smooth hover:scale-[1.02] hover:glow-accent">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center">
                  {getRankIcon(item.rank)}
                </div>
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={item.username} />
                  <AvatarFallback className="bg-card">
                    {item.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link to={`/u/${item.username}`} className="text-lg font-semibold hover:text-primary transition-smooth">
                    {item.username}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.projects} projects</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{item.score}</div>
                  <div className="text-xs text-muted-foreground">total score</div>
                </div>
              </div>
            </Card>
          ))}

        {tab === 'featured' && (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">Featured projects coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
