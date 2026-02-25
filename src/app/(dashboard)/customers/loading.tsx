export default function CustomersLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border">
        <div className="space-y-1">
          <div className="skeleton-shimmer h-5 w-28" />
          <div className="skeleton-shimmer h-3.5 w-56" />
        </div>
        <div className="skeleton-shimmer h-8 w-32 rounded-md" />
      </div>

      {/* Table */}
      <div className="px-6 py-5">
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Search/filter bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary">
            <div className="skeleton-shimmer h-8 w-56 rounded-md" />
          </div>
          {/* Header */}
          <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-secondary/50 border-b border-border">
            {['w-28', 'w-36', 'w-24', 'w-20'].map((w, i) => (
              <div key={i} className={`skeleton-shimmer h-3.5 ${w}`} />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-4 px-4 py-4 border-b border-border last:border-0 items-center"
            >
              <div className="flex items-center gap-3">
                <div className="skeleton-shimmer w-8 h-8 rounded-full shrink-0" />
                <div className="skeleton-shimmer h-4 w-28" />
              </div>
              <div className="skeleton-shimmer h-4 w-36" />
              <div className="skeleton-shimmer h-4 w-24" />
              <div className="skeleton-shimmer h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
