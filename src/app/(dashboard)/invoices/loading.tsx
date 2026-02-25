export default function InvoicesLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border">
        <div className="skeleton-shimmer h-5 w-24" />
        <div className="skeleton-shimmer h-8 w-32 rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="px-6 py-5">
        <div className="rounded-lg border border-border overflow-hidden">
          {/* Filter bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-secondary">
            <div className="skeleton-shimmer h-8 w-56 rounded-md" />
            <div className="skeleton-shimmer h-8 w-32 rounded-md" />
          </div>
          {/* Header */}
          <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-secondary/50 border-b border-border">
            {['w-20', 'w-32', 'w-24', 'w-20', 'w-16'].map((w, i) => (
              <div key={i} className={`skeleton-shimmer h-3.5 ${w}`} />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 px-4 py-3.5 border-b border-border last:border-0"
            >
              <div className="skeleton-shimmer h-4 w-24" />
              <div className="skeleton-shimmer h-4 w-40" />
              <div className="skeleton-shimmer h-4 w-20" />
              <div className="skeleton-shimmer h-5 w-16 rounded-full" />
              <div className="skeleton-shimmer h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
