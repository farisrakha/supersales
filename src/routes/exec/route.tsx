import { Outlet, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/exec")({
  component: ExecLayout,
})

function ExecLayout() {
  return <Outlet />
}
