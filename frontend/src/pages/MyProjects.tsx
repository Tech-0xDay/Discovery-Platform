import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Eye, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUserProjects, useDeleteProject } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectCardSkeletonGrid } from '@/components/ProjectCardSkeleton';
import { toast } from 'sonner';

export default function MyProjects() {
  const { user } = useAuth();
  const { data, isLoading, error } = useUserProjects(user?.id || '');
  const deleteProjectMutation = useDeleteProject();
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-12">
        <div className="mx-auto max-w-5xl">
          {/* Header section */}
          <div className="mb-10 card-elevated p-8">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-black text-foreground mb-2">My Projects</h1>
                <p className="text-base text-muted-foreground">
                  Manage your published and draft projects
                </p>
              </div>
              <Link to="/publish" className="btn-primary inline-flex items-center gap-2 px-4 py-2 flex-shrink-0">
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </Link>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <ProjectCardSkeletonGrid count={4} />
          )}

          {/* Error state */}
          {error && (
            <div className="card-elevated p-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-lg font-bold text-foreground mb-2">Failed to load projects</p>
              <p className="text-sm text-muted-foreground">{(error as any)?.message || 'Please try again later'}</p>
            </div>
          )}

          {/* Projects List */}
          {!isLoading && !error && (
            <div className="space-y-6">
              {data?.data && data.data.length > 0 ? (
                data.data.map((project: any) => (
                  <div key={project.id} className="card-elevated overflow-hidden">
                    {/* Use the same ProjectCard as feed */}
                    <ProjectCard project={project} />

                    {/* Action buttons section - separate area below card */}
                    <div className="border-t-2 border-border bg-secondary/20 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-muted-foreground">
                          Project Actions
                        </p>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/project/${project.id}`}
                            className="btn-secondary inline-flex items-center gap-2 px-3 py-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </Link>
                          <Link
                            to={`/project/${project.id}/edit`}
                            className="btn-secondary inline-flex items-center gap-2 px-3 py-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
                                deleteProjectMutation.mutate(project.id);
                              }
                            }}
                            className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 border-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card-elevated p-12 text-center">
                  <div className="space-y-4">
                    <p className="text-lg font-bold text-foreground">You haven't published any projects yet.</p>
                    <p className="text-sm text-muted-foreground mb-6">Start by creating and publishing your first hackathon project</p>
                    <Link to="/publish" className="btn-primary inline-flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Publish Your First Project
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
