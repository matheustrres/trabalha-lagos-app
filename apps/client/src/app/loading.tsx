import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="pb-20">
      <Skeleton className="h-[350px] rounded-b-2xl rounded-t-none" />

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="mt-8 px-4">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <Skeleton key={j} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
