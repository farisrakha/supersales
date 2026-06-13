import { Outlet, createFileRoute } from "@tanstack/react-router"

import { DriverLayout } from "@/components/driver/driver-layout"

export const Route = createFileRoute("/driver")({
  component: DriverRouteLayout,
})

function DriverRouteLayout() {
  return (
    <DriverLayout>
      <Outlet />
    </DriverLayout>
  )
}
