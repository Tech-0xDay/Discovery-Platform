import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Rocket, FileText, ThumbsUp, MessageSquare, Users, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useStats';
import { DashboardStatsSkeleton, DashboardHeaderSkeleton } from '@/components/DashboardStatsSkeleton';
import { formatDistanceToNow } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading, error } = useDashboardStats();

  return (
    <div className="bg-background min-h-screen overflow-hidden">
      <div className="container mx-auto px-6 py-12 overflow-hidden">
        <div className="mx-auto max-w-6xl w-full box-border">
          {/* Header */}
          {isLoading ? (
            <DashboardHeaderSkeleton />
          ) : (
            <div className="mb-10 card-elevated p-8">
              <h1 className="text-4xl font-black text-foreground mb-2">Welcome back, {user?.username}!</h1>
              <p className="text-base text-muted-foreground">
                Here's what's happening with your projects
              </p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && <DashboardStatsSkeleton />}

          {/* Error State */}
          {error && (
            <div className="card-elevated p-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground mb-2">Failed to load dashboard data</p>
              <p className="text-sm text-muted-foreground">{(error as any)?.message || 'Please try again later'}</p>
            </div>
          )}

          {/* Stats Grid */}
          {!isLoading && !error && stats && (
            <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full box-border overflow-hidden">
              {/* Total Projects */}
              <div className="card-elevated p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">Total Projects</p>
                    <p className="text-3xl font-black text-foreground">{stats.totalProjects}</p>
                  </div>
                  <div className="badge-primary flex items-center justify-center h-10 w-10 rounded-[10px]">
                    <Rocket className="h-5 w-5 text-foreground" />
                  </div>
                </div>
                <Link to="/my-projects" className="text-xs text-primary hover:underline font-bold">
                  View all projects →
                </Link>
              </div>

              {/* Total Votes */}
              <div className="card-elevated p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">Total Upvotes</p>
                    <p className="text-3xl font-black text-foreground">{stats.totalVotes}</p>
                  </div>
                  <div className="badge-primary flex items-center justify-center h-10 w-10 rounded-[10px]">
                    <ThumbsUp className="h-5 w-5 text-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Across all projects</p>
              </div>

              {/* Comments */}
              <div className="card-elevated p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">Total Comments</p>
                    <p className="text-3xl font-black text-foreground">{stats.totalComments}</p>
                  </div>
                  <div className="badge-primary flex items-center justify-center h-10 w-10 rounded-[10px]">
                    <MessageSquare className="h-5 w-5 text-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Community engagement</p>
              </div>

              {/* Intro Requests */}
              <div className="card-elevated p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground mb-1">Intro Requests</p>
                    <p className="text-3xl font-black text-foreground">{stats.introRequests}</p>
                  </div>
                  <div className="badge-primary flex items-center justify-center h-10 w-10 rounded-[10px]">
                    <Users className="h-5 w-5 text-foreground" />
                  </div>
                </div>
                <Link to="/intros" className="text-xs text-primary hover:underline font-bold">
                  {stats.pendingIntros} pending →
                </Link>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          {!isLoading && !error && stats && (
            <div className="grid gap-6 lg:grid-cols-2 w-full box-border overflow-hidden">
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
                  Recent Projects
                </h2>
                <p className="text-sm text-muted-foreground mb-6">Your latest published projects</p>

                {stats.projects && stats.projects.length > 0 ? (
                  <div className="space-y-6">
                    {stats.projects.slice(0, 3).map((project: any) => (
                      <Link
                        key={project.id}
                        to={`/project/${project.id}`}
                        className="flex items-start gap-4 group hover:opacity-80 transition-smooth"
                      >
                        <div className="h-3 w-3 rounded-full bg-primary flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground group-hover:text-primary transition-smooth">
                            {project.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {project.upvotes || 0} upvotes
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {project.comment_count || 0} comments
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-4">No projects yet</p>
                    <Link to="/publish" className="btn-primary inline-flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Publish Your First Project
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
