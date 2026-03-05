export default function CustomerDetailLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border">
        <div className="space-y-1">
          <div className="skeleton-shimmer h-5 w-32" />
          <div className="skeleton-shimmer h-3.5 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer h-8 w-20 rounded-md" />
          <div className="skeleton-shimmer h-8 w-20 rounded-md" />
        </div>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-lg border border-border p-5 space-y-3">
              <div className="skeleton-shimmer h-4 w-28" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="space-y-1.5">
                    <div className="skeleton-shimmer h-3 w-20" />
                    <div className="skeleton-shimmer h-4 w-32" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-4">
          <div className="bg-surface rounded-lg border border-border p-5 space-y-3">
            <div className="skeleton-shimmer h-3 w-20" />
            <div className="skeleton-shimmer h-6 w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}
