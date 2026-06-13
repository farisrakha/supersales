import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useDevtools } from "@/components/devtools-context"

/**
 * Renders a calm error card when the devtools "Simulate error" toggle is on.
 * Returns the rendered children otherwise. Use inside a route component:
 *
 *   const guard = useSimulatedError()
 *   if (guard) return guard
 */
export function useSimulatedError(): React.ReactNode | null {
  const simulateError = useDevtools().simulateError
  const setSimulateError = useDevtools().setSimulateError
  if (!simulateError) return null
  return (
    <div className="container mx-auto max-w-2xl px-5 py-10">
      <Card className="border-destructive/40">
        <CardHeader>
          <span className="flex size-10 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <HugeiconsIcon
              icon={Alert02Icon}
              strokeWidth={2}
              className="size-5"
            />
          </span>
          <CardTitle className="font-heading mt-2">
            We could not load this view
          </CardTitle>
          <CardDescription>
            The mock data layer reported a transient error. Retry to fetch the
            current scenario again, or turn off Simulate error in the header.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setSimulateError(false)}
            className="w-full sm:w-auto"
          >
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
