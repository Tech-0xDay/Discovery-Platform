import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, ArrowDown, Github, ExternalLink, Award, Calendar, Code, Loader2, AlertCircle, Shield, Image as ImageIcon, Users, Share2, Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { useCheckIfSaved, useSaveProject, useUnsaveProject } from '@/hooks/useSavedProjects';
import { VoteButtons } from '@/components/VoteButtons';
import { CommentSection } from '@/components/CommentSection';
import { BadgeAwarder } from '@/components/BadgeAwarder';
import { IntroRequest } from '@/components/IntroRequest';
import { ValidationStatusCard } from '@/components/ValidationStatusCard';
import { ProjectDetailSkeleton } from '@/components/ProjectDetailSkeleton';
import { useAuth } from '@/context/AuthContext';
import { useProjectById } from '@/hooks/useProjects';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data, isLoading, error } = useProjectById(id || '');
  const { data: isSaved, isLoading: checkingIfSaved } = useCheckIfSaved(id || '');
  const saveMutation = useSaveProject();
  const unsaveMutation = useUnsaveProject();

  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/project/${id}`;
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Please login to save projects');
      return;
    }

    if (!id) return;

    if (isSaved) {
      unsaveMutation.mutate(id);
    } else {
      saveMutation.mutate(id);
    }
  };

  // Loading state
  if (isLoading) {
    return <ProjectDetailSkeleton />;
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
    <div className="bg-background min-h-screen overflow-hidden">
      <div className="container mx-auto px-6 py-12 overflow-hidden">
        <div className="mx-auto max-w-5xl w-full box-border">
          {/* Hero Header Section */}
          <div className="mb-8 card-elevated p-6">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  {project.isFeatured && (
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
                <div className="text-3xl font-black text-foreground">{project.proofScore?.total || 0}</div>
                <div className="text-xs font-bold text-foreground">Score</div>
              </div>
            </div>

            {/* Vote Section */}
            <div className="border-t-4 border-black pt-4 mb-4">
              <div className="flex items-center gap-4">
                <VoteButtons
                  projectId={project.id}
                  voteCount={project.voteCount}
                  userVote={project.userVote as 'up' | 'down' | null}
                />
                <div className="text-sm text-muted-foreground">
                  Vote to show your support for this project
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {project.demoUrl && (
                <a href={project.demoUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <ExternalLink className="mr-2 h-5 w-5 inline" />
                  View Live Demo
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                  <Github className="mr-2 h-5 w-5 inline" />
                  View Code
                </a>
              )}
              <BadgeAwarder projectId={project.id} />

              {/* Share and Save buttons */}
              <button onClick={handleShare} className="btn-secondary">
                <Share2 className="mr-2 h-4 w-4 inline" />
                Share
              </button>
              <button
                onClick={handleSave}
                disabled={checkingIfSaved || saveMutation.isPending || unsaveMutation.isPending}
                className={`btn-secondary disabled:opacity-50 ${isSaved ? 'bg-primary text-black hover:bg-primary/90' : ''}`}
              >
                <Bookmark className={`mr-2 h-4 w-4 inline ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </button>
              {user?.id !== project.authorId && (
                <IntroRequest projectId={project.id} builderId={project.authorId} />
              )}
            </div>
          </div>

          {/* Creator & Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Creator Card */}
            <div className="card-elevated p-5 md:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 border-3 border-primary">
                  <AvatarImage src={project.author?.avatar} alt={project.author?.username} />
                  <AvatarFallback className="bg-primary text-black font-bold text-sm">
                    {project.author?.username?.slice(0, 2).toUpperCase() || 'NA'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Link
                    to={`/u/${project.author?.username}`}
                    className="text-lg font-bold text-primary hover:opacity-80 transition-quick"
                  >
                    {project.author?.username}
                  </Link>
                  {project.hackathonName && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {project.hackathonName} • {project.hackathonDate && new Date(project.hackathonDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Team Members / Crew */}
              {project.team_members && project.team_members.length > 0 && (
                <div className="border-t border-border/50 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs font-semibold text-muted-foreground uppercase">Crew</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.team_members.map((member: any, idx: number) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary/30 rounded-lg border border-border"
                      >
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                          <span className="text-xs font-bold text-primary">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-semibold text-foreground leading-none">{member.name}</p>
                          {member.role && (
                            <p className="text-xs text-muted-foreground leading-none mt-0.5">{member.role}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* 0xCert Verification */}
            {project.author?.has_oxcert && (
              <div className="card-elevated p-5">
                <h3 className="font-black text-sm mb-3 text-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  0xCert Verification
                </h3>

                {/* NFT Image */}
                {project.author?.oxcert_metadata?.image && (
                  <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden border-2 border-primary/30">
                    <img
                      src={project.author.oxcert_metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                      alt={project.author.oxcert_metadata.name || '0xCert NFT'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden absolute inset-0 flex items-center justify-center bg-secondary/50">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                )}

                {/* NFT Details */}
                <div className="space-y-2">
                  {project.author?.oxcert_metadata?.name && (
                    <div>
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="text-sm font-semibold text-foreground">{project.author.oxcert_metadata.name}</p>
                    </div>
                  )}

                  {project.author?.oxcert_token_id && (
                    <div>
                      <p className="text-xs text-muted-foreground">Token ID</p>
                      <p className="text-sm font-mono text-foreground">#{project.author.oxcert_token_id}</p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs text-muted-foreground">Wallet</p>
                    <p className="text-sm font-mono text-foreground break-all">{project.author?.wallet_address}</p>
                  </div>

                  {/* Verification Score */}
                  <div className="flex items-center gap-2 p-2 bg-primary rounded border border-primary hover:bg-primary/90 transition-all duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-black hover:scale-110 transition-transform duration-200 stroke-black" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-black font-bold">Verified</span>
                    <span className="text-xs text-black font-bold ml-auto">+10pts</span>
                  </div>

                  {/* Attributes */}
                  {project.author?.oxcert_metadata?.attributes && project.author.oxcert_metadata.attributes.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-2">Attributes</p>
                      <div className="space-y-1">
                        {project.author.oxcert_metadata.attributes.map((attr, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-secondary/30 rounded border border-border">
                            <p className="text-xs text-muted-foreground">{attr.trait_type}</p>
                            <p className="text-xs font-medium text-foreground">{attr.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explorer Links */}
                  <div className="flex flex-col gap-2 pt-2">
                    {project.author?.full_wallet_address && (
                      <a
                        href={`https://kairos.kaiascan.io/account/${project.author.full_wallet_address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs inline-flex items-center justify-center gap-2 w-full"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Wallet
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Validation Status Card */}
            <ValidationStatusCard badges={project.badges} />
          </div>

          {/* About Section */}
          <div className="card-elevated p-6 mb-8">
            <h2 className="text-2xl font-black mb-4 text-foreground">About This Project</h2>
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-foreground leading-relaxed text-sm">
              {project.description}
            </div>
          </div>

          {/* Hackathon Details */}
          {(project.hackathonName || project.hackathonDate) && (
            <div className="card-elevated p-6 mb-8">
              <h2 className="text-2xl font-black mb-4 text-foreground flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Hackathon Details
              </h2>
              <div className="space-y-3">
                {project.hackathonName && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground min-w-[100px]">Event:</span>
                    <span className="text-sm text-foreground font-medium">{project.hackathonName}</span>
                  </div>
                )}
                {project.hackathonDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-bold text-muted-foreground min-w-[100px]">Date:</span>
                    <span className="text-sm text-foreground">{new Date(project.hackathonDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Screenshots Section */}
          {project.screenshots && project.screenshots.length > 0 && (
            <div className="card-elevated p-6 mb-8">
              <h2 className="text-2xl font-black mb-4 text-foreground">Screenshots</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.screenshots.map((screenshot: string, index: number) => (
                  <div key={index} className="relative group cursor-pointer" onClick={() => window.open(screenshot, '_blank')}>
                    <img
                      src={screenshot}
                      alt={`${project.title} - Screenshot ${index + 1}`}
                      className="w-full h-64 object-cover rounded-lg border-2 border-black transition-transform hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                      <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      Screenshot {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack Section */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="card-elevated p-6 mb-8">
              <h2 className="text-2xl font-black mb-4 text-foreground flex items-center gap-2">
                <Code className="h-6 w-6 text-primary" />
                Tech Stack
              </h2>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech: string) => (
                  <span key={tech} className="badge-primary text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Team/Crew Section */}
          {project.team_members && project.team_members.length > 0 && (
            <div className="card-elevated p-6 mb-8">
              <h2 className="text-2xl font-black mb-4 text-foreground flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Team & Crew
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.team_members.map((member: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-secondary/20 rounded-lg border border-border">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 border-2 border-primary/30">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role || 'Team Member'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <div id="comments" className="card-elevated p-6 scroll-mt-20">
            <h2 className="text-2xl font-black mb-6 text-foreground">Comments & Discussion</h2>
            <CommentSection projectId={project.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
