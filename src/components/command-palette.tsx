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

export function CommandPalette() {
  const open = useDevtools().commandOpen
  const setOpen = useDevtools().setCommandOpen
  const navigate = useNavigate()

  const accounts = useMockStore((s) => s.accounts)
  const visits = useMockStore((s) => s.visits)
  const products = useMockStore((s) => s.products)

  const recentVisits = React.useMemo(() => visits.slice(0, 20), [visits])

  function go(to: string) {
    setOpen(false)
    navigate({ to } as never)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Jump to anything"
      description="Search accounts, visits, and product catalog."
    >
      <CommandInput placeholder="Search accounts, visits, products" />
      <CommandList>
        <CommandEmpty>No results. Try a different term.</CommandEmpty>

        <CommandGroup heading="Accounts">
          {accounts.slice(0, 8).map((account) => (
            <CommandItem
              key={account.id}
              value={`account ${account.name} ${account.id}`}
              onSelect={() => go("/admin")}
            >
              <HugeiconsIcon icon={StoreLocation01Icon} strokeWidth={2} />
              <span className="truncate">{account.name}</span>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {account.city}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Recent visits">
          {recentVisits.map((v) => (
            <CommandItem
              key={v.id}
              value={`visit ${v.id} ${v.account_id} ${v.outcome}`}
              onSelect={() => go("/supervisor")}
            >
              <HugeiconsIcon icon={PackageIcon} strokeWidth={2} />
              <span className="truncate">{v.account_id}</span>
              <span className="ml-auto text-xs text-muted-foreground capitalize">
                {v.outcome.replace("_", " ")}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Products">
          {products.slice(0, 8).map((product) => (
            <CommandItem
              key={product.id}
              value={`product ${product.name} ${product.code}`}
              onSelect={() => go("/admin")}
            >
              <HugeiconsIcon icon={Tag01Icon} strokeWidth={2} />
              <span className="truncate">{product.name}</span>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {product.code}
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
