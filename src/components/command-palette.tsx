import * as React from "react"
import { useNavigate } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  StoreLocation01Icon,
  PackageIcon,
  Tag01Icon,
} from "@hugeicons/core-free-icons"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { useDevtools } from "@/components/devtools-context"
import { useMockStore } from "@/mocks/state"

/**
 * Global jump menu. Press cmd+k or ctrl+k anywhere.
 * Three groups: stores, recent orders, SKUs. Selecting an item navigates.
 */
export function CommandPalette() {
  const open = useDevtools().commandOpen
  const setOpen = useDevtools().setCommandOpen
  const navigate = useNavigate()

  const stores = useMockStore((s) => s.stores)
  const orders = useMockStore((s) => s.orders)
  const skus = useMockStore((s) => s.skus)

  const recentOrders = React.useMemo(
    () => orders.slice(0, 25),
    [orders],
  )

  function go(to: string, params?: Record<string, string>) {
    setOpen(false)
    // TanStack router accepts string `to`; cast for ergonomic call sites.
    navigate({ to, params } as never)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Jump to anything"
      description="Search stores, orders, and catalog items by name or code."
    >
      <CommandInput placeholder="Search stores, orders, SKUs" />
      <CommandList>
        <CommandEmpty>No results. Try a different term.</CommandEmpty>

        <CommandGroup heading="Stores">
          {stores.slice(0, 8).map((store) => (
            <CommandItem
              key={store.id}
              value={`store ${store.name} ${store.id}`}
              onSelect={() => go("/stores")}
            >
              <HugeiconsIcon
                icon={StoreLocation01Icon}
                strokeWidth={2}
              />
              <span className="truncate">{store.name}</span>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {store.id.slice(-3)}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent orders">
          {recentOrders.map((o) => (
            <CommandItem
              key={o.id}
              value={`order ${o.id} ${o.status}`}
              onSelect={() => {
                // Orders open in DC dispatch when DC role is active; for the
                // store role they open in receive flow. The DC dispatch view
                // is the most useful default jump target across roles.
                go("/dispatch")
              }}
            >
              <HugeiconsIcon icon={PackageIcon} strokeWidth={2} />
              <span className="truncate">{o.id}</span>
              <span className="ml-auto text-xs text-muted-foreground capitalize">
                {o.status.replace("_", " ")}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Catalog">
          {skus.slice(0, 8).map((sku) => (
            <CommandItem
              key={sku.id}
              value={`sku ${sku.name} ${sku.code}`}
              onSelect={() => go("/catalog")}
            >
              <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
              <span className="truncate">{sku.name}</span>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {sku.code}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
