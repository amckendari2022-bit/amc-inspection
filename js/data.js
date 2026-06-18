// ============================================================
// data.js — Data konstan aplikasi AMC HLO Inspection
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
"Dinas Pagi (06.00 - 13.30)",
"Dinas Siang (12.30 - 20.00)",
"Dinas Malam (20.00 - 06.00)",
];

const STATUSES = ["M", "TM"];

const STATUS_COLORS = {
M: "#22c55e",
TM: "#ef4444",
};

const STATUS_BG = {
M: "rgba(34,197,94,0.08)",
TM: "rgba(239,68,68,0.08)",
};

const CHECKLIST_DATA = [
{
category: "Perlengkapan",
items: [
"HT",
"VHF Portable",
"CCTV Monitor",
"APD",
"Follow Me Car",
"Komputer",
],
},
{
category: "Apron Inspection",
items: [
"FOD",
"Surface",
"Genangan Air",
],
},
{
category: "Apron Marking",
items: [
"Safety Line",
"Lead In / Lead Out",
"EPA",
"ESA",
"Stop Line",
"Aerobridge Safety Line",
"No Parking Area",
"Parking Clearance",
"Tug Parking Position Line",
"Apron Edge Marking",
],
},
{
category: "Equipment and Facility",
items: [
"Service Road",
"Parking Stand",
"ADGS",
"Aviobridge",
"Flood Light",
"Koordinat Parking Stand",
"Sign Box",
"Heliport",
],
},
{
category: "Operasional",
items: [
"Ground Support Equipment (GSE)",
"Kendaraan Airside",
"Tanda Izin Mengemudi Airside (TIM Airside)",
"Penggunaan APD",
"Pergerakan Personel",
"Ground Handling",
"Pengisian Bahan Bakar Pesawat",
"Loading dan Unloading",
"Pushback Operation",
"Marshalling Aircraft",
"Tumpahan BBM/Oli",
"Wildlife Hazard",
],
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
"Operasional",
"Lainnya",
];

const RISK_LEVELS = ["Low", "Medium", "High"];

const ANIMAL_TYPES = ["Bird", "Dog", "Cat", "Monitor Lizard", "Lainnya"];

const STEPS_LABEL = ["Petugas", "Checklist", "Temuan", "Penutup", "TTD", "Selesai"];

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
