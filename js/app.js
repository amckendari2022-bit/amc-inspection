// ============================================================
// app.js — Logika utama, navigasi, summary, simpan, dan reset
// ============================================================

var API_URL = "https://script.google.com/macros/s/AKfycbymtaEW48YpZF9sQCI07X7Jdnk4u30z3FsQ1OP2LalveYDM1-JP3JP17I02n3fLgSelMw/exec";

var currentStep = 0;
var reportId = "";
var startTime = new Date();
var ronList = [];

var onDutyState = {
  officeHour: [],
  pagi: [],
  siang: []
};

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
  var d = new Date();
  var ymd = d.toISOString().slice(0, 10).replace(/-/g, "");
  var seq = String(Math.floor(Math.random() * 900) + 100);
  return "AMC-HLO-" + ymd + "-" + seq;
}

function formatDate(d) {
  return d.toLocaleDateString("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
}

function formatTime(d) {
  return d.toTimeString().slice(0, 5);
}

function showToast(msg, isError) {
  var el = document.getElementById("toast");
  el.textContent = msg;
  el.className = "toast show" + (isError ? " error" : "");
  clearTimeout(el._t);
  el._t = setTimeout(function() { el.className = "toast"; }, 3000);
}

function isSiang() {
  var shift = document.getElementById("selShift").value;
  return shift.indexOf("Siang") > -1;
}

// ─── SHIFT CHANGE ─────────────────────────────────────────────

function onShiftChange() {
  var siangSection = document.getElementById("siangSection");
  if (isSiang()) {
    siangSection.style.display = "block";
  } else {
    siangSection.style.display = "none";
  }
  onOfficerChange();
}

// ─── ON DUTY PERSONNEL ───────────────────────────────────────

function toggleOnDuty(group, name, chipEl) {
  var list = onDutyState[group];
  var idx = list.indexOf(name);
  if (idx > -1) {
    list.splice(idx, 1);
    chipEl.className = "onduty-chip";
  } else {
    list.push(name);
    chipEl.className = "onduty-chip active";
  }
}

function getOnDutyText(group) {
  var list = onDutyState[group];
  if (!list || list.length === 0) return "-";
  var lines = [];
  for (var i = 0; i < list.length; i++) {
    lines.push((i + 1) + ". " + list[i]);
  }
  return lines.join("\n");
}

// ─── RON ─────────────────────────────────────────────────────

function addRON() {
  var idx = ronList.length;
  ronList.push({ flight: "", reg: "", type: "", stand: "" });
  renderRON();
}

function removeRON(idx) {
  ronList.splice(idx, 1);
  renderRON();
}

function updateRON(idx, field, value) {
  ronList[idx][field] = value;
}

function renderRON() {
  var container = document.getElementById("ronContainer");
  if (!container) return;
  container.innerHTML = "";
  for (var i = 0; i < ronList.length; i++) {
    var ron = ronList[i];
    var div = document.createElement("div");
    div.className = "ron-item";
    div.innerHTML =
      '<div class="text-xs mono text-amber" style="margin-bottom:6px;font-weight:700">Aircraft RON #' + (i + 1) + '</div>' +
      '<button class="ron-del" onclick="removeRON(' + i + ')">Hapus</button>' +
      '<div class="ron-grid">' +
        '<div class="field"><label class="lbl">No. Flight</label><input type="text" value="' + ron.flight + '" placeholder="LNI996" onchange="updateRON(' + i + ',\'flight\',this.value)" /></div>' +
        '<div class="field"><label class="lbl">Registrasi</label><input type="text" value="' + ron.reg + '" placeholder="PK-LSH" onchange="updateRON(' + i + ',\'reg\',this.value)" /></div>' +
        '<div class="field"><label class="lbl">Tipe Pesawat</label><input type="text" value="' + ron.type + '" placeholder="B739" onchange="updateRON(' + i + ',\'type\',this.value)" /></div>' +
        '<div class="field"><label class="lbl">Parking Stand</label><input type="text" value="' + ron.stand + '" placeholder="PS 02" onchange="updateRON(' + i + ',\'stand\',this.value)" /></div>' +
      '</div>';
    container.appendChild(div);
  }
}

// ─── OFFICER ─────────────────────────────────────────────────

function onOfficerChange() {
  var o = document.getElementById("selOfficer").value;
  var s = document.getElementById("selShift").value;
  var box = document.getElementById("reportIdBox");
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
  var bar = document.getElementById("stepBar");
  bar.innerHTML = "";
  for (var i = 0; i < STEPS_LABEL.length; i++) {
    var dot = document.createElement("div");
    dot.className = "step-dot";
    dot.id = "stepDot" + i;
    dot.textContent = i + 1;
    bar.appendChild(dot);
    if (i < STEPS_LABEL.length - 1) {
      var line = document.createElement("div");
      line.className = "step-line";
      line.id = "stepLine" + i;
      bar.appendChild(line);
    }
  }
  var lbl = document.createElement("span");
  lbl.className = "step-label";
  lbl.id = "stepLabel";
  bar.appendChild(lbl);
}

function updateStepBar() {
  for (var i = 0; i < STEPS_LABEL.length; i++) {
    var dot = document.getElementById("stepDot" + i);
    dot.className = "step-dot";
    if (i < currentStep) { dot.className = "step-dot done"; dot.textContent = "✓"; }
    else if (i === currentStep) { dot.className = "step-dot active"; dot.textContent = i + 1; }
    else { dot.textContent = i + 1; }
    if (i < STEPS_LABEL.length - 1) {
      var line = document.getElementById("stepLine" + i);
      line.className = "step-line" + (i < currentStep ? " done" : "");
    }
  }
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
  var btnBack = document.getElementById("btnBack");
  var nav = document.getElementById("bottomNav");
  var btnNext = document.getElementById("btnNext");
  if (currentStep === STEPS_LABEL.length - 1) { nav.style.display = "none"; return; }
  nav.style.display = "flex";
  btnBack.style.visibility = currentStep === 0 ? "hidden" : "visible";
  btnNext.textContent = currentStep === STEPS_LABEL.length - 2 ? "Simpan Laporan ✓" : "Lanjut →";
}

// ─── SUMMARY ─────────────────────────────────────────────────

function buildSummary() {
  var endTime = new Date();
  var duration = Math.max(1, Math.round((endTime - startTime) / 60000));
  var officer = document.getElementById("selOfficer").value;
  var shift = document.getElementById("selShift").value;
  var stats = getChecklistStats();
  var openF = 0;
  for (var i = 0; i < findings.length; i++) {
    if (findings[i].status === "Open") openF++;
  }

  document.getElementById("completeSub").textContent = "Inspeksi selesai — " + duration + " menit";

  var grid = document.getElementById("summaryGrid");
  var items = [
    { lbl: "Report ID", val: reportId, amber: true, mono: true, small: true },
    { lbl: "Petugas", val: officer },
    { lbl: "Shift", val: shift.split(" ")[0] + " " + (shift.split(" ")[1] || "") },
    { lbl: "Jam Mulai", val: formatTime(startTime), mono: true },
    { lbl: "Jam Selesai", val: formatTime(endTime), mono: true },
    { lbl: "Durasi", val: duration + " menit", mono: true }
  ];
  var gridHtml = "";
  for (var j = 0; j < items.length; j++) {
    var it = items[j];
    gridHtml += '<div class="summary-cell"><div class="summary-cell-lbl">' + it.lbl + '</div>' +
      '<div class="summary-cell-val ' + (it.mono ? "mono" : "") + ' ' + (it.amber ? "text-amber" : "") + '" style="' + (it.small ? "font-size:11px" : "") + '">' + it.val + '</div></div>';
  }
  grid.innerHTML = gridHtml;

  document.getElementById("summaryStats").innerHTML =
    '<div class="stat-box"><div class="stat-num text-green">' + stats.m + '</div><div class="stat-lbl">M</div></div>' +
    '<div class="stat-box"><div class="stat-num text-red">' + stats.tm + '</div><div class="stat-lbl">TM</div></div>' +
    '<div class="stat-box"><div class="stat-num" style="color:' + (openF > 0 ? "var(--red)" : "var(--green)") + '">' + openF + '</div><div class="stat-lbl">Open</div></div>';

  if (findings.length > 0) {
    document.getElementById("summaryFindingsCard").style.display = "block";
    var findHtml = "";
    for (var k = 0; k < findings.length; k++) {
      var f = findings[k];
      var openStyle = f.status === "Open"
        ? "background:rgba(34,197,94,0.12);color:var(--green);border:1px solid rgba(34,197,94,0.3)"
        : "background:rgba(239,68,68,0.12);color:var(--red);border:1px solid rgba(239,68,68,0.3)";
      findHtml += '<div class="finding-status-row"><div><div class="text-sm bold">' + f.category + ' — ' + f.location + '</div><div class="text-xs text-muted">' + f.risk + ' risk</div></div>' +
        '<button class="btn btn-sm" style="' + openStyle + '" onclick="toggleFindingStatusSummary(' + k + ')">' + f.status + '</button></div>';
    }
    document.getElementById("summaryFindingsList").innerHTML = findHtml;
  } else {
    document.getElementById("summaryFindingsCard").style.display = "none";
  }
}

function toggleFindingStatusSummary(i) {
  findings[i].status = findings[i].status === "Open" ? "Closed" : "Open";
  buildSummary();
}

// ─── PDF GENERATION ──────────────────────────────────────────

function generateAndSavePDF(callback) {
  var jsPDFLib = window.jspdf.jsPDF;
  var doc = new jsPDFLib({ unit: "mm", format: "a4" });

  var officer = document.getElementById("selOfficer").value;
  var shift = document.getElementById("selShift").value;
  var cuacaEl = document.getElementById("inputCuaca");
  var now = new Date();
  var pageWidth = 210;
  var margin = 15;
  var y = 15;
  var tmPhotosCollection = [];

  // Header
  doc.setFillColor(26, 58, 110);
  doc.rect(margin, y, pageWidth - margin * 2, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("KEMENTERIAN PERHUBUNGAN REPUBLIK INDONESIA", pageWidth / 2, y + 6, { align: "center" });
  doc.text("BLU UPBU KELAS I HALU OLEO KENDARI", pageWidth / 2, y + 11, { align: "center" });
  doc.text("CHECKLIST HARIAN APRON MOVEMENT CONTROL (AMC)", pageWidth / 2, y + 16, { align: "center" });
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("Referensi: SKEP 140/1999 & PR 21/2023", pageWidth / 2, y + 20, { align: "center" });
  y += 28;

  // Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Tanggal", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(": " + now.toLocaleDateString("id-ID"), margin + 28, y);
  doc.setFont("helvetica", "bold");
  doc.text("Petugas Inspeksi", margin + 100, y);
  doc.setFont("helvetica", "normal");
  doc.text(": AMC", margin + 138, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Shift", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(": " + shift, margin + 28, y);
  doc.setFont("helvetica", "bold");
  doc.text("Cuaca", margin + 100, y);
  doc.setFont("helvetica", "normal");
  doc.text(": " + (cuacaEl ? cuacaEl.value : ""), margin + 138, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.text("Pengisi Laporan", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(": " + officer, margin + 28, y);
  y += 8;

  // Personil on duty
  doc.setFillColor(217, 225, 242);
  doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  doc.text("PERSONIL ON DUTY", pageWidth / 2, y + 4.2, { align: "center" });
  y += 8;

  var groups = [
    { label: "Office Hour (08.00 – 16.30)", key: "officeHour" },
    { label: "Dinas Pagi (06.00 – 13.30)", key: "pagi" },
    { label: "Dinas Siang (12.30 – 20.00)", key: "siang" }
  ];
  doc.setFontSize(8);
  for (var gIdx = 0; gIdx < groups.length; gIdx++) {
    var g = groups[gIdx];
    var names = onDutyState[g.key];
    if (y > 270) { doc.addPage(); y = 15; }
    doc.setFont("helvetica", "bold");
    doc.text(g.label + ":", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    if (names && names.length > 0) {
      for (var nIdx = 0; nIdx < names.length; nIdx++) {
        doc.text((nIdx + 1) + ". " + names[nIdx], margin + 4, y);
        y += 5;
      }
    } else {
      doc.text("-", margin + 4, y);
      y += 5;
    }
    y += 2;
  }

  // Kekurangan personel
  var kurang = document.getElementById("inputKurang") ? document.getElementById("inputKurang").value : "0";
  var ketKurang = document.getElementById("inputKetKurang") ? document.getElementById("inputKetKurang").value : "-";
  if (kurang && kurang !== "0") {
    doc.setFont("helvetica", "bold");
    doc.text("Kekurangan Personel: " + kurang + " orang — " + ketKurang, margin, y);
    y += 6;
  }
  y += 4;

  // Table header
  function tableHeader() {
    doc.setFillColor(26, 58, 110);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.rect(margin, y, 10, 7, "F");
    doc.rect(margin + 10, y, 60, 7, "F");
    doc.rect(margin + 70, y, 16, 7, "F");
    doc.rect(margin + 86, y, 50, 7, "F");
    doc.rect(margin + 136, y, pageWidth - margin * 2 - 136, 7, "F");
    doc.text("No", margin + 5, y + 5, { align: "center" });
    doc.text("Item Inspeksi", margin + 12, y + 5);
    doc.text("Status", margin + 78, y + 5, { align: "center" });
    doc.text("Temuan/Ket", margin + 88, y + 5);
    doc.text("Tindak Lanjut", margin + 138, y + 5);
    y += 7;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
  }

  tableHeader();

  CHECKLIST_DATA.forEach(function(cat) {
    if (y > 270) { doc.addPage(); y = 15; tableHeader(); }
    doc.setFillColor(217, 225, 242);
    doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(cat.category.toUpperCase(), pageWidth / 2, y + 4.2, { align: "center" });
    y += 6;
    doc.setFont("helvetica", "normal");

    cat.items.forEach(function(itemName, idx) {
      if (y > 275) { doc.addPage(); y = 15; tableHeader(); }
      var state = checklistState[itemName] || { status: "M", note: "" };
      var rowH = 6;
      doc.setDrawColor(200, 200, 200);
      doc.rect(margin, y, 10, rowH);
      doc.rect(margin + 10, y, 60, rowH);
      doc.rect(margin + 70, y, 16, rowH);
      doc.rect(margin + 86, y, 50, rowH);
      doc.rect(margin + 136, y, pageWidth - margin * 2 - 136, rowH);
      doc.setFontSize(7.5);
      doc.text(String(idx + 1), margin + 5, y + 4, { align: "center" });
      doc.text(itemName.substring(0, 38), margin + 11, y + 4);
      if (state.status === "TM") { doc.setTextColor(220, 38, 38); } else { doc.setTextColor(21, 128, 61); }
      doc.setFont("helvetica", "bold");
      doc.text(state.status, margin + 78, y + 4, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      var note = state.note ? state.note.substring(0, 32) : "-";
      doc.text(note, margin + 87, y + 4);
      doc.text("-", margin + 137, y + 4);
      if (state.status === "TM" && state.photos && state.photos.length > 0) {
        tmPhotosCollection.push({ itemName: itemName, note: state.note, photos: state.photos });
      }
      y += rowH;
    });
  });

  // Foto item TM
  if (tmPhotosCollection.length > 0) {
    if (y > 240) { doc.addPage(); y = 15; }
    y += 4;
    doc.setFillColor(26, 58, 110);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("FOTO DOKUMENTASI ITEM TM", margin + 3, y + 4.2);
    y += 9;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    tmPhotosCollection.forEach(function(item) {
      var photosPerRow = 2;
      var photoW = 80;
      var photoH = 55;
      var rows = Math.ceil(Math.min(item.photos.length, 4) / photosPerRow);
      var boxH = 16 + (rows * (photoH + 4));

      if (y + boxH > 280) { doc.addPage(); y = 15; }
      doc.setDrawColor(252, 165, 165);
      doc.rect(margin, y, pageWidth - margin * 2, boxH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(220, 38, 38);
      doc.text(item.itemName, margin + 3, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text((item.note || "-").substring(0, 90), margin + 3, y + 11);

      var photoStartY = y + 14;
      for (var p = 0; p < Math.min(item.photos.length, 4); p++) {
        var col = p % photosPerRow;
        var row = Math.floor(p / photosPerRow);
        var photoX = margin + 3 + col * (photoW + 4);
        var photoY = photoStartY + row * (photoH + 4);
        try { doc.addImage(item.photos[p].url, "JPEG", photoX, photoY, photoW, photoH); } catch (e) {}
      }
      y += boxH + 4;
    });
  }

  // Temuan
  if (findings.length > 0) {
    if (y > 240) { doc.addPage(); y = 15; }
    y += 5;
    doc.setFillColor(26, 58, 110);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("TEMUAN KEGIATAN", margin + 3, y + 4.2);
    y += 9;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    findings.forEach(function(f) {
      var hasPhoto = f.photos && f.photos.length > 0;
      var photosPerRow = 2;
      var photoW = 80;
      var photoH = 55;
      var photoCount = hasPhoto ? Math.min(f.photos.length, 4) : 0;
      var photoRows = hasPhoto ? Math.ceil(photoCount / photosPerRow) : 0;
      var boxH = 16 + (photoRows * (photoH + 4));

      if (y + boxH > 280) { doc.addPage(); y = 15; }
      doc.setDrawColor(220, 220, 220);
      doc.rect(margin, y, pageWidth - margin * 2, boxH);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(f.location + " / " + f.category + " (" + f.risk + ")", margin + 3, y + 5);
      doc.setFont("helvetica", "normal");
      doc.text(f.description.substring(0, 90), margin + 3, y + 11);

      if (hasPhoto) {
        var photoStartY = y + 14;
        for (var p = 0; p < photoCount; p++) {
          var col = p % photosPerRow;
          var row = Math.floor(p / photosPerRow);
          var photoX = margin + 3 + col * (photoW + 4);
          var photoY = photoStartY + row * (photoH + 4);
          try { doc.addImage(f.photos[p].url, "JPEG", photoX, photoY, photoW, photoH); } catch (e) {}
        }
      }
      y += boxH + 4;
    });
  }

  // Pergerakan penerbangan (shift siang)
  if (isSiang()) {
    if (y > 240) { doc.addPage(); y = 15; }
    y += 5;
    doc.setFillColor(26, 58, 110);
    doc.setTextColor(255, 255, 255);
    doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("PERGERAKAN PENERBANGAN", margin + 3, y + 4.2);
    y += 9;
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");

    var flightData = [
      ["Total Flight", document.getElementById("inputTotalFlight") ? document.getElementById("inputTotalFlight").value || "0" : "0"],
      ["Arrival", document.getElementById("inputArrival") ? document.getElementById("inputArrival").value || "0" : "0"],
      ["Departure", document.getElementById("inputDeparture") ? document.getElementById("inputDeparture").value || "0" : "0"],
      ["Docking", document.getElementById("inputDocking") ? document.getElementById("inputDocking").value || "0" : "0"],
      ["Undocking", document.getElementById("inputUndocking") ? document.getElementById("inputUndocking").value || "0" : "0"]
    ];
    for (var fi = 0; fi < flightData.length; fi++) {
      doc.setFont("helvetica", "bold");
      doc.text(flightData[fi][0] + " :", margin + 3, y);
      doc.setFont("helvetica", "normal");
      doc.text(flightData[fi][1], margin + 50, y);
      y += 6;
    }

    // RON
    if (ronList.length > 0) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.text("Aircraft RON:", margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      for (var ri = 0; ri < ronList.length; ri++) {
        var ron = ronList[ri];
        var ronText = (ri + 1) + ". " + ron.flight + " / " + ron.reg + " (" + ron.type + ") — " + ron.stand;
        doc.text(ronText, margin + 4, y);
        y += 5;
      }
    }
  }

  // Penutup
  y += 5;
  if (y > 260) { doc.addPage(); y = 15; }
  var kejadian = document.getElementById("specialEvents") ? document.getElementById("specialEvents").value || "Tidak ada" : "Tidak ada";
  var kesimpulan = document.getElementById("conclusion") ? document.getElementById("conclusion").value || "-" : "-";
  var parkingLink = document.getElementById("inputParkingLink") ? document.getElementById("inputParkingLink").value || "" : "";

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Kejadian Khusus:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(kejadian.substring(0, 100), margin, y + 5);
  y += 12;

  doc.setFont("helvetica", "bold");
  doc.text("Kesimpulan:", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(kesimpulan.substring(0, 100), margin, y + 5);
  y += 12;

  if (parkingLink) {
    doc.setFont("helvetica", "bold");
    doc.text("Link Alokasi Parking Stand:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(parkingLink.substring(0, 80), margin, y + 5);
    y += 12;
  }

  // Tanda tangan
  if (y > 250) { doc.addPage(); y = 15; }
  doc.setFontSize(8);
  doc.text("Mengetahui,", margin + 20, y);
  doc.text("Petugas AMC,", margin + 130, y);
  y += 5;
  if (sigData) {
    try { doc.addImage(sigData, "PNG", margin + 115, y, 40, 20); } catch (e) {}
  }
  y += 22;
  doc.text("(________________)", margin + 12, y);
  doc.text("(" + officer + ")", margin + 130, y);

  var pdfBase64 = doc.output("datauristring").split(",")[1];
  if (callback) callback(pdfBase64);
}

// ─── SAVE TO DRIVE ───────────────────────────────────────────

function saveToSheets() {
  showToast("Membuat PDF...");
  generateAndSavePDF(function(pdfBase64) {
    var now = new Date();
    var shift = document.getElementById("selShift").value;
    var pdfPayload = {
      tanggal: now.toLocaleDateString("id-ID"),
      shift: shift,
      pdfBase64: pdfBase64
    };
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "savePDF", payload: pdfPayload })
    })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data.success) {
          showToast("Laporan tersimpan ke Drive");
          var linkEl = document.getElementById("fileLink");
          var boxEl = document.getElementById("fileLinkBox");
          if (linkEl && boxEl) { linkEl.href = data.pdfUrl; boxEl.style.display = "block"; }
          window._lastPdfUrl = data.pdfUrl;
        } else {
          showToast("Gagal: " + data.message, true);
        }
      })
      .catch(function(err) { showToast("Error koneksi: " + err.message, true); });
  });
}

// ─── SHARE WHATSAPP ──────────────────────────────────────────

function shareWA() {
  var officer = document.getElementById("selOfficer").value;
  var shift = document.getElementById("selShift").value;
  var now = new Date();
  var hari = now.toLocaleDateString("id-ID", { weekday: "long" });
  var tanggal = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  var salam = isSiang() ? "Selamat Malam," : "Selamat Pagi,";
  var judulLaporan = isSiang()
    ? "Mohon izin melaporkan hasil observasi awal hingga akhir kegiatan\nPersonel AMC BLU UPBU Haluoleo Kendari sebagai berikut:"
    : "Mohon izin melaporkan observasi awal\npersonil AMC BLU UPBU HALUOLEO KENDARI";

  function statusItem(key) {
    var s = checklistState[key];
    if (!s || s.status === "M") return "OK";
    return "U/S" + (s.note ? " — " + s.note : "");
  }

  var kurang = document.getElementById("inputKurang") ? document.getElementById("inputKurang").value || "0" : "0";
  var ketKurang = document.getElementById("inputKetKurang") ? document.getElementById("inputKetKurang").value || "-" : "-";
  var parkingLink = document.getElementById("inputParkingLink") ? document.getElementById("inputParkingLink").value || "" : "";

  var temuanLines = [];
  for (var i = 0; i < findings.length; i++) {
    temuanLines.push("- " + findings[i].description);
  }
  var temuanText = temuanLines.length > 0 ? temuanLines.join("\n") : "- Tidak ada temuan";

  var kejadian = document.getElementById("specialEvents") ? document.getElementById("specialEvents").value.trim() : "";

  // Personil
  function buildPersonilLines(group) {
    var list = onDutyState[group];
    if (!list || list.length === 0) return "-";
    var lines = [];
    for (var i = 0; i < list.length; i++) { lines.push((i + 1) + ". " + list[i]); }
    return lines.join("\n");
  }

  var msg = salam + "\n\n" +
    "Yth. Kepala BLU UPBU Haluoleo Kendari\n\n" +
    judulLaporan + "\n\n" +
    "Hari/Tanggal : " + hari + ", " + tanggal + "\n\n" +
    "Jam Kerja:\n" +
    "- Office Hour  : 08.00 - 16.30 WITA\n" +
    "- Shift Pagi   : 06.00 - 13.30 WITA\n" +
    "- Shift Siang  : 12.30 - 20.00 WITA\n\n" +
    "Personel Bertugas\n\n" +
    "Office Hour:\n" + buildPersonilLines("officeHour") + "\n\n" +
    "Shift Pagi:\n" + buildPersonilLines("pagi") + "\n\n" +
    "Shift Siang:\n" + buildPersonilLines("siang") + "\n\n" +
    "Kekurangan Personel : " + kurang + " orang\n" +
    "Keterangan : " + ketKurang + "\n\n" +
    "Fasilitas:\n" +
    "- Garbarata 01 : " + statusItem("Aviobridge") + "\n" +
    "- Garbarata 02 : " + statusItem("Aviobridge") + "\n" +
    "- Garbarata 03 : " + statusItem("Aviobridge") + "\n" +
    "- Garbarata 04 : " + statusItem("Aviobridge") + "\n" +
    "- Floodlight 01-07 : " + statusItem("Flood Light") + "\n" +
    "- ADGS : " + statusItem("ADGS") + "\n" +
    "- Apron : " + statusItem("Parking Stand") + "\n\n" +
    "Peralatan & Inventaris:\n" +
    "- HT : " + statusItem("HT") + "\n" +
    "- VHF Portable : " + statusItem("VHF Portable") + "\n" +
    "- Komputer : " + statusItem("Komputer") + "\n" +
    "- Monitor CCTV : " + statusItem("CCTV Monitor") + "\n\n";

  if (isSiang()) {
    var totalFlight = document.getElementById("inputTotalFlight") ? document.getElementById("inputTotalFlight").value || "0" : "0";
    var arrival = document.getElementById("inputArrival") ? document.getElementById("inputArrival").value || "0" : "0";
    var departure = document.getElementById("inputDeparture") ? document.getElementById("inputDeparture").value || "0" : "0";
    var docking = document.getElementById("inputDocking") ? document.getElementById("inputDocking").value || "0" : "0";
    var undocking = document.getElementById("inputUndocking") ? document.getElementById("inputUndocking").value || "0" : "0";

    msg += "Pergerakan Penerbangan:\n" +
      "- Total Flight : " + totalFlight + "\n" +
      "- Arrival      : " + arrival + "\n" +
      "- Departure    : " + departure + "\n" +
      "- Docking      : " + docking + "\n" +
      "- Undocking    : " + undocking + "\n\n";

    if (ronList.length > 0) {
      msg += "Aircraft RON:\n";
      for (var ri = 0; ri < ronList.length; ri++) {
        var ron = ronList[ri];
        msg += "- " + ron.flight + " / " + ron.reg + " (" + ron.type + ") - " + ron.stand + "\n";
      }
      msg += "\n";
    }
  }

  msg += "Temuan:\n" + temuanText + "\n\n";

  if (kejadian) { msg += "Kejadian Khusus:\n" + kejadian + "\n\n"; }

  if (parkingLink) {
    msg += "Lampiran Alokasi Parking Stand:\n" + parkingLink + "\n\n";
  }

  if (window._lastPdfUrl) {
    msg += "Link Checklist:\n" + window._lastPdfUrl + "\n\n";
  }

  msg += "Demikian laporan hasil observasi Personel AMC BLU UPBU Haluoleo Kendari\n" +
    "disampaikan untuk menjadi bahan monitoring dan tindak lanjut.\n\n" +
    "Terima kasih.";

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
  onDutyState = { officeHour: [], pagi: [], siang: [] };
  ronList = [];
  window._lastPdfUrl = null;

  buildChecklistState();

  document.getElementById("selOfficer").value = "";
  document.getElementById("selShift").value = "";
  document.getElementById("inputCuaca").value = "";
  document.getElementById("specialEvents").value = "";
  document.getElementById("conclusion").value = "";
  document.getElementById("nextShift").value = "";
  document.getElementById("inputKurang").value = "";
  document.getElementById("inputKetKurang").value = "-";
  document.getElementById("inputParkingLink").value = "";
  document.getElementById("reportIdBox").style.display = "none";
  document.getElementById("topOfficer").textContent = "";
  document.getElementById("summaryFindingsCard").style.display = "none";
  document.getElementById("siangSection").style.display = "none";

  var flightFields = ["inputTotalFlight", "inputArrival", "inputDeparture", "inputDocking", "inputUndocking"];
  for (var fi = 0; fi < flightFields.length; fi++) {
    var el = document.getElementById(flightFields[fi]);
    if (el) el.value = "";
  }

  var ronContainer = document.getElementById("ronContainer");
  if (ronContainer) ronContainer.innerHTML = "";

  var chips = document.querySelectorAll(".onduty-chip");
  for (var i = 0; i < chips.length; i++) { chips[i].className = "onduty-chip"; }

  var fileLinkBox = document.getElementById("fileLinkBox");
  if (fileLinkBox) fileLinkBox.style.display = "none";

  clearSig();
  buildChecklist();
  renderFindings();

  var pages = document.querySelectorAll(".step-page");
  for (var p = 0; p < pages.length; p++) { pages[p].classList.remove("active"); }
  document.getElementById("page0").classList.add("active");
  document.getElementById("bottomNav").style.display = "flex";

  updateStepBar();
  updateBottomNav();
  window.scrollTo(0, 0);
}

// ─── START ───────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", init);
