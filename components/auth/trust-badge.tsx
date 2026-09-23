import { type ReactNode } from "react";

export function TrustBadge({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted">
      {icon}
      <span>{children}</span>
    </div>
  );
}
