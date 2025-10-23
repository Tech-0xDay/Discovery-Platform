import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return <span className="text-lg font-black text-muted-foreground">{rank}</span>;
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header section */}
          <div className="mb-10 card-elevated p-8">
            <h1 className="text-4xl font-black text-foreground mb-2">Leaderboard</h1>
            <p className="text-base text-muted-foreground">
              Top projects and builders on 0x.ship
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <Tabs value={tab} onValueChange={(v) => setTab(v as LeaderboardTab)}>
              <TabsList className="inline-flex h-auto rounded-[15px] bg-secondary border-4 border-black p-1">
                <TabsTrigger
                  value="projects"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-quick data-[state=active]:bg-primary data-[state=active]:text-foreground"
                >
                  Projects
                </TabsTrigger>
                <TabsTrigger
                  value="builders"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-quick data-[state=active]:bg-primary data-[state=active]:text-foreground"
                >
                  Builders
                </TabsTrigger>
                <TabsTrigger
                  value="featured"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-quick data-[state=active]:bg-primary data-[state=active]:text-foreground"
                >
                  Featured
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Leaderboard Items */}
          <div className="space-y-4">
            {tab === 'projects' &&
              mockLeaderboard.projects.map((item) => (
                <div key={item.rank} className="card-elevated p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center flex-shrink-0">
                      {getRankIcon(item.rank)}
                    </div>
                    <div className="flex-1">
                      <Link to={`/project/${item.rank}`} className="text-lg font-black text-primary hover:opacity-80 transition-quick block mb-1">
                        {item.title}
                      </Link>
                      <p className="text-sm text-muted-foreground">by {item.author}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-black text-primary">{item.score}</div>
                      <div className="text-xs font-bold text-muted-foreground">votes</div>
                    </div>
                  </div>
                </div>
              ))}

            {tab === 'builders' &&
              mockLeaderboard.builders.map((item) => (
                <div key={item.rank} className="card-elevated p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center flex-shrink-0">
                      {getRankIcon(item.rank)}
                    </div>
                    <Avatar className="h-12 w-12 border-3 border-primary flex-shrink-0">
                      <AvatarImage src="" alt={item.username} />
                      <AvatarFallback className="bg-primary text-foreground font-bold text-sm">
                        {item.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Link to={`/u/${item.username}`} className="text-lg font-black text-primary hover:opacity-80 transition-quick block mb-1">
                        {item.username}
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.projects} projects</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-black text-primary">{item.score}</div>
                      <div className="text-xs font-bold text-muted-foreground">total score</div>
                    </div>
                  </div>
                </div>
              ))}

            {tab === 'featured' && (
              <div className="card-elevated p-12 text-center">
                <p className="text-lg font-bold text-foreground">Featured projects coming soon...</p>
                <p className="text-sm text-muted-foreground mt-2">Check back later for featured projects and community picks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
