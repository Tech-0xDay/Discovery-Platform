import { Link } from 'react-router-dom';
import { Project } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, MessageSquare, Award, Star, TrendingUp, Github, ExternalLink, Shield } from 'lucide-react';
import { VoteButtons } from '@/components/VoteButtons';
import { IntroRequest } from '@/components/IntroRequest';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const upvoteRatio = project.voteCount > 0
    ? Math.round((project.voteCount / (project.voteCount + Math.abs(project.commentCount - project.voteCount))) * 100)
    : 0;

  // Truncate text to max words with ellipsis
  const truncateText = (text: string, maxWords: number) => {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  };

  return (
    <div className="group relative w-full max-w-full overflow-hidden">
      <Card className="card-interactive overflow-hidden relative w-full box-border">
        <Link to={`/project/${project.id}`} className="block">
          <div className="p-6 space-y-4 max-w-full overflow-hidden">
            {/* Header with title and badge */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2 flex-wrap">
                  {project.isFeatured && (
                    <Star className="h-5 w-5 fill-primary text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-smooth break-words flex-1">
                    {truncateText(project.title, 12)}
                  </h3>

                  {/* CTA buttons beside title */}
                  <div className="flex items-center gap-2">
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-md bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-smooth border border-border"
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
                        className="p-2 rounded-md bg-card hover:bg-secondary text-muted-foreground hover:text-foreground transition-smooth border border-border"
                        title="View on GitHub"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed break-words">
                  {truncateText(project.tagline, 15)}
                </p>
              </div>

              {/* Proof score badge */}
              <div className="flex-shrink-0">
                <div className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 px-4 py-3 min-w-[80px]">
                  <span className="text-2xl font-bold text-primary">
                    {project.proofScore?.total && project.proofScore.total > 0
                      ? project.proofScore.total
                      : Math.max(project.voteCount || 0, 0)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {project.proofScore?.total && project.proofScore.total > 0 ? 'Score' : 'Votes'}
                  </span>
                </div>
              </div>
            </div>

            {/* Description box - contained and truncated */}
            {project.description && (
              <div className="bg-secondary/30 rounded-lg p-3 border border-border/50 w-full overflow-hidden">
                <p className="text-sm text-muted-foreground leading-relaxed" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                  {truncateText(project.description, 50)}
                </p>
              </div>
            )}

            {/* Creator info and Crew */}
            {project.author && (
              <div className="flex items-start justify-between gap-4 pt-2 border-t border-border/50">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={project.author.avatar || project.author.avatar_url} alt={project.author.username} />
                    <AvatarFallback className="bg-card text-xs font-semibold">
                      {project.author.username?.slice(0, 2).toUpperCase() || 'NA'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {project.author.username}
                    </p>
                    {project.hackathonName && project.hackathonDate && (
                      <p className="text-xs text-muted-foreground truncate">
                        {project.hackathonName} • {new Date(project.hackathonDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Crew on the right */}
                {(project.team_members && project.team_members.length > 0) && (
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wide">Crew</p>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {project.team_members.slice(0, 3).map((member, idx) => (
                        <div key={idx} className="flex flex-col bg-secondary/80 border-2 border-border px-3 py-2 rounded-[8px] min-w-[100px]">
                          <span className="text-xs font-bold text-foreground truncate">{truncateText(member.name, 3)}</span>
                          {member.role && (
                            <span className="text-[10px] text-muted-foreground truncate mt-0.5">{truncateText(member.role, 3)}</span>
                          )}
                        </div>
                      ))}
                      {project.team_members.length > 3 && (
                        <div className="text-xs text-muted-foreground font-medium px-2 py-1">
                          +{project.team_members.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tech stack */}
            {project.techStack && project.techStack.length > 0 && (
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
            )}
          </div>
        </Link>

        {/* Interactive section - Outside Link to prevent nested interactivity */}
        <div className="px-6 pb-6 space-y-3">
          {/* Vote buttons */}
          <div onClick={(e) => e.stopPropagation()}>
            <VoteButtons
              projectId={project.id}
              voteCount={project.voteCount}
              userVote={project.userVote as 'up' | 'down' | null}
            />
          </div>

          {/* Intro Request button for investors */}
          <div onClick={(e) => e.stopPropagation()}>
            <IntroRequest projectId={project.id} builderId={project.authorId} />
          </div>

          {/* Comment button */}
          <Link
            to={`/project/${project.id}#comments`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="font-medium">
              {project.commentCount} {project.commentCount === 1 ? 'Comment' : 'Comments'}
            </span>
            <span className="ml-auto text-xs">View & Reply →</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
