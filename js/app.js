// ============================================================
// app.js — Logika utama, navigasi, summary, dan reset
// ============================================================

const API_URL = "https://script.google.com/macros/s/AKfycbxhe_9PUEe3whyJo4ToE5lchLDPCNoG-g5dXwDcNVxOgv4YKu-vSQM6I2mUFr-8P5GJ/exec";

let currentStep = 0;
let reportId = "";
let startTime = new Date();

// ─── INIT ────────────────────────────────────────────────────

function init() {
  startTime = new Date();
  reportId = generateReportId();

  // Tampilkan tanggal di halaman welcome
  document.getElementById("welcomeDate").textContent = formatDate(new Date());

  // Inisialisasi state checklist
  buildChecklistState();

  // Build DOM checklist
  buildChecklist();

  // Build step bar
  buildStepBar();

  // Event listener officer & shift
  document.getElementById("selOfficer").addEventListener("change", onOfficerChange);
  document.getElementById("selShift").addEventListener("change", onOfficerChange);

  // Inisialisasi signature canvas
  initSigCanvas();

  // Update tampilan awal
  updateStepBar();
  updateBottomNav();
}

// ─── HELPERS ─────────────────────────────────────────────────

function generateReportId() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `AMC-HLO-${ymd}-${seq}`;
}

function formatDate(d) {
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(d) {
  return d.toTimeString().slice(0, 5);
}

function showToast(msg, isError = false) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "toast show" + (isError ? " error" : "");
  clearTimeout(el._t);
  el._t = setTimeout(() => {
    el.className = "toast";
  }, 2500);
}

// ─── OFFICER ─────────────────────────────────────────────────

function onOfficerChange() {
  const o = document.getElementById("selOfficer").value;
  const s = document.getElementById("selShift").value;
  const box = document.getElementById("reportIdBox");

  // Update nama di topbar
  document.getElementById("topOfficer").textContent = o
    ? o.split(" ")[0]
    : "";

  // Update nama di halaman TTD
  document.getElementById("sigOfficerName").textContent = o;

  if (o && s) {
    document.getElementById("reportIdVal").textContent = reportId;
    document.getElementById("reportIdTime").textContent =
      "Jam Mulai: " + formatTime(startTime);
    box.style.display = "block";
  } else {
    box.style.display = "none";
  }
}

// ─── STEP BAR ────────────────────────────────────────────────

