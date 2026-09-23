export function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
