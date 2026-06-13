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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { useMockStore } from "@/mocks/state"
import { getDemoNow } from "@/mocks/clock"

export const Route = createFileRoute("/admin/reps")({ component: RepsPage })

const INDUSTRY_LABEL: Record<string, string> = {
  automotive: "Automotive",
  electronics: "Electronics",
  food_processing: "Food processing",
  pharmaceutical: "Pharmaceutical",
}

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

function RepsPage() {
  const demoNow = getDemoNow()

  const reps = useMockStore((s) => s.reps)
  const accounts = useMockStore((s) => s.accounts)
  const visits = useMockStore((s) => s.visits)

  const [selectedRepId, setSelectedRepId] = React.useState<string | null>(null)

  const selectedRep = selectedRepId
    ? (reps.find((r) => r.id === selectedRepId) ?? null)
    : null

  const selectedRepAccounts = React.useMemo(
    () => (selectedRep ? accounts.filter((a) => a.assigned_rep_id === selectedRep.id) : []),
    [selectedRep, accounts],
  )

  function visitsThisMonth(repId: string): number {
    const cutoff = new Date(demoNow.getTime() - 30 * 24 * 60 * 60 * 1000)
    return visits.filter((v) => v.rep_id === repId && new Date(v.date) >= cutoff).length
  }

  function repLastVisitForAccount(repId: string, accountId: string): string | null {
    return (
      [...visits]
        .filter((v) => v.rep_id === repId && v.account_id === accountId)
        .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? null
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Reps</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bima · {reps.length} field sales reps
        </p>
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {reps.length} field sales reps
      </p>
      <Card size="sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Territory</TableHead>
              <TableHead className="text-right">Accounts</TableHead>
              <TableHead className="text-right">Visits this month</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reps.map((rep) => {
              const assigned = accounts.filter((a) => a.assigned_rep_id === rep.id).length
              const monthVisits = visitsThisMonth(rep.id)
              return (
                <TableRow
                  key={rep.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedRepId(rep.id)}
                >
                  <TableCell className="font-medium">{rep.name}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {rep.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{rep.territory}</TableCell>
                  <TableCell className="text-right tabular-nums">{assigned}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {monthVisits}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Rep detail sheet */}
      <Sheet
        open={selectedRepId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedRepId(null)
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selectedRep && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedRep.name}</SheetTitle>
                <SheetDescription>
                  {selectedRep.territory} · {selectedRep.phone}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-6 pb-6">
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Assigned accounts ({selectedRepAccounts.length})
                  </p>
                  {selectedRepAccounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No accounts assigned.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedRepAccounts.map((account) => {
                        const lastDate = repLastVisitForAccount(selectedRep.id, account.id)
                        return (
                          <div
                            key={account.id}
                            className="flex items-center justify-between gap-4 rounded-2xl border border-border px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{account.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {INDUSTRY_LABEL[account.industry] ?? account.industry}
                              </p>
                            </div>
                            <p className="shrink-0 tabular-nums text-xs text-muted-foreground">
                              {lastDate ? formatDateShort(lastDate) : "No visits"}
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
