import type { MockDataSlice } from '../state'
import { dcs } from '../fixtures/dcs'
import { stores } from '../fixtures/stores'
import { skus } from '../fixtures/skus'
import { trucks } from '../fixtures/trucks'
import { users } from '../fixtures/users'
import { buildScenario } from './_helpers'

const built = buildScenario({
  draftStoreCount: 20,
  submittedExtras: 14,
  waves: 4,
  exceptions: [
    { reason: 'address_wrong' as const, note: 'Alamat pengiriman keliru, butuh konfirmasi ulang' },
  ],
  seed: 47,
})

const ordersBoosted = [...built.orders]
const linesBoosted = [...built.orderLines]

const extraCount = Math.max(0, 30 - ordersBoosted.length)
for (let i = 0; i < extraCount; i++) {
  const baseStore = stores[i % stores.length]
  const manualOrderId = `order-manual-${String(i + 1).padStart(2, '0')}`
  ordersBoosted.push({
    id: manualOrderId,
    store_id: baseStore.id,
    status: 'submitted',
    created_at: built.orders[0]?.created_at ?? new Date().toISOString(),
    source: 'manual',
    note: 'Tambahan stok akhir bulan',
  })
  const sku = skus[(i * 3) % skus.length]
  linesBoosted.push({
    order_id: manualOrderId,
    sku_id: sku.id,
    suggested_qty: sku.default_burn_per_day * 7,
    requested_qty: sku.default_burn_per_day * 10,
    delivered_qty: 0,
  })
}

const scenario: MockDataSlice = {
  dcs,
  stores,
  skus,
  trucks,
  users,
  inferredStock: built.inferredStock,
  orders: ordersBoosted,
  orderLines: linesBoosted,
  waves: built.waves,
  exceptions: built.exceptions,
  pods: built.pods,
}

export default scenario
