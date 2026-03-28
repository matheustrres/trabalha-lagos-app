import { cn } from '@/lib/utils/cn.utils'

interface SkeletonProps {
  className?: string
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={cn('animate-pulse rounded bg-gray-200', className)} />
)

export const JobCardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
    </div>
    <div className="mt-3 flex gap-2">
      <Skeleton className="h-5 w-16 rounded-full" />
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
    <div className="mt-3 space-y-1.5">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
)

export const JobListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <JobCardSkeleton key={i} />
    ))}
  </div>
)
