export function PersonalLoading() {
  return (
    <div className="space-y-4 animate-pulse" data-testid="personal-loading">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-2xl p-5 space-y-4 flex flex-col justify-between shadow-xs"
          >
            <div className="space-y-3.5">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-full bg-surface-alt shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="bg-surface-alt rounded h-4 w-32" />
                    <div className="bg-surface-alt h-4 w-12 rounded-full" />
                  </div>
                  <div className="bg-surface-alt rounded h-3 w-20" />
                  <div className="bg-surface-alt rounded h-3 w-28" />
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <div className="bg-surface-alt rounded h-3 w-24" />
                <div className="flex flex-wrap gap-1.5">
                  <div className="bg-surface-alt rounded h-6 w-20" />
                  <div className="bg-surface-alt rounded h-6 w-24" />
                  <div className="bg-surface-alt rounded h-6 w-16" />
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <div className="bg-surface-alt rounded h-3 w-20" />
              <div className="bg-surface-alt rounded h-4 w-14" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
