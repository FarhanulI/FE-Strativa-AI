import { PlusIcon } from "@/components/ui/icons";

interface SuggestionChipsProps {
  label: string;
  options: string[];
  onSelect: (value: string) => void;
}

export function SuggestionChips({ label, options, onSelect }: SuggestionChipsProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-border hover:text-text"
          >
            <PlusIcon className="h-3.5 w-3.5" />
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
