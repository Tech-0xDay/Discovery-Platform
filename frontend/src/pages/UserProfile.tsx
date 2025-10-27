import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Shield, Award, Loader2, AlertCircle, Github, ExternalLink } from 'lucide-react';
import { useUserByUsername } from '@/hooks/useUser';
import { useUserProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectCardSkeletonGrid } from '@/components/ProjectCardSkeleton';

export default function UserProfile() {
  const { username } = useParams();

  const { data: user, isLoading: userLoading, error: userError } = useUserByUsername(username || '');
  const { data: projectsData, isLoading: projectsLoading } = useUserProjects(user?.id || '');

  // Loading state
  if (userLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="card-elevated p-20 text-center flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (userError || !user) {
    return (
      <div className="bg-background min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <div className="card-elevated p-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground mb-2">User not found</p>
              <p className="text-sm text-muted-foreground">This user doesn't exist or has been removed</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen overflow-hidden">
      <div className="container mx-auto px-6 py-12 overflow-hidden">
        <div className="mx-auto max-w-5xl w-full box-border">
          {/* Profile Header Card */}
          <div className="card-elevated p-8 mb-10">
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
              <Avatar className="h-32 w-32 border-4 border-primary flex-shrink-0">
                <AvatarImage src={user.avatar} alt={username} />
                <AvatarFallback className="text-4xl font-black bg-primary text-black">
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="mb-4 flex flex-col items-center gap-3 md:items-start md:flex-row flex-wrap">
                  <h1 className="text-3xl font-black text-foreground">
                    {user.displayName || user.username}
                  </h1>
                  {user.isAdmin && (
                    <Badge className="bg-destructive text-white">
                      <Award className="mr-1 h-3 w-3" />
                      Admin
                    </Badge>
                  )}
                  {user.github_connected && user.github_username && (
                    <a
                      href={`https://github.com/${user.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-foreground hover:bg-secondary transition-smooth text-sm font-semibold"
                      title="View GitHub Profile"
                    >
                      <Github className="h-4 w-4" />
                      {user.github_username}
                    </a>
                  )}
                </div>
                <p className="mb-4 text-lg font-bold text-primary mb-3">@{user.username}</p>
                {user.bio && <p className="text-base text-foreground leading-relaxed">{user.bio}</p>}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-t-4 border-primary pt-8">
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">{user.projectCount}</div>
                <div className="text-sm font-bold text-muted-foreground">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">{user.karma}</div>
                <div className="text-sm font-bold text-muted-foreground">Karma</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-primary mb-1">
                  {new Date(user.createdAt).getFullYear()}
                </div>
                <div className="text-sm font-bold text-muted-foreground">Joined</div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="projects">
            <TabsList className="inline-flex h-auto rounded-[15px] bg-secondary border-4 border-black p-1 mb-8">
              <TabsTrigger
                value="projects"
                className="rounded-md px-4 py-2 text-sm font-bold transition-quick data-[state=active]:bg-primary data-[state=active]:text-black"
              >
                Projects ({projectsData?.data?.length || 0})
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-md px-4 py-2 text-sm font-bold transition-quick data-[state=active]:bg-primary data-[state=active]:text-black"
              >
                Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects">
              {projectsLoading ? (
                <ProjectCardSkeletonGrid count={3} />
              ) : projectsData?.data && projectsData.data.length > 0 ? (
                <div className="space-y-4">
                  {projectsData.data.map((project: any) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="card-elevated p-12 text-center">
                  <div className="space-y-3">
                    <p className="text-lg font-bold text-foreground">No projects yet</p>
                    <p className="text-sm text-muted-foreground">
                      Check back soon to see {user.displayName || user.username}'s projects
                    </p>
                  </div>
                </div>
              )}
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
