import { Skeleton } from "@/components/ui/skeleton";

export default function VagaLoading() {
  return (
    <div className="mx-auto max-w-lg pb-20">
      <Skeleton className="h-10 rounded-none" />

      <div className="px-4 pt-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-14 w-14 shrink-0 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
