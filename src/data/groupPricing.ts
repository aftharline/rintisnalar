export interface GroupPackage {
  id: string
  level: string
  price: string
}

export const GROUP_SCHEDULE = "12 pertemuan per bulan · Senin, Rabu, dan Jumat"
export const GROUP_VENUE = "di RINTIS NALAR Rumah Belajar, Sidoarjo"

export const GROUP_PACKAGES: GroupPackage[] = [
  { id: "tk", level: "TK / Sederajat", price: "Rp100.000" },
  { id: "sd", level: "SD / Sederajat", price: "Rp150.000" },
  { id: "smp", level: "SMP / Sederajat", price: "Rp200.000" },
]
