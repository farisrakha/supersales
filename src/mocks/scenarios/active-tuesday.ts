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

// 4 reps already have completed visits today (v-001 to v-004).
// 2 more have scheduled plans this afternoon, bringing active reps to 6.
const visitPlans: VisitPlan[] = [
  {
    id: 'vp-t1',
    rep_id: 'rep-005',
    account_id: 'acc-012',
    planned_date: '2026-05-26',
    note: 'Follow-up demo on packaging line',
    status: 'pending',
  },
  {
    id: 'vp-t2',
    rep_id: 'rep-006',
    account_id: 'acc-014',
    planned_date: '2026-05-26',
    note: 'Decision maker available this afternoon',
    status: 'pending',
  },
]

const scenario: MockDataSlice = {
  reps,
  accounts,
  products,
  visits,
  visitProducts,
  visitEvidences,
  quoteInquiries,
  quoteInquiryLines,
  visitPlans,
  users,
}

export default scenario
