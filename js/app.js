// ============================================================
// app.js — Logika utama, navigasi, summary, dan reset
// ============================================================

const API_URL = "https://script.google.com/macros/s/AKfycbymtaEW48YpZF9sQCI07X7Jdnk4u30z3FsQ1OP2LalveYDM1-JP3JP17I02n3fLgSelMw/exec";


let currentStep = 0;
let reportId = "";
let startTime = new Date();

// ─── INIT ────────────────────────────────────────────────────

function init() {
startTime = new Date();
reportId = generateReportId();

document.getElementById("welcomeDate").textContent = formatDate(new Date());

buildChecklistState();
buildChecklist();
buildStepBar();

document.getElementById("selOfficer").addEventListener("change", onOfficerChange);
document.getElementById("selShift").addEventListener("change", onOfficerChange);

initSigCanvas();
updateStepBar();
updateBottomNav();
}

// ─── HELPERS ─────────────────────────────────────────────────

function generateReportId() {
const d = new Date();
const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
const seq = String(Math.floor(Math.random() * 900) + 100);
return "AMC-HLO-" + ymd + "-" + seq;
}

function formatDate(d) {
return d.toLocaleDateString("id-ID", {
weekday: "long", year: "numeric", month: "long", day: "numeric",
});
}

function formatTime(d) {
return d.toTimeString().slice(0, 5);
}

function showToast(msg, isError) {
const el = document.getElementById("toast");
el.textContent = msg;
el.className = "toast show" + (isError ? " error" : "");
clearTimeout(el._t);
el._t = setTimeout(function() { el.className = "toast"; }, 2500);
}

// ─── OFFICER ─────────────────────────────────────────────────

function onOfficerChange() {
const o = document.getElementById("selOfficer").value;
const s = document.getElementById("selShift").value;
const box = document.getElementById("reportIdBox");

document.getElementById("topOfficer").textContent = o ? o.split(" ")[0] : "";
document.getElementById("sigOfficerName").textContent = o;

if (o && s) {
document.getElementById("reportIdVal").textContent = reportId;
document.getElementById("reportIdTime").textContent = "Jam Mulai: " + formatTime(startTime);
box.style.display = "block";
} else {
box.style.display = "none";
}
}

// ─── STEP BAR ────────────────────────────────────────────────

function buildStepBar() {
const bar = document.getElementById("stepBar");
bar.innerHTML = "";
STEPS_LABEL.forEach(function(label, i) {
const dot = document.createElement("div");
dot.className = "step-dot";
dot.id = "stepDot" + i;
dot.textContent = i + 1;
bar.appendChild(dot);
if (i < STEPS_LABEL.length - 1) {
const line = document.createElement("div");
line.className = "step-line";
line.id = "stepLine" + i;
bar.appendChild(line);
}
});
const lbl = document.createElement("span");
lbl.className = "step-label";
lbl.id = "stepLabel";
bar.appendChild(lbl);
}

function updateStepBar() {
STEPS_LABEL.forEach(function(label, i) {
const dot = document.getElementById("stepDot" + i);
dot.className = "step-dot";
if (i < currentStep) { dot.className = "step-dot done"; dot.textContent = "✓"; }
else if (i === currentStep) { dot.className = "step-dot active"; dot.textContent = i + 1; }
else { dot.textContent = i + 1; }
if (i < STEPS_LABEL.length - 1) {
const line = document.getElementById("stepLine" + i);
line.className = "step-line" + (i < currentStep ? " done" : "");
}
});
document.getElementById("stepLabel").textContent = STEPS_LABEL[currentStep];
}

// ─── NAVIGATION ──────────────────────────────────────────────

function nextStep() {
if (!canProceed()) return;
if (currentStep === 4) buildSummary();
if (currentStep < STEPS_LABEL.length - 1) {
document.getElementById("page" + currentStep).classList.remove("active");
currentStep++;
document.getElementById("page" + currentStep).classList.add("active");
updateStepBar();
updateBottomNav();
window.scrollTo(0, 0);
}
}

function prevStep() {
if (currentStep > 0) {
document.getElementById("page" + currentStep).classList.remove("active");
currentStep--;
document.getElementById("page" + currentStep).classList.add("active");
updateStepBar();
updateBottomNav();
window.scrollTo(0, 0);
}
}

function canProceed() {
if (currentStep === 0) {
if (!document.getElementById("selOfficer").value) { showToast("Pilih nama petugas", true); return false; }
if (!document.getElementById("selShift").value) { showToast("Pilih shift", true); return false; }
}
if (currentStep === 4) {
if (!sigData) { showToast("Tanda tangan diperlukan", true); return false; }
}
return true;
}

