import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface ClusterOption {
  id: string
  label: string
  dcName: string
  storeCount: number
}

interface ClusterPickerProps {
  options: ClusterOption[]
  value: string[]
  onChange: (next: string[]) => void
}

export function ClusterPicker({ options, value, onChange }: ClusterPickerProps) {
  const [open, setOpen] = React.useState(false)
  const selected = new Set(value)

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(Array.from(next))
  }

  const clear = (event: React.MouseEvent) => {
    event.stopPropagation()
    onChange([])
  }

  const triggerLabel =
    value.length === 0
      ? "All clusters"
      : value.length === 1
        ? (options.find((o) => o.id === value[0])?.label ?? value[0])
        : `${value.length} clusters`

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className="h-9 min-w-56 justify-between gap-2 rounded-3xl"
          >
            <span className="flex items-center gap-2 text-sm">
              <span className="font-medium text-foreground">
                {triggerLabel}
              </span>
              {value.length > 1 ? (
                <Badge variant="secondary" className="font-normal">
                  {value.length}
                </Badge>
              ) : null}
            </span>
            <span className="flex items-center gap-1">
              {value.length > 0 ? (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={clear}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onChange([])
                    }
                  }}
                  className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Clear selection"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    strokeWidth={2}
                    className="size-3.5"
                  />
                </span>
              ) : null}
              <HugeiconsIcon
                icon={ArrowDown01Icon}
                strokeWidth={2}
                className="size-4 text-muted-foreground"
              />
            </span>
          </Button>
        }
      />
      <PopoverContent align="start" className="w-72 p-0">
        <Command>
          <CommandInput placeholder="Find cluster" />
          <CommandList>
            <CommandEmpty>No clusters match.</CommandEmpty>
            <CommandGroup heading="Clusters">
              {options.map((opt) => {
                const isOn = selected.has(opt.id)
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggle(opt.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                      isOn ? "bg-muted/60" : "",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-4 items-center justify-center rounded-md border",
                        isOn
                          ? "border-foreground bg-foreground text-background"
                          : "border-border",
                      )}
                      aria-hidden
                    >
                      {isOn ? (
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          strokeWidth={3}
                          className="size-3"
                        />
                      ) : null}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{opt.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {opt.dcName}, {opt.storeCount} stores
                      </span>
                    </span>
                  </button>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
