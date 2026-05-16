export default function RootLoading() {
  return (
    <div
      className="min-h-[100dvh] bg-surface-0 flex items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-accent-primary/20 border border-accent-primary/30 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-accent-primary/40 border-t-accent-primary rounded-full animate-spin" />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-accent-primary/10 blur-xl -z-10" />
        </div>
        <p className="text-[12px] text-text-tertiary">Loading…</p>
      </div>
    </div>
  );
}
