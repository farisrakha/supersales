import * as React from "react"
import { createFileRoute } from "@tanstack/react-router"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { useMockStore } from "@/mocks/state"
import { getDemoNow } from "@/mocks/clock"
import type { Industry, VisitOutcome } from "@/mocks/types"

export const Route = createFileRoute("/admin/")({ component: AdminPage })

const INDUSTRY_OPTIONS = [
  { value: "automotive", label: "Automotive" },
  { value: "electronics", label: "Electronics" },
  { value: "food_processing", label: "Food processing" },
  { value: "pharmaceutical", label: "Pharmaceutical" },
  { value: "other", label: "Other" },
]

const INDUSTRY_LABEL: Record<string, string> = {
  automotive: "Automotive",
  electronics: "Electronics",
  food_processing: "Food processing",
  pharmaceutical: "Pharmaceutical",
}

const FREQUENCY_OPTIONS = [
  { value: "1x/week", label: "Once a week" },
  { value: "2x/month", label: "Twice a month" },
  { value: "1x/month", label: "Once a month" },
]

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  })
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

const INIT_ADD_FORM = {
  name: "",
  contact_name: "",
  contact_phone: "",
  industry: "automotive",
  assigned_rep_id: "",
  visit_frequency: "1x/month",
  notes: "",
}

