import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';

export default function WorkflowsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1500px] mx-auto">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Skeleton className="h-10 flex-1 min-w-[200px] max-w-md rounded-lg" />
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonCard key={i} className="h-44" />
        ))}
      </div>
    </div>
  );
}
