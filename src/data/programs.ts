import type { Program } from "../types"

export const PROGRAMS: Program[] = [
  {
    id: "academic",
    title: "Academic Tutoring",
    items: [
      "Mapel Umum SD/SMP/SMA/Sederajat",
      "Mapel Kejuruan RPL/TKJ/DKV/Multimedia/TB",
    ],
  },
  {
    id: "digital",
    title: "Digital Skills",
    items: [
      "Pemrograman Perangkat Lunak",
      "Pengembangan Website",
      "Desain 3D",
      "Desain Bangunan",
      "Desain UI/UX",
      "Desain Grafis & Foto Editing",
      "Microsoft Office",
      "Videografi & Fotografi",
    ],
  },
  {
    id: "communication",
    title: "Communication Skills",
    items: ["Public Speaking", "Presentasi", "Leadership", "Interview"],
  },
  {
    id: "future",
    title: "Future Preparations",
    items: ["SNBT", "TKA SD/SMP/SMA", "Portofolio", "Konsultasi Jurusan"],
  },
  {
    id: "multilingual",
    title: "Multilingual",
    items: ["Bahasa Inggris", "Bahasa Arab"],
  },
  {
    id: "lainnya",
    title: "Lainnya",
    items: ["Iqro' - Al-Qur'an"],
  },
]
