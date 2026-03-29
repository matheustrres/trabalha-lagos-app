import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="px-4">
      <Skeleton className="mx-auto mt-20 h-96 max-w-md rounded-2xl" />
    </div>
  );
}
