export default function OnboardingLayout({
  children,
}: LayoutProps<"/onboarding">) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="fixed top-0 z-50 w-full border-b border-border bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold tracking-tight text-primary">
              STRATIVA AI
            </span>
          </div>
          <div className="flex items-center gap-2 text-text-muted">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="rounded-full border border-border bg-surface-muted px-2 py-0.5 text-xs text-text-muted">
              Onboarding
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-4 pt-16 md:px-8">
        {children}
      </main>
    </div>
  );
}
