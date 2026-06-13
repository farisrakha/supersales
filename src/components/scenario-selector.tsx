import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMockStore } from "@/mocks/state"
import type { ScenarioId } from "@/mocks/types"

const SCENARIOS: { id: ScenarioId; label: string; sublabel: string }[] = [
  { id: "active-tuesday", label: "Active Tuesday", sublabel: "Normal day, 6 of 8 reps active" },
  { id: "territory-gap", label: "Territory gap", sublabel: "2 accounts overdue, 1 rep behind" },
]

export function ScenarioSelector() {
  const scenario = useMockStore((s) => s.currentScenario)
  const setScenario = useMockStore((s) => s.setCurrentScenario)
  const current = SCENARIOS.find((s) => s.id === scenario) ?? SCENARIOS[0]

  return (
    <Select
      value={scenario}
      onValueChange={(value) => {
        if (value) setScenario(value as ScenarioId)
      }}
    >
      <SelectTrigger size="sm" aria-label="Switch scenario">
        <SelectValue>
          <span className="font-medium">{current.label}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {SCENARIOS.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            <span className="font-medium">{s.label}</span>
            <span className="text-muted-foreground">, {s.sublabel}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
