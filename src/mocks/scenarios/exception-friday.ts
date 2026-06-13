import type { MockDataSlice } from '../state'
import { dcs } from '../fixtures/dcs'
import { stores } from '../fixtures/stores'
import { skus } from '../fixtures/skus'
import { trucks } from '../fixtures/trucks'
import { users } from '../fixtures/users'
import { buildScenario } from './_helpers'

const built = buildScenario({
  draftStoreCount: 18,
  submittedExtras: 8,
  waves: 3,
  exceptions: [
    { reason: 'store_closed', note: 'Toko tutup, tidak ada penjaga di lokasi' },
    { reason: 'refused', note: 'Pemilik menolak karena salah PO' },
    { reason: 'damaged', note: 'Dua karton penyok saat bongkar muat' },
  ],
  seed: 29,
})

const scenario: MockDataSlice = {
  dcs,
  stores,
  skus,
  trucks,
  users,
  inferredStock: built.inferredStock,
  orders: built.orders,
  orderLines: built.orderLines,
  waves: built.waves,
  exceptions: built.exceptions,
  pods: built.pods,
}

export default scenario
