import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/supervisor/activity")({ component: Page })

function Page() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Activity feed</h1>
      <p className="mt-2 text-sm text-muted-foreground">Coming in a future sprint.</p>
    </div>
  )
}
