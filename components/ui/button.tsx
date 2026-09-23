import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "social";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent",
  secondary:
    "bg-surface text-text hover:bg-surface-muted border border-border",
  social:
    "bg-surface text-text hover:bg-surface-muted border border-border",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`flex cursor-pointer w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
