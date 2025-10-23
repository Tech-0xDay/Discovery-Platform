import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Rocket, FileText, ThumbsUp, MessageSquare, Users, Plus } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-10 card-elevated p-8">
            <h1 className="text-4xl font-black text-foreground mb-2">Welcome back, {user?.username}!</h1>
            <p className="text-base text-muted-foreground">
              Here's what's happening with your projects
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Projects */}
            <div className="card-elevated p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-1">Total Projects</p>
                  <p className="text-3xl font-black text-foreground">3</p>
                </div>
                <div className="badge-primary flex items-center justify-center h-10 w-10 rounded-[10px]">
                  <Rocket className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">+1 from last month</p>
            </div>

            {/* Total Votes */}
            <div className="card-elevated p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-1">Total Votes</p>
                  <p className="text-3xl font-black text-foreground">156</p>
                </div>
                <div className="badge-primary flex items-center justify-center h-10 w-10 rounded-[10px]">
                  <ThumbsUp className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">+23 from last week</p>
            </div>

            {/* Comments */}
            <div className="card-elevated p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-1">Comments</p>
                  <p className="text-3xl font-black text-foreground">42</p>
                </div>
                <div className="badge-primary flex items-center justify-center h-10 w-10 rounded-[10px]">
                  <MessageSquare className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">+8 new discussions</p>
            </div>

            {/* Intro Requests */}
            <div className="card-elevated p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-muted-foreground mb-1">Intro Requests</p>
                  <p className="text-3xl font-black text-foreground">5</p>
                </div>
                <div className="badge-primary flex items-center justify-center h-10 w-10 rounded-[10px]">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">2 pending</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Quick Actions */}
            <div className="card-elevated p-6">
              <h2 className="text-2xl font-black mb-4 text-foreground border-b-4 border-primary pb-3">
                Quick Actions
              </h2>
              <p className="text-sm text-muted-foreground mb-6">What would you like to do today?</p>

              <div className="space-y-3">
                <Link to="/publish" className="btn-primary w-full inline-flex items-center justify-start gap-3 px-4 py-3">
                  <Plus className="h-5 w-5" />
                  <span>Publish New Project</span>
                </Link>
                <Link to="/my-projects" className="btn-secondary w-full inline-flex items-center justify-start gap-3 px-4 py-3">
                  <FileText className="h-5 w-5" />
                  <span>Manage My Projects</span>
                </Link>
                <Link to={`/u/${user?.username}`} className="btn-secondary w-full inline-flex items-center justify-start gap-3 px-4 py-3">
                  <Users className="h-5 w-5" />
                  <span>View My Profile</span>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card-elevated p-6">
              <h2 className="text-2xl font-black mb-4 text-foreground border-b-4 border-primary pb-3">
                Recent Activity
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Your latest interactions</p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="h-3 w-3 rounded-full bg-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Your project "DeFi Platform" received 12 new votes</p>
                    <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-3 w-3 rounded-full bg-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">New comment on "NFT Marketplace"</p>
                    <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="h-3 w-3 rounded-full bg-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">Intro request accepted by @alice_dev</p>
                    <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
