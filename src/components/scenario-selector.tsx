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
  { id: "calm-tuesday", label: "Calm Tuesday", sublabel: "Baseline volume" },
  { id: "exception-friday", label: "Exception Friday", sublabel: "Refusals and damages" },
  { id: "end-of-month-surge", label: "End of month surge", sublabel: "Peak demand" },
]

export function ScenarioSelector() {
  const scenario = useMockStore((s) => s.currentScenario)
  const setScenario = useMockStore((s) => s.setCurrentScenario)
  const current = SCENARIOS.find((s) => s.id === scenario) ?? SCENARIOS[0]

  return (
    <Select
      value={scenario}
      onValueChange={(value) => {
        if (value) setScenario(value)
      }}
    >
      <SelectTrigger size="sm" aria-label="Switch scenario" className="min-w-48">
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
