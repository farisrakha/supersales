import { Link, useRouterState } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  AnalyticsUpIcon,
  CheckListIcon,
  ChartIcon,
} from "@hugeicons/core-free-icons"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = {
  label: string
  to: string
  icon: IconSvgElement
}

const NAV_ITEMS: NavItem[] = [
  { label: "Supervisor", to: "/supervisor", icon: AnalyticsUpIcon },
  { label: "Admin", to: "/admin", icon: CheckListIcon },
  { label: "Executive", to: "/exec", icon: ChartIcon },
]

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

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
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive =
                  pathname === item.to || pathname.startsWith(`${item.to}/`)
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
