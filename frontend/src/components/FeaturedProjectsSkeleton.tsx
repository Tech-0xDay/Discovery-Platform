import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedProjectItemSkeleton() {
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center gap-4">
        {/* Rank Icon skeleton */}
        <div className="flex h-12 w-12 items-center justify-center flex-shrink-0">
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>

        {/* Title and Author skeleton */}
        <div className="flex-1">
          <Skeleton className="h-6 w-48 rounded mb-2" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>

        {/* Score skeleton */}
        <div className="text-right flex-shrink-0">
          <Skeleton className="h-8 w-12 rounded mb-1" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

export function FeaturedProjectsGridSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, idx) => (
        <FeaturedProjectItemSkeleton key={idx} />
      ))}
    </div>
  );
}

export function LeaderboardTabsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-20 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-lg" />
      </div>
      <FeaturedProjectsGridSkeleton count={6} />
    </div>
  );
}
