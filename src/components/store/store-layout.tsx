import * as React from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home03Icon,
  Clock04Icon,
  Wifi01Icon,
  BatteryFullIcon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { useMockStore } from "@/mocks/state"
import type { Store, User } from "@/mocks/types"

interface StoreLayoutProps {
  children: React.ReactNode
}

function pickStorePersona(users: User[]): User | undefined {
  return users.find((u) => u.role === "store")
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const users = useMockStore((s) => s.users)
  const stores = useMockStore((s) => s.stores)
  const location = useLocation()

  const persona = pickStorePersona(users)
  const store: Store | undefined = stores.find(
    (s) => s.id === persona?.store_id,
  )

  const onLogin = location.pathname.startsWith("/store/login")

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-start justify-center bg-gradient-to-b from-muted/60 to-background px-4 py-8">
      <div
        className={cn(
          "relative w-full max-w-[420px] overflow-hidden rounded-[2.25rem] border border-border bg-background shadow-2xl ring-1 ring-foreground/5",
          "flex flex-col",
        )}
        style={{ minHeight: "780px", maxHeight: "calc(100vh - 6rem)" }}
        aria-label="Store mobile preview"
      >
        <StatusBar
          storeName={store?.name ?? "Toko"}
          personaName={persona?.name ?? "Budi"}
          hidePersona={onLogin}
        />
        <div className="flex-1 overflow-y-auto bg-background">{children}</div>
        {!onLogin ? <BottomTabs /> : null}
      </div>
    </div>
  )
}

function StatusBar({
  storeName,
  personaName,
  hidePersona,
}: {
  storeName: string
  personaName: string
  hidePersona?: boolean
}) {
  return (
    <div className="shrink-0 bg-foreground/[0.03] text-foreground">
      <div className="flex items-center justify-between px-5 pt-3 pb-1 text-[10px] font-medium tabular-nums text-muted-foreground">
        <span>08:00</span>
        <span className="flex items-center gap-1.5">
          <HugeiconsIcon
            icon={Wifi01Icon}
            strokeWidth={2}
            className="size-3"
          />
          <HugeiconsIcon
            icon={BatteryFullIcon}
            strokeWidth={2}
            className="size-3"
          />
        </span>
      </div>
      {!hidePersona ? (
        <div className="flex items-center gap-2 px-5 pt-1 pb-3">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon
              icon={SmartPhone01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate font-heading text-sm font-semibold leading-tight">
              {storeName}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              Masuk sebagai {personaName}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-2" />
      )}
    </div>
  )
}

function BottomTabs() {
  const location = useLocation()
  const items = [
    {
      to: "/store",
      label: "Beranda",
      icon: Home03Icon,
      match: (p: string) => p === "/store" || p === "/store/",
    },
    {
      to: "/store/history",
      label: "Riwayat",
      icon: Clock04Icon,
      match: (p: string) => p.startsWith("/store/history"),
    },
  ] as const

  return (
    <nav
      aria-label="Store navigation"
      className="shrink-0 border-t border-border bg-background"
    >
      <ul className="flex">
        {items.map((item) => {
          const active = item.match(location.pathname)
          return (
            <li key={item.to} className="flex-1">
              <Link
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <HugeiconsIcon
                  icon={item.icon}
                  strokeWidth={2}
                  className="size-5"
                />
                <span>{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
