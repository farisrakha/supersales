import type { Store } from '../types'

interface StoreSeed {
  name: string
  street: string
  area: string
  contact: string
  cluster: string
  dc: string
}

const seeds: StoreSeed[] = [
  { name: 'Toko Sumber Rejeki', street: 'Jl. Pluit Karang Ayu No. 12', area: 'Jakarta Utara', contact: '+62 812 1100 0001', cluster: 'jakarta-utara', dc: 'dc-jkt-01' },
  { name: 'Warung Berkah Jaya', street: 'Jl. Muara Karang Blok B No. 4', area: 'Jakarta Utara', contact: '+62 812 1100 0002', cluster: 'jakarta-utara', dc: 'dc-jkt-01' },
  { name: 'Minimart Maju Bersama', street: 'Jl. Pademangan Raya No. 88', area: 'Jakarta Utara', contact: '+62 812 1100 0003', cluster: 'jakarta-utara', dc: 'dc-jkt-01' },
  { name: 'Toko Sinar Terang', street: 'Jl. Sunter Agung No. 21', area: 'Jakarta Utara', contact: '+62 812 1100 0004', cluster: 'jakarta-utara', dc: 'dc-jkt-01' },
  { name: 'Warung Bu Tini', street: 'Jl. Kelapa Gading Barat No. 7', area: 'Jakarta Utara', contact: '+62 812 1100 0005', cluster: 'jakarta-utara', dc: 'dc-jkt-01' },
  { name: 'Toko Mekar Sari', street: 'Jl. Tebet Barat Dalam No. 33', area: 'Jakarta Selatan', contact: '+62 812 1100 0006', cluster: 'jakarta-selatan', dc: 'dc-jkt-01' },
  { name: 'Minimart Harum Manis', street: 'Jl. Kemang Selatan No. 14', area: 'Jakarta Selatan', contact: '+62 812 1100 0007', cluster: 'jakarta-selatan', dc: 'dc-jkt-01' },
  { name: 'Toko Cahaya Abadi', street: 'Jl. Cipete Raya No. 9', area: 'Jakarta Selatan', contact: '+62 812 1100 0008', cluster: 'jakarta-selatan', dc: 'dc-jkt-01' },
  { name: 'Warung Pak Slamet', street: 'Jl. Bangka Raya No. 56', area: 'Jakarta Selatan', contact: '+62 812 1100 0009', cluster: 'jakarta-selatan', dc: 'dc-jkt-01' },
  { name: 'Toko Rahayu', street: 'Jl. Cilandak KKO No. 41', area: 'Jakarta Selatan', contact: '+62 812 1100 0010', cluster: 'jakarta-selatan', dc: 'dc-jkt-01' },
  { name: 'Minimart Sejahtera', street: 'Jl. Margonda Raya No. 102', area: 'Depok', contact: '+62 812 1100 0011', cluster: 'depok', dc: 'dc-jkt-01' },
  { name: 'Toko Anugerah', street: 'Jl. Sawangan Raya No. 17', area: 'Depok', contact: '+62 812 1100 0012', cluster: 'depok', dc: 'dc-jkt-01' },
  { name: 'Warung Bunda Aminah', street: 'Jl. Tole Iskandar No. 28', area: 'Depok', contact: '+62 812 1100 0013', cluster: 'depok', dc: 'dc-jkt-01' },
  { name: 'Toko Bahagia', street: 'Jl. Asia Afrika No. 76', area: 'Bandung Kota', contact: '+62 812 2200 0001', cluster: 'bandung-kota', dc: 'dc-bdg-01' },
  { name: 'Minimart Pasundan', street: 'Jl. Cihampelas No. 145', area: 'Bandung Kota', contact: '+62 812 2200 0002', cluster: 'bandung-kota', dc: 'dc-bdg-01' },
  { name: 'Toko Saung Mang Ujang', street: 'Jl. Dipatiukur No. 32', area: 'Bandung Kota', contact: '+62 812 2200 0003', cluster: 'bandung-kota', dc: 'dc-bdg-01' },
  { name: 'Warung Teh Nining', street: 'Jl. Setiabudi No. 210', area: 'Bandung Kota', contact: '+62 812 2200 0004', cluster: 'bandung-kota', dc: 'dc-bdg-01' },
  { name: 'Toko Rukun Tetangga', street: 'Jl. Raya Cimahi No. 19', area: 'Cimahi', contact: '+62 812 2200 0005', cluster: 'cimahi', dc: 'dc-bdg-01' },
  { name: 'Minimart Pakuan', street: 'Jl. Pajajaran No. 88', area: 'Bandung Timur', contact: '+62 812 2200 0006', cluster: 'bandung-timur', dc: 'dc-bdg-01' },
  { name: 'Toko Cipaganti', street: 'Jl. Cipaganti No. 54', area: 'Bandung Utara', contact: '+62 812 2200 0007', cluster: 'bandung-utara', dc: 'dc-bdg-01' },
]

export const stores: Store[] = seeds.map((s, i) => ({
  id: `store-${String(i + 1).padStart(3, '0')}`,
  name: s.name,
  address: `${s.street}, ${s.area}`,
  contact: s.contact,
  home_dc_id: s.dc,
  cluster_id: s.cluster,
}))
