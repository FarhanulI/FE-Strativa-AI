"use client";

import { type KeyboardEvent, type ReactNode, useState } from "react";
import { GripIcon, PlusIcon, TrashIcon } from "@/components/ui/icons";

interface DynamicListFieldProps {
  icon: ReactNode;
  title: string;
  description: string;
  items: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  addLabel: string;
}

export function DynamicListField({
  icon,
  title,
  description,
  items,
  onAdd,
  onRemove,
  placeholder,
  addLabel,
}: DynamicListFieldProps) {
  const [draft, setDraft] = useState("");

  function submit() {
    const value = draft.trim();
    if (value.length > 0) {
      onAdd(value);
      setDraft("");
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        {icon}
        <h3 className="text-sm font-semibold text-text">{title}</h3>
      </div>
      <p className="-mt-1.5 text-xs text-text-muted">{description}</p>

      {items.length > 0 && (
        <div className="flex flex-col gap-2">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center justify-between gap-2.5 rounded-lg border border-border bg-surface p-3 shadow-sm"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <GripIcon className="h-4 w-4 shrink-0 text-text-muted/60" />
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                <p className="truncate text-sm text-text">{item}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`Remove ${item}`}
                className="shrink-0 rounded p-1 text-text-muted transition-colors hover:text-red-600"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="button"
          onClick={submit}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-primary transition-colors hover:bg-surface-muted"
        >
          <PlusIcon className="h-4 w-4" />
          {addLabel}
        </button>
      </div>
    </div>
  );
}
