import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectCardSkeleton() {
  return (
    <div className="group relative w-full max-w-full overflow-hidden">
      <Card className="card-interactive overflow-hidden relative w-full box-border">
        <div className="p-6 space-y-4 max-w-full overflow-hidden">
          {/* Header with title and badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2 w-full">
              {/* Title line with star icon placeholder */}
              <div className="flex items-start gap-2 flex-wrap">
                <Skeleton className="h-6 w-6 flex-shrink-0 mt-0.5 rounded" />
                <Skeleton className="h-7 flex-1 rounded max-w-xs" />
                {/* Icon buttons placeholders */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>

              {/* Tagline skeleton */}
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-4/5 rounded" />
            </div>

            {/* Proof score badge skeleton */}
            <div className="flex-shrink-0">
              <Skeleton className="h-24 w-20 rounded-lg" />
            </div>
          </div>

          {/* Description box skeleton */}
          <div className="bg-secondary/30 rounded-lg p-3 border border-border/50 w-full overflow-hidden">
            <Skeleton className="h-4 w-full rounded mb-2" />
            <Skeleton className="h-4 w-5/6 rounded mb-2" />
            <Skeleton className="h-4 w-4/6 rounded" />
          </div>

          {/* Creator info section skeleton */}
          <div className="flex items-start justify-between gap-4 pt-2 border-t border-border/50">
            {/* Creator avatar and info */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>

            {/* Crew section skeleton */}
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-3 w-10 rounded" />
              <div className="flex flex-wrap gap-2 justify-end">
                <Skeleton className="h-8 w-28 rounded-lg" />
                <Skeleton className="h-8 w-28 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Tech stack skeleton */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>

        {/* Interactive section skeleton */}
        <div className="px-6 pb-6 space-y-3">
          {/* Vote buttons skeleton */}
          <Skeleton className="h-10 w-full rounded-lg" />

          {/* Intro request button skeleton */}
          <Skeleton className="h-10 w-full rounded-lg" />

          {/* Comment button skeleton */}
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </Card>
    </div>
  );
}

// Skeleton grid for multiple cards
export function ProjectCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 max-w-6xl mx-auto w-full box-border overflow-hidden">
      {Array.from({ length: count }).map((_, idx) => (
        <ProjectCardSkeleton key={idx} />
      ))}
    </div>
  );
}
