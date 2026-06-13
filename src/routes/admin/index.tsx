import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/admin/")({ component: AdminPage })

function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Admin
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">Coming soon.</p>
    </div>
  )
}
