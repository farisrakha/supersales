import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
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
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

import { useMockStore } from "@/mocks/state"
import { getDemoNow } from "@/mocks/clock"
import type { VisitOutcome } from "@/mocks/types"

export const Route = createFileRoute("/supervisor/accounts")({ component: AccountsPage })

const INDUSTRY_LABEL: Record<string, string> = {
  automotive: "Automotive",
  electronics: "Electronics",
  food_processing: "Food processing",
  pharmaceutical: "Pharmaceutical",
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
}

function daysSince(dateStr: string, now: Date): number {
  return Math.floor(
    (now.getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24),
  )
}

function OutcomeBadge({ outcome }: { outcome: VisitOutcome }) {
  if (outcome === "interested") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      >
        Interested
      </Badge>
    )
  }
  if (outcome === "quote_submitted") {
    return (
      <Badge
        variant="outline"
        className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
      >
        Quote submitted
      </Badge>
    )
  }
  return <Badge variant="outline">Not interested this visit</Badge>
}

function AccountsPage() {
  const demoNow = getDemoNow()

  const reps = useMockStore((s) => s.reps)
  const accounts = useMockStore((s) => s.accounts)
  const visits = useMockStore((s) => s.visits)

  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null)

  const overdueAccountIds = React.useMemo(() => {
    const recentlyVisited = new Set(
      visits
        .filter((v) => daysSince(v.date, demoNow) <= 21)
        .map((v) => v.account_id),
    )
    return new Set(accounts.filter((a) => !recentlyVisited.has(a.id)).map((a) => a.id))
  }, [visits, accounts, demoNow])

  const selectedAccount = selectedAccountId
    ? (accounts.find((a) => a.id === selectedAccountId) ?? null)
    : null

  const selectedAccountVisits = React.useMemo(
    () =>
      selectedAccount
        ? [...visits]
            .filter((v) => v.account_id === selectedAccount.id)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 10)
        : [],
    [selectedAccount, visits],
  )

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All accounts · amber = overdue visit
        </p>
      </div>

      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        All accounts
      </p>
      {accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No accounts assigned to your territory yet.
          </p>
        </div>
      ) : (
      <Card size="sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Assigned rep</TableHead>
              <TableHead>Last visit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const isOverdue = overdueAccountIds.has(account.id)
              const lastVisit = [...visits]
                .filter((v) => v.account_id === account.id)
                .sort((a, b) => b.date.localeCompare(a.date))[0]
              const assignedRep = reps.find(
                (r) => r.id === account.assigned_rep_id,
              )
              return (
                <TableRow
                  key={account.id}
                  className={cn(
                    "cursor-pointer",
                    isOverdue &&
                      "bg-amber-500/[0.04] hover:bg-amber-500/[0.07]",
                  )}
                  onClick={() => setSelectedAccountId(account.id)}
                >
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-2">
                      {isOverdue && (
                        <span className="size-1.5 shrink-0 rounded-full bg-amber-500" />
                      )}
                      {account.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {INDUSTRY_LABEL[account.industry] ?? account.industry}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {account.area}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {assignedRep?.name ?? account.assigned_rep_id}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "tabular-nums",
                      isOverdue
                        ? "font-medium text-amber-700 dark:text-amber-400"
                        : "text-muted-foreground",
                    )}
                  >
                    {lastVisit
                      ? `${formatDate(lastVisit.date)} (${daysSince(lastVisit.date, demoNow)}d ago)`
                      : "Never visited"}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
      )}

      {/* Account detail sheet */}
      <Sheet
        open={selectedAccountId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAccountId(null)
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-md">
          {selectedAccount && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedAccount.name}</SheetTitle>
                <SheetDescription>
                  {INDUSTRY_LABEL[selectedAccount.industry] ??
                    selectedAccount.industry}{" "}
                  · {selectedAccount.city}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-6 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">
                      Assigned rep
                    </p>
                    <p className="text-sm font-medium">
                      {reps.find((r) => r.id === selectedAccount.assigned_rep_id)
                        ?.name ?? selectedAccount.assigned_rep_id}
                    </p>
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium">
                      {selectedAccount.contact_name}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Visit history
                  </p>
                  {selectedAccountVisits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Visits logged for this account will appear here.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedAccountVisits.map((visit) => {
                        const visitRep = reps.find((r) => r.id === visit.rep_id)
                        return (
                          <div
                            key={visit.id}
                            className="flex items-start justify-between gap-4 rounded-2xl border border-border px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="tabular-nums text-xs text-muted-foreground">
                                {formatDate(visit.date)}
                              </p>
                              <p className="text-sm font-medium">
                                {visitRep?.name ?? visit.rep_id}
                              </p>
                              {visit.note && (
                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                  {visit.note}
                                </p>
                              )}
                            </div>
                            <OutcomeBadge outcome={visit.outcome} />
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
