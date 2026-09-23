import { type InputHTMLAttributes, type ReactNode } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  icon?: ReactNode;
  suffix?: ReactNode;
}

export function TextField({
  label,
  hint,
  icon,
  suffix,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <label
          htmlFor={fieldId}
          className="text-xs font-semibold uppercase tracking-wide text-text-muted"
        >
          {label}
        </label>
        {hint}
      </div>
      <div className="relative flex items-center">
        {icon && (
          <span className="pointer-events-none absolute left-3 text-text-muted">
            {icon}
          </span>
        )}
        <input
          id={fieldId}
          className={`w-full rounded-md border border-border bg-surface py-2.5 text-sm text-text placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            icon ? "pl-10" : "pl-3"
          } ${suffix ? "pr-3" : "pr-3"} ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-sm text-text-muted">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
