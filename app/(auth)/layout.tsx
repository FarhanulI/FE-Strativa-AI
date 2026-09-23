import Link from "next/link";
import { ArrowLeftIcon, UserCircleIcon } from "@/components/ui/icons";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="Back" className="text-text-muted hover:text-text">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <span className="text-sm font-semibold tracking-tight text-text">
            STRATIVA AI
          </span>
        </div>
        {/* <nav className="flex items-center gap-6 text-sm text-text-muted">
          <Link href="#" className="hover:text-text">
            Need Help?
          </Link>
          <Link href="#" className="hover:text-text">
            Documentation
          </Link>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UserCircleIcon className="h-5 w-5" />
          </span>
        </nav> */}
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="flex items-center justify-between border-t border-border px-6 py-4 text-xs text-text-muted">
        <span>&copy; {new Date().getFullYear()} STRATIVA AI. All rights reserved.</span>
        <nav className="flex items-center gap-4">
          <Link href="#" className="hover:text-text">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-text">
            Terms of Service
          </Link>
          <Link href="#" className="hover:text-text">
            Security
          </Link>
        </nav>
      </footer>
    </div>
  );
}