function updateBottomNav() {
const btnBack = document.getElementById("btnBack");
const nav = document.getElementById("bottomNav");
const btnNext = document.getElementById("btnNext");
if (currentStep === STEPS_LABEL.length - 1) { nav.style.display = "none"; return; }
nav.style.display = "flex";
btnBack.style.visibility = currentStep === 0 ? "hidden" : "visible";
btnNext.textContent = currentStep === STEPS_LABEL.length - 2 ? "Simpan Laporan ✓" : "Lanjut →";
}

// ─── SUMMARY ─────────────────────────────────────────────────

function buildSummary() {
const endTime = new Date();
const duration = Math.max(1, Math.round((endTime - startTime) / 60000));
const officer = document.getElementById("selOfficer").value;
const shift = document.getElementById("selShift").value;
const { m, tm } = getChecklistStats();
const openF = findings.filter(function(f) { return f.status === "Open"; }).length;

document.getElementById("completeSub").textContent = "Inspeksi selesai — " + duration + " menit";

const grid = document.getElementById("summaryGrid");
const items = [
{ lbl: "Report ID", val: reportId, amber: true, mono: true, small: true },
{ lbl: "Petugas", val: officer },
{ lbl: "Shift", val: shift.split(" ")[0] },
{ lbl: "Jam Mulai", val: formatTime(startTime), mono: true },
{ lbl: "Jam Selesai", val: formatTime(endTime), mono: true },
{ lbl: "Durasi", val: duration + " menit", mono: true },
];
grid.innerHTML = items.map(function(it) {
return '<div class="summary-cell"><div class="summary-cell-lbl">' + it.lbl + '</div>' +
'<div class="summary-cell-val ' + (it.mono ? "mono" : "") + ' ' + (it.amber ? "text-amber" : "") + '" style="' + (it.small ? "font-size:11px" : "") + '">' + it.val + '</div></div>';
}).join("");

document.getElementById("summaryStats").innerHTML =
'<div class="stat-box"><div class="stat-num text-green">' + m + '</div><div class="stat-lbl">M</div></div>' +
'<div class="stat-box"><div class="stat-num text-red">' + tm + '</div><div class="stat-lbl">TM</div></div>' +
'<div class="stat-box"><div class="stat-num" style="color:' + (openF > 0 ? "var(--red)" : "var(--green)") + '">' + openF + '</div><div class="stat-lbl">Open</div></div>';

if (findings.length > 0) {
document.getElementById("summaryFindingsCard").style.display = "block";
document.getElementById("summaryFindingsList").innerHTML = findings.map(function(f, i) {
var openStyle = f.status === "Open"
? "background:rgba(34,197,94,0.12);color:var(--green);border:1px solid rgba(34,197,94,0.3)"
: "background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(239,68,68,0.3)";
return '<div class="finding-status-row"><div><div class="text-sm bold">' + f.category + ' — ' + f.location + '</div><div class="text-xs text-muted">' + f.risk + ' risk</div></div>' +
'<button class="btn btn-sm" style="' + openStyle + '" onclick="toggleFindingStatusSummary(' + i + ')">' + f.status + '</button></div>';
}).join("");
} else {
document.getElementById("summaryFindingsCard").style.display = "none";
}
}

function toggleFindingStatusSummary(i) {
findings[i].status = findings[i].status === "Open" ? "Closed" : "Open";
buildSummary();
}

// ─── SAVE TO GOOGLE SHEETS ───────────────────────────────────

function saveToSheets() {
const officer = document.getElementById("selOfficer").value;
const shift = document.getElementById("selShift").value;
const now = new Date();

const payload = {
reportId: reportId,
tanggal: now.toLocaleDateString("id-ID"),
jamMulai: formatTime(startTime),
jamSelesai: formatTime(now),
petugas: officer,
shift: shift,
cuaca: document.getElementById("inputCuaca").value || "",
namaDinas: document.getElementById("inputNamaDinas").value || "",
checklist: checklistState,
findings: findings,
kejadianKhusus: document.getElementById("specialEvents").value,
kesimpulan: document.getElementById("conclusion").value,
catatanShift: document.getElementById("nextShift").value,
ttdUrl: sigData || "",
};

showToast("Menyimpan laporan...");

fetch(API_URL, {
method: "POST",
body: JSON.stringify({ action: "saveReport", payload: payload }),
})
.then(function(res) { return res.json(); })
.then(function(data) {
if (data.success) {
showToast("✓ Laporan tersimpan ke Drive");
if (data.fileUrl) {
document.getElementById("fileLink").href = data.fileUrl;
document.getElementById("fileLinkBox").style.display = "block";
}
} else {
showToast("Gagal: " + data.message, true);
}
})
.catch(function() {
showToast("Error koneksi", true);
});
}

// ─── SHARE WHATSAPP ──────────────────────────────────────────

