"use client";

import { useId, useState } from "react";
import { TextField } from "./text-field";
import { LockIcon, EyeIcon, EyeOffIcon } from "./icons";

interface PasswordFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  hint?: React.ReactNode;
  autoComplete?: string;
}

export function PasswordField({
  label,
  name,
  placeholder,
  hint,
  autoComplete = "current-password",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const fieldId = useId();

  return (
    <TextField
      id={fieldId}
      label={label}
      name={name}
      hint={hint}
      icon={<LockIcon className="h-4 w-4" />}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      autoComplete={autoComplete}
      suffix={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="text-text-muted hover:text-text"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOffIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
        </button>
      }
    />
  );
}
