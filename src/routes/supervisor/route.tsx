import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/supervisor")({
  component: SupervisorLayout,
})

function SupervisorLayout() {
  return <Outlet />
}