function shareWA() {
const officer = document.getElementById("selOfficer").value;
const shift = document.getElementById("selShift").value;
const now = new Date();
const hari = now.toLocaleDateString("id-ID", { weekday: "long" });
const tanggal = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

function statusItem(key) {
const s = checklistState[key];
if (!s) return "(OK)";
if (s.status === "M") return "(OK)";
return "(U/S)" + (s.note ? " — " + s.note : "");
}

var garbarata = statusItem("Aviobridge");
var floodlight = statusItem("Flood Light");
var adgs = statusItem("ADGS");
var serviceRoad = statusItem("Service Road");
var parkingStand = statusItem("Parking Stand");
var koordinat = statusItem("Koordinat Parking Stand");
var signBox = statusItem("Sign Box");
var heliport = statusItem("Heliport");
var ht = statusItem("HT");
var vhf = statusItem("VHF Portable");
var cctv = statusItem("CCTV Monitor");
var apd = statusItem("APD");
var followme = statusItem("Follow Me Car");
var komputer = statusItem("Komputer");
var fod = statusItem("FOD");
var surface = statusItem("Surface");
var genangan = statusItem("Genangan Air");

var temuanText = "- Tidak ada temuan";
if (findings.length > 0) {
temuanText = findings.map(function(f) {
return "- " + f.description + " (" + f.risk + ")" + (f.status === "Open" ? " *[Open]*" : "");
}).join("\n");
}

var kejadian = document.getElementById("specialEvents").value.trim() || "Tidak ada";
var kesimpulan = document.getElementById("conclusion").value.trim() || "-";

var msg =
"Selamat Pagi 🙏\n\n" +
"Kepada Yth.\n" +
"KEPALA BLU UPBU HALUOLEO KENDARI\n\n" +
"Mohon izin melaporkan observasi awal\n" +
"personil AMC BLU UPBU HALUOLEO KENDARI\n\n" +
"📅 Hari/Tanggal : " + hari + ", " + tanggal + "\n" +
"🌅 Shift : " + shift + "\n\n" +
"👥 *PERSONIL ON DUTY*\n" +
"Office Hour\n1.\n2.\n\n" +
"Shift Pagi\n1.\n2.\n3.\n4.\n\n" +
"Shift Siang\n1.\n2.\n3.\n4.\n\n" +
"Kurang :\nKeterangan :\n\n" +
"🏗️ *FASILITAS*\n" +
"- Garbarata 01-04 " + garbarata + "\n" +
"- Floodlight 01-07 " + floodlight + "\n" +
"- ADGS " + adgs + "\n" +
"- Koordinat Parking Stand " + koordinat + "\n" +
"- Sign Box " + signBox + "\n" +
"- Heliport " + heliport + "\n\n" +
"🛣️ *KONDISI AREA*\n" +
"- Service Road " + serviceRoad + "\n" +
"- Parking Stand " + parkingStand + "\n" +
"- FOD " + fod + "\n" +
"- Surface " + surface + "\n" +
"- Genangan Air " + genangan + "\n\n" +
"🛠️ *PERALATAN & INVENTARIS*\n" +
"- HT " + ht + "\n" +
"- VHF Portable " + vhf + "\n" +
"- CCTV Monitor " + cctv + "\n" +
"- APD " + apd + "\n" +
"- Follow Me Car " + followme + "\n" +
"- Komputer " + komputer + "\n\n" +
"🔍 *TEMUAN*\n" + temuanText + "\n\n" +
"⚡ *KEJADIAN KHUSUS*\n- " + kejadian + "\n\n" +
"📝 *KESIMPULAN*\n- " + kesimpulan + "\n\n" +
"Demikian dilaporkan personil AMC BLU UPBU\n" +
"HALUOLEO KENDARI, mohon kiranya menjadi\n" +
"bahan pemeriksaan.\n\n" +
"Terima kasih 🙏";

window.open("https://wa.me/?text=" + encodeURIComponent(msg));
}

// ─── RESET ───────────────────────────────────────────────────

function resetApp() {
if (!confirm("Mulai inspeksi baru? Semua data saat ini akan direset.")) return;

currentStep = 0;
findings = [];
sigData = null;
reportId = generateReportId();
startTime = new Date();

buildChecklistState();

document.getElementById("selOfficer").value = "";
document.getElementById("selShift").value = "";
document.getElementById("specialEvents").value = "";
document.getElementById("conclusion").value = "";
document.getElementById("nextShift").value = "";
document.getElementById("reportIdBox").style.display = "none";
document.getElementById("topOfficer").textContent = "";
document.getElementById("summaryFindingsCard").style.display = "none";

clearSig();
buildChecklist();
renderFindings();

document.querySelectorAll(".step-page").forEach(function(p) { p.classList.remove("active"); });
document.getElementById("page0").classList.add("active");
document.getElementById("bottomNav").style.display = "flex";

updateStepBar();
updateBottomNav();
window.scrollTo(0, 0);
}

// ─── START ───────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", init);
