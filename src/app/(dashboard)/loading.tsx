export default function DashboardLoading() {
  return (
    <div>
      {/* Page header skeleton */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border">
        <div className="skeleton-shimmer h-5 w-24" />
        <div className="skeleton-shimmer h-8 w-32 rounded-md" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-lg border border-border p-5 space-y-3">
            <div className="skeleton-shimmer h-4 w-28" />
            <div className="skeleton-shimmer h-8 w-36" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="px-6">
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-secondary border-b border-border">
            {['w-20', 'w-32', 'w-24', 'w-20', 'w-16'].map((w, i) => (
              <div key={i} className={`skeleton-shimmer h-3.5 ${w}`} />
            ))}
          </div>
          {/* Table rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 px-4 py-3.5 border-b border-border last:border-0"
            >
              <div className="skeleton-shimmer h-4 w-24" />
              <div className="skeleton-shimmer h-4 w-36" />
              <div className="skeleton-shimmer h-4 w-20" />
              <div className="skeleton-shimmer h-5 w-16 rounded-full" />
              <div className="skeleton-shimmer h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
