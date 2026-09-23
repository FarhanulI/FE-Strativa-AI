import { type ReactNode } from "react";
import { SparkleMarkIcon } from "@/components/ui/icons";

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-8 shadow-[0_1px_3px_rgba(15,23,42,0.05)]">
      <div className="mb-6 flex justify-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <SparkleMarkIcon className="h-5 w-5" />
        </div>
      </div>
      {children}
    </div>
  );
}
