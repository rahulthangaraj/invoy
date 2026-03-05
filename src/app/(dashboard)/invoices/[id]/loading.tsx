export default function InvoiceDetailLoading() {
  return (
    <div>
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border">
        <div className="space-y-1">
          <div className="skeleton-shimmer h-5 w-28" />
          <div className="skeleton-shimmer h-3 w-36" />
        </div>
        <div className="skeleton-shimmer h-8 w-8 rounded-md" />
      </div>

      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Meta */}
          <div className="bg-surface rounded-lg border border-border p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="skeleton-shimmer h-3 w-16" />
                  <div className="skeleton-shimmer h-5 w-20" />
                </div>
              ))}
            </div>
          </div>

          {/* Line items table */}
          <div className="bg-surface rounded-lg border border-border overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-border-subtle">
              {['w-24', 'w-10', 'w-16', 'w-16'].map((w, i) => (
                <div key={i} className={`skeleton-shimmer h-3 ${w}`} />
              ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-border-subtle last:border-0">
                <div className="skeleton-shimmer h-4 w-32" />
                <div className="skeleton-shimmer h-4 w-8" />
                <div className="skeleton-shimmer h-4 w-16" />
                <div className="skeleton-shimmer h-4 w-16" />
              </div>
            ))}
            <div className="px-5 py-3 border-t border-border bg-secondary/30">
              <div className="flex justify-end">
                <div className="w-56 space-y-2">
                  <div className="flex justify-between">
                    <div className="skeleton-shimmer h-4 w-16" />
                    <div className="skeleton-shimmer h-4 w-20" />
                  </div>
                  <div className="flex justify-between pt-2 border-t border-border">
                    <div className="skeleton-shimmer h-5 w-12" />
                    <div className="skeleton-shimmer h-5 w-24" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-surface rounded-lg border border-border p-5 space-y-3">
            <div className="skeleton-shimmer h-3 w-12" />
            <div className="skeleton-shimmer h-4 w-32" />
            <div className="skeleton-shimmer h-4 w-28" />
          </div>
          <div className="bg-surface rounded-lg border border-border p-5 space-y-2">
            <div className="skeleton-shimmer h-3 w-20" />
            <div className="skeleton-shimmer h-8 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}
