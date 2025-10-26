import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectCardSkeletonGrid } from '@/components/ProjectCardSkeleton';
import { SortType } from '@/types';
import { Flame, Clock, TrendingUp, Zap, Loader2, Building2, ArrowRight } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/context/AuthContext';
import { projectsService } from '@/services/api';

// Map frontend sort types to backend sort types
const sortTypeMap: Record<SortType, string> = {
  hot: 'trending',
  new: 'newest',
  top: 'top-rated',
};

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [sortType, setSortType] = useState<SortType>('hot');
  const [page, setPage] = useState(1);

  // Convert frontend sort type to backend sort type
  const backendSort = sortTypeMap[sortType];
  const { data, isLoading, error } = useProjects(backendSort, page);

  // Prefetch all tabs on mount for instant switching
  useEffect(() => {
    const prefetchTabs = async () => {
      // Prefetch the other two tabs that aren't currently active
      const tabsToPrefetch = Object.values(sortTypeMap).filter(sort => sort !== backendSort);

      for (const sort of tabsToPrefetch) {
        queryClient.prefetchQuery({
          queryKey: ['projects', sort, 1],
          queryFn: async () => {
            const response = await projectsService.getAll(sort, 1);
            return {
              ...response.data,
              data: response.data.data || [],
            };
          },
        });
      }
    };

    prefetchTabs();
  }, []); // Only run once on mount

  return (
    <div className="bg-background min-h-screen overflow-hidden">
      <div className="container mx-auto px-6 py-12 overflow-hidden">
        {/* Header section */}
        <div className="mb-10 card-elevated p-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="badge-primary flex items-center justify-center h-12 w-12 flex-shrink-0 rounded-[15px]">
              <Zap className="h-6 w-6 text-black font-bold" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-foreground mb-2">
                Discover Projects
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Explore amazing hackathon projects with proof-weighted credibility. Find innovative builders, track their growth, and connect.
              </p>
            </div>
          </div>
        </div>

        {/* Sorting section */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs value={sortType} onValueChange={(v) => {
            setSortType(v as SortType);
            setPage(1); // Reset to first page when changing sort
          }}>
            <TabsList className="inline-flex h-auto rounded-[15px] bg-secondary border-4 border-black p-1">
              <TabsTrigger
                value="hot"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-quick data-[state=active]:bg-primary data-[state=active]:text-black"
              >
                <Flame className="h-4 w-4" />
                <span className="hidden sm:inline">Hot</span>
              </TabsTrigger>
              <TabsTrigger
                value="new"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-quick data-[state=active]:bg-primary data-[state=active]:text-black"
              >
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </TabsTrigger>
              <TabsTrigger
                value="top"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold transition-quick data-[state=active]:bg-primary data-[state=active]:text-black"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Top</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Results info */}
          {!isLoading && (
            <div className="text-sm font-bold text-muted-foreground">
              <span className="text-primary font-black">{data?.pagination?.total || 0}</span> projects
            </div>
          )}
        </div>

        {/* Loading state */}
        {isLoading && (
          <ProjectCardSkeletonGrid count={6} />
        )}

        {/* Error state */}
        {error && (
          <div className="card-elevated py-20 text-center p-8">
            <div className="space-y-4">
              <div className="text-6xl">❌</div>
              <p className="text-2xl font-black text-foreground">Failed to load projects</p>
              <p className="text-base text-muted-foreground">{(error as any)?.message || 'Please try again later'}</p>
            </div>
          </div>
        )}

        {/* Projects grid */}
        {!isLoading && !error && (
          <div className="grid gap-6 max-w-6xl mx-auto w-full box-border overflow-hidden">
            {!Array.isArray(data?.data) || data.data.length === 0 ? (
              <div className="card-elevated py-20 text-center p-8">
                <div className="space-y-4">
                  <div className="text-6xl">🚀</div>
                  <p className="text-2xl font-black text-foreground">No projects found</p>
                  <p className="text-base text-muted-foreground">Be the first to publish your amazing hackathon project!</p>
                </div>
              </div>
            ) : (
              data.data.map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && data?.pagination && (
          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-primary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="flex items-center px-4 font-bold">
              Page {data.pagination.page} of {data.pagination.total_pages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.pagination.total_pages}
              className="btn-primary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
