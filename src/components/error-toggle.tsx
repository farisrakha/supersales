import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useDevtools } from "@/components/devtools-context"

export function ErrorToggle() {
  const simulateError = useDevtools().simulateError
  const setSimulateError = useDevtools().setSimulateError
  return (
    <div className="hidden items-center gap-2 rounded-full border border-dashed border-border bg-background px-2.5 py-1 md:flex">
      <Label
        htmlFor="devtools-simulate-error"
        className="cursor-pointer text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
      >
        Simulate error
      </Label>
      <Switch
        id="devtools-simulate-error"
        checked={simulateError}
        onCheckedChange={setSimulateError}
        aria-label="Toggle simulated error state for the current route"
      />
    </div>
  )
}
