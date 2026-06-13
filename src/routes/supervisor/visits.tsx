import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useMockStore } from "@/mocks/state"
import { getDemoNow } from "@/mocks/clock"

export const Route = createFileRoute("/supervisor/visits")({ component: VisitQueuePage })

function VisitQueuePage() {
  const demoNow = getDemoNow()
  const today = demoNow.toISOString().slice(0, 10)

  const reps = useMockStore((s) => s.reps)
  const accounts = useMockStore((s) => s.accounts)
  const visitPlans = useMockStore((s) => s.visitPlans)

  const [queueRepFilter, setQueueRepFilter] = React.useState("all")

  const todayPendingPlans = React.useMemo(
    () => visitPlans.filter((p) => p.planned_date === today && p.status === "pending"),
    [visitPlans, today],
  )

  const filteredPlans = React.useMemo(
    () =>
      queueRepFilter === "all"
        ? todayPendingPlans
        : todayPendingPlans.filter((p) => p.rep_id === queueRepFilter),
    [todayPendingPlans, queueRepFilter],
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Visit queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">Planned visits for today</p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Pending visits today
        </p>
        <Select
          value={queueRepFilter}
          onValueChange={(v) => {
            if (v) setQueueRepFilter(v)
          }}
        >
          <SelectTrigger size="sm" aria-label="Filter by rep">
            <SelectValue>
              {queueRepFilter === "all"
                ? "All reps"
                : (reps.find((r) => r.id === queueRepFilter)?.name ?? "All reps")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All reps</SelectItem>
            {reps.map((r) => (
              <SelectItem key={r.id} value={r.id}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">
            {todayPendingPlans.length === 0
              ? "No visits scheduled for today."
              : "No visits for this rep today."}
          </p>
          {todayPendingPlans.length === 0 && (
            <p className="mt-1 text-sm text-muted-foreground/70">
              Visit plans are set up in the Admin portal.
            </p>
          )}
        </div>
      ) : (
        <Card size="sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rep</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => {
                const rep = reps.find((r) => r.id === plan.rep_id)
                const account = accounts.find((a) => a.id === plan.account_id)
                return (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      {rep?.name ?? plan.rep_id}
                    </TableCell>
                    <TableCell>{account?.name ?? plan.account_id}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {account?.area ?? ""}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {plan.note ?? (
                        <span className="italic text-muted-foreground/50">
                          No note
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
