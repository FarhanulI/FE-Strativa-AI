"use client";

import { type KeyboardEvent, type ReactNode, useState } from "react";
import { XIcon } from "@/components/ui/icons";

interface TagInputFieldProps {
  id: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
  icon: ReactNode;
  chipClassName: string;
}

export function TagInputField({
  id,
  values,
  onAdd,
  onRemove,
  placeholder,
  icon,
  chipClassName,
}: TagInputFieldProps) {
  const [draft, setDraft] = useState("");

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && draft.trim().length > 0) {
      event.preventDefault();
      onAdd(draft.trim());
      setDraft("");
    }
  }

  return (
    <div className="rounded-lg bg-surface-muted p-0.5 transition-colors focus-within:bg-primary/10">
      <div className="flex min-h-[58px] flex-wrap items-center gap-2 rounded-md bg-surface p-2.5 shadow-sm">
        {values.map((value, index) => (
          <span
            key={`${value}-${index}`}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${chipClassName}`}
          >
            {icon}
            <span>{value}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Remove ${value}`}
              className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full text-text-muted hover:text-text focus:outline-none"
            >
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-w-[220px] flex-1 bg-transparent px-2 py-1 text-sm text-text placeholder:text-text-muted focus:outline-none"
        />
      </div>
    </div>
  );
}
