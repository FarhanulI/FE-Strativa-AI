import { type ReactNode } from "react";
import { CheckIcon } from "@/components/ui/icons";

interface GoalOptionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
}

export function GoalOptionCard({
  icon,
  title,
  description,
  selected,
  onToggle,
}: GoalOptionCardProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onToggle}
      className={`flex items-start gap-4 rounded-lg p-5 text-left shadow-sm transition-all ${
        selected ? "bg-primary/5" : "bg-surface hover:bg-surface-muted"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg shadow-sm ${
          selected ? "bg-surface text-primary" : "bg-surface-muted text-text-muted"
        }`}
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-grow flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-semibold leading-tight text-primary">{title}</h2>
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-opacity ${
              selected ? "bg-primary text-primary-foreground" : "bg-border text-transparent"
            }`}
          >
            <CheckIcon className="h-3 w-3" />
          </div>
        </div>
        <p className="line-clamp-2 text-sm text-text-muted">{description}</p>
      </div>
    </button>
  );
}
