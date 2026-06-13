import type {
  Exception,
  ExceptionReason,
  InferredStock,
  Order,
  OrderLine,
  OrderStatus,
  POD,
  SKU,
  Store,
  Wave,
} from '../types'
import { skus } from '../fixtures/skus'
import { stores } from '../fixtures/stores'
import { users } from '../fixtures/users'
import { computeSuggestedOrders } from '../engine'
import { isoOffset } from '../clock'

// The store persona on /store reads the first user with role === 'store'.
// We must guarantee that store has a draft order in every scenario so the
// demo can always show the "Saran pesanan" flow.
const PROTECTED_STORE_ID = (() => {
  const persona = users.find((u) => u.role === 'store')
  return persona?.store_id ?? 'store-001'
})()

function seededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

export function buildInferredStock(
  selectedStores: Store[],
  selectedSkus: SKU[],
  targetDueStores: number,
  seed: number,
): InferredStock[] {
  const rng = seededRandom(seed)
  const rows: InferredStock[] = []
  const due = new Set<string>()
  // Always include the protected store so the /store persona has a draft.
  if (selectedStores.some((s) => s.id === PROTECTED_STORE_ID)) {
    due.add(PROTECTED_STORE_ID)
  }
  while (due.size < targetDueStores && due.size < selectedStores.length) {
    const pick = selectedStores[Math.floor(rng() * selectedStores.length)]
    due.add(pick.id)
  }

  for (const store of selectedStores) {
    const storeIsDue = due.has(store.id)
    for (const sku of selectedSkus) {
      const roll = rng()
      let daysOfCover: number
      if (storeIsDue && roll < 0.18) {
        daysOfCover = Math.round((rng() * (sku.reorder_threshold_days - 1) + 0.5) * 10) / 10
      } else {
        daysOfCover = Math.round((sku.reorder_threshold_days + 2 + rng() * 10) * 10) / 10
      }
      const onHand = Math.max(0, Math.round(daysOfCover * sku.default_burn_per_day))
      rows.push({
        store_id: store.id,
        sku_id: sku.id,
        on_hand_estimate: onHand,
        last_recompute_at: isoOffset(-60),
        days_of_cover: daysOfCover,
      })
    }
  }
  return rows
}

export interface ScenarioBuildOptions {
  draftStoreCount: number
  submittedExtras: number
  waves: number
  exceptions: Array<{ reason: ExceptionReason; note: string }>
  seed: number
}

export interface BuiltScenario {
  inferredStock: InferredStock[]
  orders: Order[]
  orderLines: OrderLine[]
  waves: Wave[]
  exceptions: Exception[]
  pods: POD[]
}

export function buildScenario(opts: ScenarioBuildOptions): BuiltScenario {
  const inferred = buildInferredStock(stores, skus, opts.draftStoreCount, opts.seed)
  const engine = computeSuggestedOrders({ stores, skus, inferredStock: inferred })

  const orders: Order[] = [...engine.orders]
  const lines: OrderLine[] = [...engine.lines]
  const rng = seededRandom(opts.seed + 7)

  let submittedNeeded = opts.submittedExtras
  for (const order of orders) {
    if (submittedNeeded <= 0) break
    if (order.store_id === PROTECTED_STORE_ID) continue
    if (rng() < 0.6) {
      order.status = 'submitted'
      order.source = 'store'
      submittedNeeded -= 1
    }
  }

  const waves: Wave[] = []
  const truckIds = ['truck-b1234xy', 'truck-b5678cd', 'truck-b9012ef', 'truck-d3456gh', 'truck-d7890jk']
  const driverIds = ['user-andi-jkt-01', 'user-andi-jkt-02', 'user-andi-bdg-01']

  const inTransitStatuses: OrderStatus[] = ['confirmed', 'picking', 'in_transit']
  for (let i = 0; i < opts.waves; i++) {
    const dcId = i % 2 === 0 ? 'dc-jkt-01' : 'dc-bdg-01'
    const waveId = `wave-${String(i + 1).padStart(2, '0')}`
    const ordersForWave = orders
      .filter(
        (o) =>
          o.status === 'draft' &&
          !o.wave_id &&
          o.store_id !== PROTECTED_STORE_ID,
      )
      .slice(0, 3 + (i % 2))
    for (const o of ordersForWave) {
      o.wave_id = waveId
      o.status = inTransitStatuses[i % inTransitStatuses.length]
    }
    waves.push({
      id: waveId,
      dc_id: dcId,
      dispatch_date: isoOffset(60 * (i + 1)),
      status: i === 0 ? 'in_transit' : 'dispatched',
      truck_id: truckIds[i % truckIds.length],
      driver_user_id: driverIds[i % driverIds.length],
      order_ids: ordersForWave.map((o) => o.id),
    })
  }

  const exceptions: Exception[] = []
  const candidates = orders.filter((o) => o.wave_id)
  for (let i = 0; i < opts.exceptions.length; i++) {
    const target = candidates[i % Math.max(1, candidates.length)]
    if (!target) break
    target.status = 'exception'
    const e = opts.exceptions[i]
    exceptions.push({
      id: `exc-${String(i + 1).padStart(2, '0')}`,
      order_id: target.id,
      reason_code: e.reason,
      note: e.note,
      photo_url: `/mock/exceptions/${i + 1}.jpg`,
      created_by: 'user-andi-jkt-01',
      created_at: isoOffset(-15 - i * 10),
    })
  }

  const pods: POD[] = []

  return {
    inferredStock: inferred,
    orders,
    orderLines: lines,
    waves,
    exceptions,
    pods,
  }
}
