import { useId, type InputHTMLAttributes, type ReactNode } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function Checkbox({ label, id, className = "", ...props }: CheckboxProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <label htmlFor={fieldId} className="flex items-start gap-2 text-sm text-text">
      <input
        id={fieldId}
        type="checkbox"
        className={`mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary/20 ${className}`}
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}
