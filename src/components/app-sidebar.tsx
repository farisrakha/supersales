import { Link, useRouterState } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  ActivityIcon,
  Building01Icon,
  ChartIcon,
  CheckListIcon,
  Home01Icon,
  InboxIcon,
  Package01Icon,
  UserGroupIcon,
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
  exact?: boolean
}

type SidebarConfig = {
  label: string
  items: NavItem[]
}

const CONFIGS: Record<Role, SidebarConfig> = {
  supervisor: {
    label: "Supervisor",
    items: [
      { label: "Today", to: "/supervisor", icon: Home01Icon, exact: true },
      { label: "Visit queue", to: "/supervisor/visits", icon: CheckListIcon },
      { label: "Activity feed", to: "/supervisor/activity", icon: ActivityIcon },
      { label: "Accounts", to: "/supervisor/accounts", icon: Building01Icon },
    ],
  },
  admin: {
    label: "Admin",
    items: [
      { label: "Accounts", to: "/admin", icon: Building01Icon, exact: true },
      { label: "Reps", to: "/admin/reps", icon: UserGroupIcon },
      { label: "Product catalog", to: "/admin/catalog", icon: Package01Icon },
      { label: "Quote inbox", to: "/admin/quotes", icon: InboxIcon },
    ],
  },
  exec: {
    label: "Executive",
    items: [
      { label: "Overview", to: "/exec", icon: ChartIcon, exact: true },
    ],
  },
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const role = useMockStore((s) => s.currentRole)
  const config = CONFIGS[role]

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
        <SidebarGroup>
          <SidebarGroupLabel>{config.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {config.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.to || pathname === `${item.to}/`
                  : pathname === item.to || pathname.startsWith(`${item.to}/`)
                return (
                  <SidebarMenuItem key={item.to}>
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
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-1 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          Demo build, May 2026
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
