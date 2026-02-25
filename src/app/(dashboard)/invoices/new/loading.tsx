export default function NewInvoiceLoading() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-border bg-background shrink-0">
        <div className="skeleton-shimmer h-4 w-16" />
        <div className="flex items-center gap-2">
          <div className="skeleton-shimmer h-8 w-24 rounded-md" />
          <div className="skeleton-shimmer h-8 w-32 rounded-md" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Preview panel */}
        <div className="w-5/12 border-r border-border bg-secondary/30 p-6 hidden lg:block space-y-4">
          <div className="skeleton-shimmer h-3 w-16 mb-6" />
          {/* Invoice preview skeleton */}
          <div className="bg-surface rounded-lg border border-border p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="skeleton-shimmer h-6 w-28" />
                <div className="skeleton-shimmer h-4 w-40" />
              </div>
              <div className="skeleton-shimmer h-8 w-24 rounded-md" />
            </div>
            <div className="space-y-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skeleton-shimmer h-3.5 w-full" />
              ))}
            </div>
            <div className="border-t border-border pt-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="skeleton-shimmer h-4 w-48" />
                  <div className="skeleton-shimmer h-4 w-20" />
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4 flex justify-end">
              <div className="skeleton-shimmer h-6 w-32" />
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
            {/* Customer section */}
            <div className="space-y-2">
              <div className="skeleton-shimmer h-4 w-20 mb-3" />
              <div className="skeleton-shimmer h-10 w-full rounded-md" />
            </div>

            <div className="border-t border-border" />

            {/* Invoice details */}
            <div className="space-y-3">
              <div className="skeleton-shimmer h-4 w-28 mb-3" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="skeleton-shimmer h-3.5 w-24" />
                    <div className="skeleton-shimmer h-9 w-full rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Line items */}
            <div className="space-y-3">
              <div className="skeleton-shimmer h-4 w-20 mb-3" />
              {[...Array(2)].map((_, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <div className="skeleton-shimmer h-9 col-span-5 rounded-md" />
                  <div className="skeleton-shimmer h-9 col-span-2 rounded-md" />
                  <div className="skeleton-shimmer h-9 col-span-3 rounded-md" />
                  <div className="skeleton-shimmer h-9 col-span-2 rounded-md" />
                </div>
              ))}
              <div className="skeleton-shimmer h-8 w-32 rounded-md" />
            </div>

            <div className="border-t border-border" />

            {/* Notes */}
            <div className="space-y-3">
              <div className="skeleton-shimmer h-4 w-24 mb-3" />
              <div className="skeleton-shimmer h-20 w-full rounded-md" />
              <div className="skeleton-shimmer h-20 w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
