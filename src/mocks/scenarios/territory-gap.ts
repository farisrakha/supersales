import type { MockDataSlice } from '../state'
import { reps } from '../fixtures/reps'
import { accounts } from '../fixtures/accounts'
import { products } from '../fixtures/products'
import { visits, visitProducts, visitEvidences } from '../fixtures/visits'
import { quoteInquiries, quoteInquiryLines } from '../fixtures/quotes'
import type { User, VisitPlan } from '../types'

const users: User[] = [
  { id: 'user-dewi', role: 'supervisor', name: 'Dewi' },
  { id: 'user-bima', role: 'admin', name: 'Bima' },
  { id: 'user-pak-arief', role: 'exec', name: 'Pak Arief' },
]

// acc-005 (Bridgestone) and acc-014 (Unilever): last visit 26+ days ago.
// Recent visits to these accounts are removed so the coverage gap surfaces.
// rep-007 (Fajar Nugroho): visits after 2026-05-12 removed to show them behind target.
const GAP_ACCOUNT_IDS = new Set(['acc-005', 'acc-014'])
const GAP_ACCOUNT_CUTOFF = '2026-05-05'
const GAP_REP_ID = 'rep-007'
const GAP_REP_CUTOFF = '2026-05-12'

const filteredVisits = visits.filter((v) => {
  if (GAP_ACCOUNT_IDS.has(v.account_id) && v.date > GAP_ACCOUNT_CUTOFF) return false
  if (v.rep_id === GAP_REP_ID && v.date > GAP_REP_CUTOFF) return false
  return true
})

const filteredVisitIds = new Set(filteredVisits.map((v) => v.id))

const filteredVisitProducts = visitProducts.filter((vp) =>
  filteredVisitIds.has(vp.visit_id),
)

const filteredEvidences = visitEvidences.filter((ve) =>
  filteredVisitIds.has(ve.visit_id),
)

const filteredQuotes = quoteInquiries.filter((qi) =>
  filteredVisitIds.has(qi.visit_id),
)

const filteredQuoteIds = new Set(filteredQuotes.map((qi) => qi.id))

const filteredQuoteLines = quoteInquiryLines.filter((l) =>
  filteredQuoteIds.has(l.inquiry_id),
)

const visitPlans: VisitPlan[] = [
  {
    id: 'vp-g1',
    rep_id: 'rep-005',
    account_id: 'acc-013',
    planned_date: '2026-05-26',
    note: 'Follow-up demo',
    status: 'pending',
  },
]

const scenario: MockDataSlice = {
  reps,
  accounts,
  products,
  visits: filteredVisits,
  visitProducts: filteredVisitProducts,
  visitEvidences: filteredEvidences,
  quoteInquiries: filteredQuotes,
  quoteInquiryLines: filteredQuoteLines,
  visitPlans,
  users,
}

export default scenario
