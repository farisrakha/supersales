import { Link, useRouterState } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Sun03Icon,
  CheckListIcon,
  PackageIcon,
  DeliveryTruck02Icon,
  RouteIcon,
  StoreLocation01Icon,
  Tag01Icon,
  InvoiceIcon,
  AnalyticsUpIcon,
  Alert02Icon,
  Home01Icon,
  Calendar03Icon,
  MapPinpoint02Icon,
  ChartIcon,
} from "@hugeicons/core-free-icons"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useMockStore } from "@/mocks/state"
import type { Role } from "@/mocks/types"

type NavItem = {
  label: string
  to: string
  icon: IconSvgElement
}

type NavGroup = {
  label: string
  items: NavItem[]
}

const GROUPS: Record<Role, NavGroup[]> = {
  "ops-manager": [
    {
      label: "DC Operations",
      items: [
        { label: "Today", to: "/", icon: Sun03Icon },
        { label: "Suggested orders", to: "/suggested-orders", icon: CheckListIcon },
        { label: "Dispatch", to: "/dispatch", icon: PackageIcon },
        { label: "In transit", to: "/in-transit", icon: DeliveryTruck02Icon },
      ],
    },
    {
      label: "Reference",
      items: [
        { label: "Stores", to: "/stores", icon: StoreLocation01Icon },
        { label: "Catalog", to: "/catalog", icon: Tag01Icon },
        { label: "Reconciliation", to: "/reconciliation", icon: InvoiceIcon },
      ],
    },
  ],
  supervisor: [
    {
      label: "Supervisor",
      items: [
        { label: "Cluster health", to: "/supervisor", icon: AnalyticsUpIcon },
        { label: "Exceptions", to: "/supervisor", icon: Alert02Icon },
      ],
    },
  ],
  exec: [
    {
      label: "Executive",
      items: [{ label: "Overview", to: "/exec", icon: ChartIcon }],
    },
  ],
  store: [
    {
      label: "Store",
      items: [
        { label: "Home", to: "/store", icon: Home01Icon },
        { label: "Past orders", to: "/store/history", icon: Calendar03Icon },
      ],
    },
  ],
  driver: [
    {
      label: "Driver",
      items: [
        { label: "My route", to: "/driver", icon: RouteIcon },
        { label: "Sign in", to: "/driver/login", icon: MapPinpoint02Icon },
      ],
    },
  ],
}

export function AppSidebar() {
  const role = useMockStore((s) => s.currentRole)
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const groups = GROUPS[role]

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <div
            aria-hidden
            className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background"
          >
            <span className="font-heading text-xs font-semibold tracking-tight">
              S
            </span>
          </div>
          <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-sm font-semibold tracking-tight">
              SuperSales
            </span>
            <span className="text-[11px] text-muted-foreground">
              Field sales execution
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive =
                    item.to === "/"
                      ? pathname === "/"
                      : pathname === item.to ||
                        pathname.startsWith(`${item.to}/`)
                  return (
                    <SidebarMenuItem key={item.to + item.label}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={item.label}
                        render={
                          <Link to={item.to}>
                            <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                            <span>{item.label}</span>
                          </Link>
                        }
                      />
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-1 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          Demo build, May 2026
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
