import { useParams, Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, ArrowDown, Github, ExternalLink, Award, Calendar, Code, Loader2, AlertCircle, Shield, Image as ImageIcon, Users } from 'lucide-react';
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

  // Debug: Log team members
  console.log('Project team_members:', project.team_members);
  console.log('Full project data:', project);

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
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
              {user?.id !== project.authorId && (
                <IntroRequest projectId={project.id} builderId={project.authorId} />
              )}
            </div>
          </div>

          {/* Creator & Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Creator Card */}
            <div className="card-elevated p-5 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12 border-3 border-primary">
                  <AvatarImage src={project.author?.avatar} alt={project.author?.username} />
                  <AvatarFallback className="bg-primary text-foreground font-bold text-sm">
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
                  {project.author?.isVerified && (
                    <span className="badge-primary ml-2 inline-block text-xs">✓ Verified</span>
                  )}
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

            {/* Score Breakdown Card */}
            {project.proofScore && (
              <div className="card-elevated p-5">
                <h3 className="font-black text-sm mb-3 text-foreground">Score Breakdown</h3>
                <div className="space-y-3">
                  {project.proofScore.verification !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">Verification</span>
                        <span className="text-primary font-black">{project.proofScore.verification}</span>
                      </div>
                      <div className="h-2 bg-secondary border-2 border-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(project.proofScore.verification, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {project.proofScore.community !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">Community</span>
                        <span className="text-primary font-black">{project.proofScore.community}</span>
                      </div>
                      <div className="h-2 bg-secondary border-2 border-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(project.proofScore.community, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {project.proofScore.quality !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold">Quality</span>
                        <span className="text-primary font-black">{project.proofScore.quality}</span>
                      </div>
                      <div className="h-2 bg-secondary border-2 border-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(project.proofScore.quality, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 0xCert Verification */}
            {project.author?.has_oxcert && (
              <div className="card-elevated p-5 mt-4">
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
                  <div className="flex items-center gap-2 p-2 bg-primary/10 rounded border border-primary/30">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-foreground font-semibold">Verified</span>
                    <span className="text-xs text-primary font-bold ml-auto">+10pts</span>
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
                        className="btn-secondary text-xs inline-flex items-center justify-center gap-2 w-full"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Wallet
                      </a>
                    )}
                    {project.author?.oxcert_token_id && project.author?.full_wallet_address && (
                      <a
                        href={`https://kairos.kaiascan.io/token/${import.meta.env.VITE_OXCERTS_CONTRACT_ADDRESS}?a=${project.author.oxcert_token_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary text-xs inline-flex items-center justify-center gap-2 w-full"
                      >
                        <Shield className="h-3 w-3" />
                        View NFT
                      </a>
                    )}
                  </div>
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
