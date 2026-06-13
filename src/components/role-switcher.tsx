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
  { id: "supervisor", persona: "Dewi", title: "Regional Supervisor", home: "/supervisor" },
  { id: "admin", persona: "Bima", title: "Admin", home: "/admin" },
  { id: "exec", persona: "Pak Arief", title: "Head of Field Sales", home: "/exec" },
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
        setRole(value as Role)
        const next = ROLES.find((r) => r.id === value)
        if (next) navigate({ to: next.home } as never)
      }}
    >
      <SelectTrigger size="sm" aria-label="Switch persona">
        <SelectValue>
          <span className="font-medium">{current.persona}</span>
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
