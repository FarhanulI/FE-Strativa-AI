"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CameraIcon, RefreshCwIcon, TrashIcon } from "@/components/ui/icons";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = "image/png, image/jpeg, image/webp";

interface WorkspaceLogoUploadProps {
  onFileSelect?: (file: File | null) => void;
}

export function WorkspaceLogoUpload({ onFileSelect }: WorkspaceLogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (selected.size > MAX_SIZE_BYTES) {
      setError("Selected file exceeds the 5MB size limit.");
      event.target.value = "";
      return;
    }

    setError(null);
    setFile(selected);
    onFileSelect?.(selected);
  }

  function handleRemove() {
    setFile(null);
    onFileSelect?.(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-semibold text-text">Workspace logo</label>
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
          Optional
        </span>
      </div>
      <p className="text-xs text-text-muted">
        PNG, JPEG, or WEBP up to 5MB. You can always change this later or skip for now.
      </p>

      <div className="flex flex-col items-center justify-between gap-4 rounded-lg bg-surface-muted p-4 sm:flex-row">
        <div className="flex w-full items-center gap-4 sm:w-auto">
          <div className="group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary text-primary-foreground shadow-sm">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Workspace logo preview" className="h-full w-full object-cover" />
            ) : (
              <svg viewBox="0 0 40 40" fill="none" className="h-8 w-8">
                <path d="M20 4L32 11V29L20 36L8 29V11L20 4Z" fill="currentColor" fillOpacity={0.12} />
                <path
                  d="M20 9L29 14.5V25.5L20 31L11 25.5V14.5L20 9Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                />
                <path
                  d="M15 15.5L24.5 17L15.5 22.5L25 24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100">
              <CameraIcon className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold text-text">
              {file ? file.name : "No logo chosen"}
            </span>
            <span className="text-xs text-text-muted">
              {file ? `${Math.round(file.size / 1024)} KB • Ready to sync` : "Using default geometric glyph"}
            </span>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-md bg-surface px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition-colors hover:bg-surface-muted"
          >
            <RefreshCwIcon className="h-3.5 w-3.5" />
            Replace
          </button>
          {file && (
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex items-center gap-1.5 rounded-md bg-surface px-3 py-1.5 text-xs font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50"
            >
              <TrashIcon className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
