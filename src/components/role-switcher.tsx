import { useNavigate } from "@tanstack/react-router"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMockStore } from "@/mocks/state"
import type { Role } from "@/mocks/types"

const ROLES: { id: Role; persona: string; title: string; home: string }[] = [
  { id: "ops-manager", persona: "Rina", title: "DC Ops Manager", home: "/" },
  { id: "supervisor", persona: "Sari", title: "Regional Supervisor", home: "/supervisor" },
  { id: "exec", persona: "Pak Hadi", title: "Head of Supply Chain", home: "/exec" },
  { id: "store", persona: "Budi", title: "Store Owner", home: "/store" },
  { id: "driver", persona: "Andi", title: "Driver", home: "/driver" },
]

export function RoleSwitcher() {
  const role = useMockStore((s) => s.currentRole)
  const setRole = useMockStore((s) => s.setCurrentRole)
  const navigate = useNavigate()
  const current = ROLES.find((r) => r.id === role) ?? ROLES[0]

  return (
    <Select
      value={role}
      onValueChange={(value) => {
        if (!value) return
        setRole(value)
        const next = ROLES.find((r) => r.id === value)
        if (next) navigate({ to: next.home })
      }}
    >
      <SelectTrigger size="sm" aria-label="Switch persona" className="min-w-52">
        <SelectValue>
          <span className="font-medium">{current.persona}</span>
          <span className="text-muted-foreground">, {current.title}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            <span className="font-medium">{r.persona}</span>
            <span className="text-muted-foreground">, {r.title}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
