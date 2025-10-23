import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, ArrowDown, Github, ExternalLink, Award, Calendar, Code, Loader2, AlertCircle } from 'lucide-react';
import { VoteButtons } from '@/components/VoteButtons';
import { CommentSection } from '@/components/CommentSection';
import { BadgeAwarder } from '@/components/BadgeAwarder';
import { IntroRequest } from '@/components/IntroRequest';
import { useAuth } from '@/context/AuthContext';
import { useProjectById } from '@/hooks/useProjects';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading, error } = useProjectById(id || '');

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-5xl card-elevated p-20 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data?.data) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-5xl card-elevated p-20 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-black text-foreground mb-2">Project Not Found</h2>
            <p className="text-muted-foreground">{(error as any)?.message || 'Failed to load project'}</p>
          </div>
        </div>
      </div>
    );
  }

  const project = data.data;

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Hero Header Section */}
          <div className="mb-8 card-elevated p-6">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {project.is_featured && (
                    <span className="badge-primary text-xs">⭐ Featured</span>
                  )}
                </div>
                <h1 className="text-3xl font-black text-foreground mb-2">
                  {project.title}
                </h1>
                <p className="text-base text-muted-foreground mb-4 leading-relaxed">
                  {project.tagline}
                </p>
              </div>

              {/* Score Badge */}
              <div className="badge-primary flex flex-col items-center justify-center px-6 py-4 rounded-[15px] flex-shrink-0">
                <div className="text-3xl font-black text-foreground">{project.proof_score?.total || 0}</div>
                <div className="text-xs font-bold text-foreground">Score</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 border-t-4 border-black pt-4">
              {project.demo_url && (
                <a href={project.demo_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <ExternalLink className="mr-2 h-5 w-5 inline" />
                  View Live Demo
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <Github className="mr-2 h-5 w-5 inline" />
                  View Code
                </a>
              )}
              <BadgeAwarder projectId={project.id} />
              {user?.id !== project.creator_id && (
                <IntroRequest projectId={project.id} builderId={project.creator_id} />
              )}
            </div>
          </div>

          {/* Creator & Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Creator Card */}
            <div className="card-elevated p-5 md:col-span-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border-3 border-primary">
                  <AvatarImage src={project.creator?.avatar_url} alt={project.creator?.username} />
                  <AvatarFallback className="bg-primary text-foreground font-bold text-sm">
                    {project.creator?.username?.slice(0, 2).toUpperCase() || 'NA'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link
                    to={`/u/${project.creator?.username}`}
                    className="text-lg font-bold text-primary hover:opacity-80 transition-quick"
                  >
                    {project.creator?.username}
                  </Link>
                  {project.creator?.is_verified && (
                    <span className="badge-primary ml-2 inline-block text-xs">✓ Verified</span>
                  )}
                  {project.hackathon_name && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {project.hackathon_name} • {new Date(project.hackathon_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Score Breakdown Card */}
            {project.proof_score && (
              <div className="card-elevated p-5">
                <h3 className="font-black text-sm mb-3 text-foreground">Score Breakdown</h3>
                <div className="space-y-3">
                  {project.proof_score.verification !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">Verification</span>
                        <span className="text-primary font-black">{project.proof_score.verification}</span>
                      </div>
                      <div className="h-2 bg-secondary border-2 border-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(project.proof_score.verification, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {project.proof_score.community !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">Community</span>
                        <span className="text-primary font-black">{project.proof_score.community}</span>
                      </div>
                      <div className="h-2 bg-secondary border-2 border-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(project.proof_score.community, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {project.proof_score.quality !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">Quality</span>
                        <span className="text-primary font-black">{project.proof_score.quality}</span>
                      </div>
                      <div className="h-2 bg-secondary border-2 border-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(project.proof_score.quality, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Badges Section */}
          {project.badges && project.badges.length > 0 && (
            <div className="card-elevated p-6 mb-8">
              <h2 className="text-2xl font-black mb-4 text-foreground flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Achievements
              </h2>
              <div className="space-y-3">
                {project.badges.map((badge: any) => {
                  const badgeIcons: Record<string, string> = {
                    gold: '🥇',
                    silver: '🥈',
                    platinum: '💎',
                  };
                  return (
                    <div key={badge.id} className="border-l-4 border-primary pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{badgeIcons[badge.badge_type] || '⭐'}</span>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{badge.rationale}</h4>
                          <p className="text-xs text-muted-foreground">
                            Awarded by <span className="text-primary font-bold">{badge.awarded_by?.username}</span> • {new Date(badge.awarded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* About Section */}
          <div className="card-elevated p-6 mb-8">
            <h2 className="text-2xl font-black mb-4 text-foreground">About This Project</h2>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-foreground leading-relaxed text-sm">
              {project.description}
            </div>
          </div>

          {/* Tech Stack Section */}
          {project.tech_stack && project.tech_stack.length > 0 && (
            <div className="card-elevated p-6 mb-8">
              <h2 className="text-2xl font-black mb-4 text-foreground flex items-center gap-2">
                <Code className="h-6 w-6 text-primary" />
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack.map((tech: string) => (
                  <span key={tech} className="badge-primary text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div className="card-elevated p-6">
            <h2 className="text-2xl font-black mb-6 text-foreground">Comments & Discussion</h2>
            <CommentSection projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
