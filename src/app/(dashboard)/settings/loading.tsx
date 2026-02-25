export default function SettingsLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="flex items-center h-14 px-6 border-b border-border">
        <div className="skeleton-shimmer h-5 w-20" />
      </div>

      <div className="px-6 py-6 max-w-3xl space-y-8">
        {/* Tabs skeleton */}
        <div className="flex gap-1 border-b border-border pb-0">
          {['w-24', 'w-28', 'w-24'].map((w, i) => (
            <div key={i} className={`skeleton-shimmer h-8 ${w} rounded-t-md`} />
          ))}
        </div>

        {/* Logo & branding section */}
        <div className="space-y-4">
          <div className="skeleton-shimmer h-4 w-28" />
          <div className="flex items-center gap-4">
            <div className="skeleton-shimmer w-16 h-16 rounded-lg" />
            <div className="space-y-2">
              <div className="skeleton-shimmer h-8 w-28 rounded-md" />
              <div className="skeleton-shimmer h-3.5 w-40" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="skeleton-shimmer h-3.5 w-20" />
            <div className="flex items-center gap-2">
              <div className="skeleton-shimmer w-9 h-9 rounded-md" />
              <div className="skeleton-shimmer h-9 w-32 rounded-md" />
            </div>
          </div>
        </div>

        {/* Business info section */}
        <div className="space-y-4">
          <div className="skeleton-shimmer h-4 w-36" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="skeleton-shimmer h-3.5 w-24" />
                <div className="skeleton-shimmer h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Address section */}
        <div className="space-y-4">
          <div className="skeleton-shimmer h-4 w-20" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`space-y-1.5 ${i < 2 ? 'sm:col-span-2' : ''}`}
              >
                <div className="skeleton-shimmer h-3.5 w-24" />
                <div className="skeleton-shimmer h-9 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Submit button */}
        <div className="skeleton-shimmer h-9 w-28 rounded-md" />
      </div>
    </div>
  );
}
