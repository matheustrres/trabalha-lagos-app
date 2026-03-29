import { Skeleton } from "@/components/ui/skeleton";

export default function PainelLoading() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="mt-2 h-4 w-64" />

      <div className="mt-6 grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
