import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectDetailSkeleton() {
  return (
    <div className="bg-background min-h-screen overflow-hidden">
      <div className="container mx-auto px-6 py-12 overflow-hidden">
        <div className="mx-auto max-w-5xl w-full box-border">
          {/* Hero Header Section */}
          <div className="mb-8 card-elevated p-6">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div className="flex-1">
                {/* Featured badge skeleton */}
                <div className="mb-3">
                  <Skeleton className="h-6 w-24 rounded" />
                </div>
                {/* Title skeleton */}
                <Skeleton className="h-10 w-3/4 rounded mb-3" />
                {/* Tagline skeleton */}
                <Skeleton className="h-5 w-full rounded mb-1" />
                <Skeleton className="h-5 w-5/6 rounded" />
              </div>

              {/* Score Badge skeleton */}
              <Skeleton className="h-24 w-24 rounded-[15px] flex-shrink-0" />
            </div>

            {/* Vote Section skeleton */}
            <div className="border-t-4 border-black pt-4 mb-4">
              <Skeleton className="h-10 w-48 rounded-lg mb-3" />
              <Skeleton className="h-4 w-full rounded" />
            </div>

            {/* Action Buttons skeleton */}
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-28 rounded-lg" />
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
          </div>

          {/* Creator & Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Creator Card */}
            <div className="card-elevated p-5 md:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 rounded mb-2" />
                  <Skeleton className="h-4 w-48 rounded" />
                </div>
              </div>

              {/* Team Members section skeleton */}
              <div className="border-t border-border/50 pt-3">
                <Skeleton className="h-4 w-12 rounded mb-3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-32 rounded-lg" />
                  <Skeleton className="h-8 w-32 rounded-lg" />
                  <Skeleton className="h-8 w-32 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Verification Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* 0xCert Card skeleton */}
            <div className="card-elevated p-5">
              <Skeleton className="h-5 w-40 rounded mb-4" />
              {/* NFT Image skeleton */}
              <Skeleton className="aspect-square w-full rounded-lg mb-4" />
              {/* NFT Details skeleton */}
              <div className="space-y-3">
                <div>
                  <Skeleton className="h-3 w-12 rounded mb-1" />
                  <Skeleton className="h-4 w-32 rounded" />
                </div>
                <div>
                  <Skeleton className="h-3 w-16 rounded mb-1" />
                  <Skeleton className="h-4 w-40 rounded" />
                </div>
                <div>
                  <Skeleton className="h-3 w-12 rounded mb-1" />
                  <Skeleton className="h-4 w-full rounded" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg mt-3" />
              </div>
            </div>

            {/* Validation Status skeleton */}
            <div className="card-elevated p-5">
              <Skeleton className="h-5 w-40 rounded mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-6 w-full rounded" />
                <Skeleton className="h-6 w-full rounded" />
                <Skeleton className="h-6 w-5/6 rounded" />
              </div>
            </div>
          </div>

          {/* About Section skeleton */}
          <div className="card-elevated p-6 mb-8">
            <Skeleton className="h-7 w-40 rounded mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          </div>

          {/* Hackathon Details skeleton */}
          <div className="card-elevated p-6 mb-8">
            <Skeleton className="h-7 w-40 rounded mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-5 w-full rounded" />
              <Skeleton className="h-5 w-full rounded" />
            </div>
          </div>

          {/* Tech Stack skeleton */}
          <div className="card-elevated p-6 mb-8">
            <Skeleton className="h-7 w-32 rounded mb-4" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>

          {/* Comments Section skeleton */}
          <div className="card-elevated p-6">
            <Skeleton className="h-7 w-40 rounded mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="border-b border-border/50 pb-4 last:border-b-0">
                  <div className="flex items-start gap-3 mb-2">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 rounded mb-1" />
                      <Skeleton className="h-3 w-24 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full rounded mb-1" />
                  <Skeleton className="h-4 w-5/6 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
