// ============================================================
// data.js — Semua data konstan aplikasi AMC HLO Inspection
// ============================================================

const OFFICERS = [
  "Sadli",
  "Miswan Rianti",
  "Rury Ramdhan",
  "Risna Handayani",
  "Rezkhy Amelia",
  "Dwi Cahyo",
  "Roy Marten",
  "Rian Rifaldi",
  "Alqadri Yusuf",
  "Muh. Shaum",
  "Rivaldy Afriansyah",
  "Hening Wisnu",
];

const SHIFTS = [
  "Pagi (06:00–13:30)",
  "Siang (12:30–20:00)",
  "OH (08:00–16:00)",
];

// Parking stand items (diulang untuk setiap stand)
const STAND_ITEMS = ["Marka", "Surface", "FOD"];

// Generate parking stand entries
const PARKING_STANDS = [
  "Parking Stand 01",
  "Parking Stand 02",
  "Parking Stand 03",
  "Parking Stand 04",
  "Parking Stand 05",
  "Parking Stand 06",
  "Parking Stand 07",
  "Helipad",
];

// Checklist utama
const CHECKLIST_DATA = [
  {
    category: "Inventaris",
    items: [
      "CCTV Monitor",
      "Komputer",
      "Printer",
      "Air Conditioner",
      "Kursi",
      "Meja",
      "Loker",
    ],
  },
  {
    category: "Fasilitas & Peralatan",
    items: ["HT", "Portable VHF", "PABX", "Follow Me Car"],
  },
  {
    category: "Area Apron",
    items: [
      "Service Road",
      "Makeup Area",
      "Breakdown Area",
      "Drainage",
      "Parking Stand Marking",
      "EPA Marking",
      "Surface Condition",
    ],
  },
  {
    category: "Fasilitas Apron",
    items: ["Aviobridge", "Flood Light", "ADGS", "Coordinate & Sign Box"],
  },
  {
    category: "Safety Inspection",
    items: [
      "FOD Inspection",
      "Wildlife Inspection",
      "Safety Cone",
      "Marshalling Equipment",
    ],
  },
  // Parking Stand — generate otomatis
  {
    category: "Parking Stand",
    isStandCategory: true,
    stands: PARKING_STANDS,
    standItems: STAND_ITEMS,
    // items di-generate oleh buildChecklistState()
  },
];

const FINDING_LOCATIONS = [
  "Parking Stand 01",
  "Parking Stand 02",
  "Parking Stand 03",
  "Parking Stand 04",
  "Parking Stand 05",
  "Parking Stand 06",
  "Parking Stand 07",
  "Helipad",
  "Apron",
  "Service Road",
  "Makeup Area",
  "Breakdown Area",
  "Terminal",
  "Lainnya",
];

const FINDING_CATEGORIES = [
  "FOD",
  "Wildlife",
  "Drainage",
  "Marking",
  "Lighting",
  "Equipment",
  "Safety",
  "Lainnya",
];

const RISK_LEVELS = ["Low", "Medium", "High"];

const ANIMAL_TYPES = ["Bird", "Dog", "Cat", "Monitor Lizard", "Lainnya"];

const STEPS_LABEL = ["Petugas", "Checklist", "Temuan", "Penutup", "TTD", "Selesai"];

// Warna status
const STATUS_COLORS = {
  Good: "#22c55e",
  "Needs Attention": "#f59e0b",
  Damaged: "#ef4444",
};

const STATUS_BG = {
  Good: "rgba(34,197,94,0.08)",
  "Needs Attention": "rgba(245,158,11,0.08)",
  Damaged: "rgba(239,68,68,0.08)",
};

const STATUS_ICON = {
  Good: "✓",
  "Needs Attention": "!",
  Damaged: "✗",
};

const RISK_COLORS = {
  Low: "#22c55e",
  Medium: "#f59e0b",
  High: "#ef4444",
};

const RISK_BG = {
  Low: "rgba(34,197,94,0.15)",
  Medium: "rgba(245,158,11,0.15)",
  High: "rgba(239,68,68,0.15)",
};