function AdminPage() {
  const demoNow = getDemoNow()

  const reps = useMockStore((s) => s.reps)
  const accounts = useMockStore((s) => s.accounts)
  const visits = useMockStore((s) => s.visits)
  const quoteInquiries = useMockStore((s) => s.quoteInquiries)

  const [addAccountOpen, setAddAccountOpen] = React.useState(false)
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null)
  const [addForm, setAddForm] = React.useState({ ...INIT_ADD_FORM })

  const selectedAccount = selectedAccountId
    ? (accounts.find((a) => a.id === selectedAccountId) ?? null)
    : null

  const selectedAccountVisits = React.useMemo(
    () =>
      selectedAccount
        ? [...visits]
            .filter((v) => v.account_id === selectedAccount.id)
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 8)
        : [],
    [selectedAccount, visits],
  )

  function lastVisitDate(accountId: string): string | null {
    return (
      [...visits]
        .filter((v) => v.account_id === accountId)
        .sort((a, b) => b.date.localeCompare(a.date))[0]?.date ?? null
    )
  }

  function visitFrequency(accountId: string): string {
    const cutoff = new Date(demoNow.getTime() - 30 * 24 * 60 * 60 * 1000)
    const count = visits.filter(
      (v) => v.account_id === accountId && new Date(v.date) >= cutoff,
    ).length
    if (count >= 4) return "1x/week"
    if (count >= 2) return "2x/month"
    return "1x/month"
  }

  function openQuotesCount(accountId: string): number {
    return quoteInquiries.filter(
      (q) => q.account_id === accountId && (q.status === "new" || q.status === "reviewing"),
    ).length
  }

  function handleSaveAccount() {
    if (!addForm.name.trim()) return
    useMockStore.setState((state) => ({
      accounts: [
        ...state.accounts,
        {
          id: `acc-${Date.now().toString(36)}`,
          name: addForm.name.trim(),
          industry: addForm.industry as Industry,
          address: "",
          city: "",
          area: "",
          contact_name: addForm.contact_name,
          contact_phone: addForm.contact_phone,
          assigned_rep_id: addForm.assigned_rep_id,
        },
      ],
    }))
    setAddAccountOpen(false)
    setAddForm({ ...INIT_ADD_FORM })
    toast.success("Account saved.")
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Admin portal</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bima · Account management
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {accounts.length} accounts
        </p>
        <Button size="sm" onClick={() => setAddAccountOpen(true)}>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
          Add account
        </Button>
      </div>
      <Card size="sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Assigned rep</TableHead>
              <TableHead>Visit frequency</TableHead>
              <TableHead>Last visit</TableHead>
              <TableHead className="text-right">Open quotes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => {
              const rep = reps.find((r) => r.id === account.assigned_rep_id)
              const lastDate = lastVisitDate(account.id)
              const openQ = openQuotesCount(account.id)
              return (
                <TableRow
                  key={account.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedAccountId(account.id)}
                >
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {INDUSTRY_LABEL[account.industry] ?? account.industry}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {rep?.name ?? account.assigned_rep_id}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {visitFrequency(account.id)}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {lastDate ? formatDateShort(lastDate) : "Never"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {openQ > 0 ? (
                      <span className="font-semibold text-amber-700 dark:text-amber-400">
                        {openQ}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Add account sheet */}
      <Sheet
        open={addAccountOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddAccountOpen(false)
            setAddForm({ ...INIT_ADD_FORM })
          }
        }}
      >
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Add account</SheetTitle>
            <SheetDescription>
              Register a new manufacturing account and assign a rep.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 px-6 pb-4">
            <div>
              <Label htmlFor="acc-name" className="mb-1.5 block">
                Company name
              </Label>
              <Input
                id="acc-name"
                placeholder="PT Contoh Manufacturing"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="acc-contact" className="mb-1.5 block">
                Contact name
              </Label>
              <Input
                id="acc-contact"
                placeholder="Pak Budi"
                value={addForm.contact_name}
                onChange={(e) => setAddForm((f) => ({ ...f, contact_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="acc-phone" className="mb-1.5 block">
                Contact phone
              </Label>
              <Input
                id="acc-phone"
                placeholder="+62 812 0000 0000"
                value={addForm.contact_phone}
                onChange={(e) => setAddForm((f) => ({ ...f, contact_phone: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1.5 block">Industry</Label>
              <Select
                value={addForm.industry}
                onValueChange={(v) => {
                  if (v) setAddForm((f) => ({ ...f, industry: v }))
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {INDUSTRY_OPTIONS.find((o) => o.value === addForm.industry)?.label ??
                      "Select industry"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Assigned rep</Label>
              <Select
                value={addForm.assigned_rep_id}
                onValueChange={(v) => {
                  if (v) setAddForm((f) => ({ ...f, assigned_rep_id: v }))
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {reps.find((r) => r.id === addForm.assigned_rep_id)?.name ?? "Select rep"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {reps.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                      <span className="text-muted-foreground"> · {r.territory}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Visit frequency</Label>
              <Select
                value={addForm.visit_frequency}
                onValueChange={(v) => {
                  if (v) setAddForm((f) => ({ ...f, visit_frequency: v }))
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {FREQUENCY_OPTIONS.find((o) => o.value === addForm.visit_frequency)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCY_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="acc-notes" className="mb-1.5 block">
                Notes
              </Label>
              <Textarea
                id="acc-notes"
                placeholder="Context about this account..."
                value={addForm.notes}
                onChange={(e) => setAddForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <SheetFooter className="flex-row justify-end gap-2 px-6 pb-6 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setAddAccountOpen(false)
                setAddForm({ ...INIT_ADD_FORM })
              }}
            >
              Cancel
            </Button>
            <Button disabled={!addForm.name.trim()} onClick={handleSaveAccount}>
              Save account
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Account detail (read-only) */}
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
                  {INDUSTRY_LABEL[selectedAccount.industry] ?? selectedAccount.industry}
                  {selectedAccount.city ? ` · ${selectedAccount.city}` : ""}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-6 pb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">Contact</p>
                    <p className="text-sm font-medium">
                      {selectedAccount.contact_name || "Not set"}
                    </p>
                    {selectedAccount.contact_phone && (
                      <p className="text-xs text-muted-foreground">
                        {selectedAccount.contact_phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">Assigned rep</p>
                    <p className="text-sm font-medium">
                      {reps.find((r) => r.id === selectedAccount.assigned_rep_id)?.name ??
                        "Unassigned"}
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
                                {formatDateShort(visit.date)}
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
