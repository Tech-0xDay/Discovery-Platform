import { Link } from 'react-router-dom';
import { Project } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, MessageSquare, Award, Star, TrendingUp, Github, ExternalLink } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const upvoteRatio = project.voteCount > 0
    ? Math.round((project.voteCount / (project.voteCount + Math.abs(project.commentCount - project.voteCount))) * 100)
    : 0;

  return (
    <div className="group">
      <Link to={`/project/${project.id}`} className="block">
        <Card className="card-interactive overflow-hidden">
          <div className="p-6 space-y-4">
            {/* Header with title and badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2">
                  {project.isFeatured && (
                    <Star className="h-5 w-5 fill-primary text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-smooth line-clamp-2">
                    {project.title}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {project.tagline}
                </p>
              </div>

              {/* Proof score badge */}
              <div className="flex-shrink-0">
                <div className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 px-4 py-3 min-w-[80px]">
                  <span className="text-2xl font-bold text-primary">
                    {project.proofScore.total}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">Score</span>
                </div>
              </div>
            </div>

            {/* Creator info */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/50">
              <Avatar className="h-8 w-8">
                <AvatarImage src={project.author.avatar} alt={project.author.username} />
                <AvatarFallback className="bg-card text-xs font-semibold">
                  {project.author.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {project.author.username}
                  {project.author.isVerified && (
                    <span className="badge-success ml-2 inline-flex">
                      ✓ Verified
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {project.hackathonName} • {new Date(project.hackathonDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Tech stack */}
            <div className="flex flex-wrap gap-2 pt-2">
              {project.techStack.slice(0, 3).map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs bg-secondary/50 hover:bg-secondary">
                  {tech}
                </Badge>
              ))}
              {project.techStack.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-secondary/50">
                  +{project.techStack.length - 3}
                </Badge>
              )}
            </div>

            {/* Badges section */}
            {project.badges.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {project.badges.slice(0, 2).map((badge) => {
                  const badgeIcons = {
                    silver: '🥈',
                    gold: '🥇',
                    platinum: '💎',
                  };
                  return (
                    <span key={badge.id} className="badge-primary text-xs">
                      {badgeIcons[badge.type as keyof typeof badgeIcons]} {badge.type}
                    </span>
                  );
                })}
                {project.badges.length > 2 && (
                  <span className="badge-muted text-xs">
                    +{project.badges.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Stats footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-smooth">
                  <ArrowUp className="h-4 w-4" />
                  <span className="font-medium">{project.voteCount}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-foreground transition-smooth">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">{project.commentCount}</span>
                </div>
                {project.badges.length > 0 && (
                  <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-primary transition-smooth">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">{project.badges.length}</span>
                  </div>
                )}
              </div>

              {/* CTA buttons */}
              <div className="flex items-center gap-2">
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-smooth"
                    title="View Live Demo"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-smooth"
                    title="View on GitHub"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
