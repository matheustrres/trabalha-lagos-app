import { Skeleton } from "@/components/ui/skeleton";
import { JobListSkeleton } from "@/components/ui/skeleton";

export default function VagasLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <Skeleton className="h-12 rounded-xl" />

      <div className="mt-3 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>

      <Skeleton className="mt-4 h-4 w-48" />

      <div className="mt-4">
        <JobListSkeleton count={4} />
      </div>
    </div>
  );
}
