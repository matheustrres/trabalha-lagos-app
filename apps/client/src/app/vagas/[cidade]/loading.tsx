import { Skeleton } from "@/components/ui/skeleton";
import { JobListSkeleton } from "@/components/ui/skeleton";

export default function CidadeLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-4">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-24" />

      <div className="mt-4">
        <JobListSkeleton count={3} />
      </div>
    </div>
  );
}
