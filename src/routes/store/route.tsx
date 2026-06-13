import { Outlet, createFileRoute } from "@tanstack/react-router"

import { StoreLayout } from "@/components/store/store-layout"

export const Route = createFileRoute("/store")({
  component: StoreShell,
})

function StoreShell() {
  return (
    <StoreLayout>
      <Outlet />
    </StoreLayout>
  )
}
