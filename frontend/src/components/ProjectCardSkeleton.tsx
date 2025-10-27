import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectCardSkeleton() {
  return (
    <div className="group relative w-full h-full">
      <Card className="card-skeleton overflow-hidden relative w-full h-full box-border flex flex-col transition-all duration-300">
        {/* Main content container - scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* Header with title and proof score badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <Skeleton className="h-4 w-4 flex-shrink-0 mt-0.5 rounded" />
                <Skeleton className="h-6 flex-1 rounded" />
              </div>
              <Skeleton className="h-4 w-full rounded mb-2" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>

            {/* Proof score badge - top right */}
            <div className="flex-shrink-0">
              <Skeleton className="h-20 w-16 rounded-lg" />
            </div>
          </div>

          {/* Description - compact */}
          <div className="bg-secondary/40 rounded-lg p-2.5 border border-border/40 w-full">
            <Skeleton className="h-3 w-full rounded mb-1.5" />
            <Skeleton className="h-3 w-5/6 rounded mb-1.5" />
            <Skeleton className="h-3 w-4/6 rounded" />
          </div>

          {/* Tech stack - horizontal scroll */}
          <div className="flex gap-1.5 flex-wrap">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-10 rounded-full" />
          </div>

          {/* Creator info */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/40">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-2.5 w-32 rounded" />
              </div>
            </div>

            {/* Crew avatars skeleton */}
            <div className="flex-shrink-0 flex -space-x-1.5">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
        </div>

        {/* Interactive action buttons - sticky at bottom */}
        <div className="px-4 py-4 space-y-2 border-t border-border/40 bg-card/60 backdrop-blur-sm flex-shrink-0">
          {/* Demo and Code buttons */}
          <div className="flex items-center gap-2 justify-center">
            <Skeleton className="flex-1 h-9 rounded-lg" />
            <Skeleton className="flex-1 h-9 rounded-lg" />
          </div>

          {/* Vote buttons */}
          <Skeleton className="h-10 w-full rounded-lg" />

          {/* Intro Request button */}
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </Card>
    </div>
  );
}

// Skeleton grid for carousel view
export function ProjectCardSkeletonGrid({ count = 5 }: { count?: number }) {
  return (
    <div className="relative w-full px-4 md:px-8">
      <div className="flex gap-4 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <style>{'.flex::-webkit-scrollbar { display: none; }'}</style>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex-shrink-0 w-full sm:w-96 h-[520px]">
            <ProjectCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton for top rated carousel view
export function TopRatedCarouselSkeleton() {
  return (
    <div className="group relative w-full h-full">
      <Card className="card-skeleton overflow-hidden relative w-full h-full box-border flex flex-col transition-all duration-300">
        {/* Top Section - Title and Ranking */}
        <div className="flex-shrink-0 border-b border-border/30 px-4 sm:px-5 py-3 sm:py-4 bg-gradient-to-r from-slate-900/40 to-transparent">
          <div className="flex items-start gap-2 justify-between">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-6 w-32 rounded mb-1" />
              <Skeleton className="h-5 w-24 rounded" />
            </div>
            <div className="flex-shrink-0">
              <Skeleton className="h-8 w-12 rounded-full" />
            </div>
          </div>
        </div>

        {/* Middle Section - Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 space-y-3">
          {/* User info */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-24 rounded" />
            </div>
          </div>

          {/* Description */}
          <div>
            <Skeleton className="h-3 w-full rounded mb-1.5" />
            <Skeleton className="h-3 w-5/6 rounded mb-1.5" />
            <Skeleton className="h-3 w-4/6 rounded" />
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
        </div>

        {/* Action Bar - Vote and Comments */}
        <div className="flex-shrink-0 border-t border-border/40 px-4 sm:px-5 py-2.5 flex items-center gap-2 bg-card/60 backdrop-blur-sm">
          <Skeleton className="flex-1 h-9 rounded-lg" />
          <Skeleton className="h-9 w-16 rounded-lg" />
        </div>
      </Card>
    </div>
  );
}

// Skeleton grid for gallery view
export function GallerySkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="h-[600px] min-w-0">
          <ProjectCardSkeleton />
        </div>
      ))}
    </div>
  );
}
