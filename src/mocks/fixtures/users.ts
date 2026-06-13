import type { User } from '../types'

export const users: User[] = [
  { id: 'user-rina', role: 'ops-manager', name: 'Rina Pratiwi', phone: '+62 811 1000 0001', dc_id: 'dc-jkt-01' },
  { id: 'user-pak-hadi', role: 'exec', name: 'Pak Hadi Wijaya', phone: '+62 811 1000 0002' },
  { id: 'user-sari', role: 'supervisor', name: 'Sari Lestari', phone: '+62 811 1000 0003', cluster_id: 'jakarta-utara' },
  { id: 'user-budi-001', role: 'store', name: 'Budi Santoso', phone: '+62 813 2000 0001', store_id: 'store-001' },
  { id: 'user-budi-002', role: 'store', name: 'Budi Hartono', phone: '+62 813 2000 0002', store_id: 'store-002' },
  { id: 'user-budi-006', role: 'store', name: 'Budi Setiawan', phone: '+62 813 2000 0003', store_id: 'store-006' },
  { id: 'user-budi-011', role: 'store', name: 'Budi Nugroho', phone: '+62 813 2000 0004', store_id: 'store-011' },
  { id: 'user-budi-014', role: 'store', name: 'Budi Permana', phone: '+62 813 2000 0005', store_id: 'store-014' },
  { id: 'user-andi-jkt-01', role: 'driver', name: 'Andi Saputra', phone: '+62 814 3000 0001', dc_id: 'dc-jkt-01' },
  { id: 'user-andi-jkt-02', role: 'driver', name: 'Andi Firmansyah', phone: '+62 814 3000 0002', dc_id: 'dc-jkt-01' },
  { id: 'user-andi-bdg-01', role: 'driver', name: 'Andi Maulana', phone: '+62 814 3000 0003', dc_id: 'dc-bdg-01' },
]
