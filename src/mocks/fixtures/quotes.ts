import type { QuoteInquiry, QuoteInquiryLine } from '../types'

// 14 quote inquiries, total Rp 2,740,000,000
export const quoteInquiries: QuoteInquiry[] = [
  { id: 'qi-001', visit_id: 'v-002', account_id: 'acc-004', rep_id: 'rep-002', status: 'new', total_idr: 185_000_000, created_at: '2026-05-26T09:45:00+07:00', note: 'Engine block inspection station.' },
  { id: 'qi-002', visit_id: 'v-005', account_id: 'acc-013', rep_id: 'rep-005', status: 'reviewing', total_idr: 221_000_000, created_at: '2026-05-24T15:00:00+07:00', note: 'Bottle inspection, packaging lines A and B.' },
  { id: 'qi-003', visit_id: 'v-008', account_id: 'acc-019', rep_id: 'rep-008', status: 'new', total_idr: 84_000_000, created_at: '2026-05-22T15:00:00+07:00' },
  { id: 'qi-004', visit_id: 'v-009', account_id: 'acc-002', rep_id: 'rep-001', status: 'reviewing', total_idr: 249_000_000, created_at: '2026-05-21T13:30:00+07:00', note: 'Weld seam plus displacement for second station.' },
  { id: 'qi-005', visit_id: 'v-011', account_id: 'acc-011', rep_id: 'rep-004', status: 'closed', total_idr: 84_000_000, created_at: '2026-05-20T10:30:00+07:00' },
  { id: 'qi-006', visit_id: 'v-015', account_id: 'acc-003', rep_id: 'rep-001', status: 'forwarded', total_idr: 310_000_000, created_at: '2026-05-19T14:00:00+07:00', note: 'Body panel QC line, 2 stations.' },
  { id: 'qi-007', visit_id: 'v-017', account_id: 'acc-017', rep_id: 'rep-007', status: 'reviewing', total_idr: 148_000_000, created_at: '2026-05-16T15:30:00+07:00', note: 'Pill dimension tolerance on tablet line.' },
  { id: 'qi-008', visit_id: 'v-022', account_id: 'acc-001', rep_id: 'rep-001', status: 'forwarded', total_idr: 370_000_000, created_at: '2026-05-13T14:30:00+07:00', note: 'New press bay, 2 units required.' },
  { id: 'qi-009', visit_id: 'v-026', account_id: 'acc-005', rep_id: 'rep-002', status: 'closed', total_idr: 152_000_000, created_at: '2026-05-10T16:00:00+07:00' },
  { id: 'qi-010', visit_id: 'v-028', account_id: 'acc-002', rep_id: 'rep-001', status: 'forwarded', total_idr: 167_000_000, created_at: '2026-05-08T14:30:00+07:00', note: 'Warehouse receiving station.' },
  { id: 'qi-011', visit_id: 'v-029', account_id: 'acc-008', rep_id: 'rep-003', status: 'reviewing', total_idr: 241_000_000, created_at: '2026-05-08T12:00:00+07:00', note: 'Heat sink inspection station.' },
  { id: 'qi-012', visit_id: 'v-034', account_id: 'acc-016', rep_id: 'rep-007', status: 'closed', total_idr: 185_000_000, created_at: '2026-05-02T15:30:00+07:00' },
  { id: 'qi-013', visit_id: 'v-038', account_id: 'acc-007', rep_id: 'rep-003', status: 'forwarded', total_idr: 232_000_000, created_at: '2026-04-28T13:30:00+07:00', note: 'Monitor calibration line, 2 units.' },
  { id: 'qi-014', visit_id: 'v-040', account_id: 'acc-019', rep_id: 'rep-008', status: 'closed', total_idr: 112_000_000, created_at: '2026-04-26T15:30:00+07:00', note: 'Batch traceability stations 1 and 2.' },
]

export const quoteInquiryLines: QuoteInquiryLine[] = [
  { inquiry_id: 'qi-001', product_id: 'prod-001', quantity: 1, unit_price_idr: 185_000_000 },
  { inquiry_id: 'qi-002', product_id: 'prod-003', quantity: 1, unit_price_idr: 125_000_000 },
  { inquiry_id: 'qi-002', product_id: 'prod-005', quantity: 1, unit_price_idr: 96_000_000 },
  { inquiry_id: 'qi-003', product_id: 'prod-007', quantity: 2, unit_price_idr: 42_000_000 },
  { inquiry_id: 'qi-004', product_id: 'prod-001', quantity: 1, unit_price_idr: 185_000_000 },
  { inquiry_id: 'qi-004', product_id: 'prod-010', quantity: 1, unit_price_idr: 64_000_000 },
  { inquiry_id: 'qi-005', product_id: 'prod-006', quantity: 1, unit_price_idr: 84_000_000 },
  { inquiry_id: 'qi-006', product_id: 'prod-001', quantity: 1, unit_price_idr: 185_000_000 },
  { inquiry_id: 'qi-006', product_id: 'prod-003', quantity: 1, unit_price_idr: 125_000_000 },
  { inquiry_id: 'qi-007', product_id: 'prod-004', quantity: 1, unit_price_idr: 148_000_000 },
  { inquiry_id: 'qi-008', product_id: 'prod-001', quantity: 2, unit_price_idr: 185_000_000 },
  { inquiry_id: 'qi-009', product_id: 'prod-005', quantity: 1, unit_price_idr: 96_000_000 },
  { inquiry_id: 'qi-009', product_id: 'prod-011', quantity: 2, unit_price_idr: 28_000_000 },
  { inquiry_id: 'qi-010', product_id: 'prod-003', quantity: 1, unit_price_idr: 125_000_000 },
  { inquiry_id: 'qi-010', product_id: 'prod-007', quantity: 1, unit_price_idr: 42_000_000 },
  { inquiry_id: 'qi-011', product_id: 'prod-001', quantity: 1, unit_price_idr: 185_000_000 },
  { inquiry_id: 'qi-011', product_id: 'prod-009', quantity: 1, unit_price_idr: 56_000_000 },
  { inquiry_id: 'qi-012', product_id: 'prod-001', quantity: 1, unit_price_idr: 185_000_000 },
  { inquiry_id: 'qi-013', product_id: 'prod-004', quantity: 1, unit_price_idr: 148_000_000 },
  { inquiry_id: 'qi-013', product_id: 'prod-006', quantity: 1, unit_price_idr: 84_000_000 },
  { inquiry_id: 'qi-014', product_id: 'prod-007', quantity: 2, unit_price_idr: 42_000_000 },
  { inquiry_id: 'qi-014', product_id: 'prod-011', quantity: 1, unit_price_idr: 28_000_000 },
]
