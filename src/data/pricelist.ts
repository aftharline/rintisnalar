import type { PricePackage } from "../types"

export const DURATION = "90 Menit Bimbingan Intensif per pertemuan"
export const PHONE_LABEL = "085161078616"

export const PACKAGES: PricePackage[] = [
  {
    id: "sd",
    level: "SD / Sederajat",
    tiers: [
      { sessions: "1 Pertemuan", validity: "Insidentil", price: "Rp37.000" },
      { sessions: "8 Pertemuan", validity: "1 Bulan", price: "Rp279.000" },
      { sessions: "10 Pertemuan", validity: "1 Bulan", price: "Rp339.000" },
      { sessions: "12 Pertemuan", validity: "1 Bulan", price: "Rp389.000" },
      { sessions: "24 Pertemuan", validity: "3 Bulan", price: "Rp769.000" },
      { sessions: "30 Pertemuan", validity: "3 Bulan", price: "Rp929.000" },
      { sessions: "36 Pertemuan", validity: "3 Bulan", price: "Rp1.079.000" },
    ],
  },
  {
    id: "smp",
    level: "SMP / Sederajat",
    tiers: [
      { sessions: "1 Pertemuan", validity: "Insidentil", price: "Rp52.000" },
      { sessions: "8 Pertemuan", validity: "1 Bulan", price: "Rp399.000" },
      { sessions: "10 Pertemuan", validity: "1 Bulan", price: "Rp489.000" },
      { sessions: "12 Pertemuan", validity: "1 Bulan", price: "Rp579.000" },
      { sessions: "24 Pertemuan", validity: "3 Bulan", price: "Rp1.129.000" },
      { sessions: "30 Pertemuan", validity: "3 Bulan", price: "Rp1.379.000" },
      { sessions: "36 Pertemuan", validity: "3 Bulan", price: "Rp1.619.000" },
    ],
  },
  {
    id: "sma",
    level: "SMA / Sederajat",
    tiers: [
      { sessions: "1 Pertemuan", validity: "Insidentil", price: "Rp62.000" },
      { sessions: "8 Pertemuan", validity: "1 Bulan", price: "Rp479.000" },
      { sessions: "10 Pertemuan", validity: "1 Bulan", price: "Rp589.000" },
      { sessions: "12 Pertemuan", validity: "1 Bulan", price: "Rp699.000" },
      { sessions: "24 Pertemuan", validity: "3 Bulan", price: "Rp1.369.000" },
      { sessions: "30 Pertemuan", validity: "3 Bulan", price: "Rp1.679.000" },
      { sessions: "36 Pertemuan", validity: "3 Bulan", price: "Rp1.979.000" },
    ],
  },
]