function buildStepBar() {
  const bar = document.getElementById("stepBar");
  bar.innerHTML = "";

  STEPS_LABEL.forEach((label, i) => {
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
  STEPS_LABEL.forEach((label, i) => {
    const dot = document.getElementById("stepDot" + i);
    dot.className = "step-dot";
    if (i < currentStep) {
      dot.className = "step-dot done";
      dot.textContent = "✓";
    } else if (i === currentStep) {
      dot.className = "step-dot active";
      dot.textContent = i + 1;
    } else {
      dot.textContent = i + 1;
    }

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

  // Build summary sebelum masuk halaman selesai
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
    if (!document.getElementById("selOfficer").value) {
      showToast("Pilih nama petugas", true);
      return false;
    }
    if (!document.getElementById("selShift").value) {
      showToast("Pilih shift", true);
      return false;
    }
  }
  if (currentStep === 4) {
    if (!sigData) {
      showToast("Tanda tangan diperlukan", true);
      return false;
    }
  }
  return true;
}

function updateBottomNav() {
  const btnBack = document.getElementById("btnBack");
  const nav = document.getElementById("bottomNav");
  const btnNext = document.getElementById("btnNext");

  // Sembunyikan nav di halaman selesai
  if (currentStep === STEPS_LABEL.length - 1) {
    nav.style.display = "none";
    return;
  }

  nav.style.display = "flex";
  btnBack.style.visibility = currentStep === 0 ? "hidden" : "visible";
  btnNext.textContent =
    currentStep === STEPS_LABEL.length - 2 ? "Simpan Laporan ✓" : "Lanjut →";
}

// ─── SUMMARY ─────────────────────────────────────────────────

function buildSummary() {
  const endTime = new Date();
  const duration = Math.max(1, Math.round((endTime - startTime) / 60000));
  const officer = document.getElementById("selOfficer").value;
  const shift = document.getElementById("selShift").value;

  const { good, attn, dmgd } = getChecklistStats();
  const openF = findings.filter((f) => f.status === "Open").length;

  document.getElementById("completeSub").textContent =
    `Inspeksi selesai — ${duration} menit`;

  // Grid info laporan
  const grid = document.getElementById("summaryGrid");
  const items = [
    { lbl: "Report ID", val: reportId, amber: true, mono: true, small: true },
    { lbl: "Petugas", val: officer },
    { lbl: "Shift", val: shift.split(" ")[0] },
    { lbl: "Jam Mulai", val: formatTime(startTime), mono: true },
    { lbl: "Jam Selesai", val: formatTime(endTime), mono: true },
    { lbl: "Durasi", val: duration + " menit", mono: true },
  ];
  grid.innerHTML = items
    .map(
      (it) => `
      <div class="summary-cell">
        <div class="summary-cell-lbl">${it.lbl}</div>
        <div class="summary-cell-val ${it.mono ? "mono" : ""} ${it.amber ? "text-amber" : ""}"
          style="${it.small ? "font-size:11px" : ""}">
          ${it.val}
        </div>
      </div>`
    )
    .join("");

  // Statistik
  document.getElementById("summaryStats").innerHTML = `
    <div class="stat-box"><div class="stat-num text-green">${good}</div><div class="stat-lbl">Good</div></div>
    <div class="stat-box"><div class="stat-num" style="color:#f59e0b">${attn}</div><div class="stat-lbl">Attn</div></div>
    <div class="stat-box"><div class="stat-num text-red">${dmgd}</div><div class="stat-lbl">Rusak</div></div>
    <div class="stat-box"><div class="stat-num" style="color:${openF > 0 ? "var(--red)" : "var(--green)"}">${openF}</div><div class="stat-lbl">Open</div></div>
  `;

  // Findings summary
  if (findings.length > 0) {
    document.getElementById("summaryFindingsCard").style.display = "block";
    document.getElementById("summaryFindingsList").innerHTML = findings
      .map(
        (f, i) => `
        <div class="finding-status-row">
          <div>
            <div class="text-sm bold">${f.category} — ${f.location}</div>
            <div class="text-xs text-muted">${f.risk} risk</div>
          </div>
          <button class="btn btn-sm"
            style="${f.status === "Open" ? "background:rgba(34,197,94,0.12);color:var(--green);border:1px solid rgba(34,197,94,0.3)" : "background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(239,68,68,0.3)"}"
            onclick="toggleFindingStatusSummary(${i})">
            ${f.status}
          </button>
        </div>`
      )
      .join("");
  } else {
    document.getElementById("summaryFindingsCard").style.display = "none";
  }
}

function toggleFindingStatusSummary(i) {
  findings[i].status = findings[i].status === "Open" ? "Closed" : "Open";
  buildSummary();
}

// ─── SHARE WHATSAPP ──────────────────────────────────────────
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
.then((res) => res.json())
.then((data) => {
if (data.success) {
showToast("✓ Laporan tersimpan ke database");
} else {
showToast("Gagal: " + data.message, true);
}
})
.catch((err) => {
showToast("Error koneksi", true);
});
}

function shareWA() {
  const { good, attn, dmgd } = getChecklistStats();
  const openF = findings.filter((f) => f.status === "Open").length;
  const officer = document.getElementById("selOfficer").value;
  const shift = document.getElementById("selShift").value;
  const conc = document.getElementById("conclusion").value;

  const msg =
    `*LAPORAN INSPEKSI APRON AMC HLO*\n\n` +
    `📋 Report ID: ${reportId}\n` +
    `👤 Petugas: ${officer}\n` +
    `⏰ Shift: ${shift.split(" ")[0]}\n` +
    `📅 ${new Date().toLocaleDateString("id-ID")}\n\n` +
    `✅ Good: ${good} | ⚠️ Attn: ${attn} | ❌ Rusak: ${dmgd}\n` +
    `🔍 Temuan: ${findings.length} (Open: ${openF})\n\n` +
    (conc ? `Kesimpulan: ${conc}\n\n` : "") +
    `_Dikirim dari AMC HLO Inspection System_`;

  window.open("https://wa.me/?text=" + encodeURIComponent(msg));
}

// ─── RESET ───────────────────────────────────────────────────

function resetApp() {
  if (!confirm("Mulai inspeksi baru? Semua data saat ini akan direset.")) return;

  // Reset state
  currentStep = 0;
  findings = [];
  sigData = null;
  reportId = generateReportId();
  startTime = new Date();

  // Reset checklist
  buildChecklistState();

  // Reset form fields
  document.getElementById("selOfficer").value = "";
  document.getElementById("selShift").value = "";
  document.getElementById("specialEvents").value = "";
  document.getElementById("conclusion").value = "";
  document.getElementById("nextShift").value = "";
  document.getElementById("reportIdBox").style.display = "none";
  document.getElementById("topOfficer").textContent = "";
  document.getElementById("summaryFindingsCard").style.display = "none";

  // Reset signature
  clearSig();

  // Rebuild UI
  buildChecklist();
  renderFindings();

  // Kembali ke halaman pertama
  document.querySelectorAll(".step-page").forEach((p) =>
    p.classList.remove("active")
  );
  document.getElementById("page0").classList.add("active");
  document.getElementById("bottomNav").style.display = "flex";

  updateStepBar();
  updateBottomNav();
  window.scrollTo(0, 0);
}

// ─── START ───────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", init);
