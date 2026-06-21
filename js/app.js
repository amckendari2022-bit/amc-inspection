// ============================================================
// app.js — Logika utama, navigasi, summary, simpan, dan reset
// ============================================================

var API_URL = "https://script.google.com/macros/s/AKfycbymtaEW48YpZF9sQCI07X7Jdnk4u30z3FsQ1OP2LalveYDM1-JP3JP17I02n3fLgSelMw/exec";

var currentStep = 0;
var reportId = "";
var startTime = new Date();

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
  if (currentStep === STEPS_LABEL.length - 1) {
    nav.style.display = "none";
    return;
  }
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
    { lbl: "Shift", val: shift.split(" ")[0] },
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

// ─── SAVE TO DRIVE ───────────────────────────────────────────

function generateAndSavePDF(callback) {
  var jsPDF = window.jspdf.jsPDF;
  var doc = new jsPDF({ unit: "mm", format: "a4" });
  var tmPhotosCollection = [];
  var officer = document.getElementById("selOfficer").value;
  var shift = document.getElementById("selShift").value;
  var cuacaEl = document.getElementById("inputCuaca");
  var now = new Date();
  var pageWidth = 210;
  var margin = 15;
  var y = 15;

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
  doc.text("Petugas on duty", margin, y);
  doc.setFont("helvetica", "normal");
  doc.text(": " + officer, margin + 28, y);
  y += 10;

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

      if (state.status === "TM") {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(21, 128, 61);
      }
      doc.setFont("helvetica", "bold");
      doc.text(state.status, margin + 78, y + 4, { align: "center" });
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      var note = state.note ? state.note.substring(0, 32) : "-";
      doc.text(note, margin + 87, y + 4);
      doc.text("-", margin + 137, y + 4);

      
if (state.status === "TM" && state.photos && state.photos.length > 0) {
  tmPhotosCollection.push({
    itemName: itemName,
    note: state.note,
    photos: state.photos
  });
}
      y += rowH;
    });
  });

if (tmPhotosCollection.length > 0) {
  if (y > 250) { doc.addPage(); y = 15; }
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
    var boxH = 30;
    if (y + boxH > 280) { doc.addPage(); y = 15; }

    doc.setDrawColor(252, 165, 165);
    doc.rect(margin, y, pageWidth - margin * 2, boxH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(220, 38, 38);
    doc.text(item.itemName, margin + 3, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text((item.note || "-").substring(0, 90), margin + 3, y + 10);

    var photoX = margin + 3;
    var photoY = y + 13;
    var photoW = 35;
    var photoH = 15;
    for (var p = 0; p < Math.min(item.photos.length, 4); p++) {
      try {
        doc.addImage(item.photos[p].url, "JPEG", photoX, photoY, photoW, photoH);
      } catch (e) {}
      photoX += photoW + 3;
    }

    y += boxH + 3;
  });
}
  // Temuan
  if (findings.length > 0) {
    if (y > 250) { doc.addPage(); y = 15; }
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
    doc.setFontSize(8);

    findings.forEach(function(f) {
  var hasPhoto = f.photos && f.photos.length > 0;
  var boxHeight = hasPhoto ? 32 : 16;

  if (y + boxHeight > 280) { doc.addPage(); y = 15; }

  doc.setDrawColor(220, 220, 220);
  doc.rect(margin, y, pageWidth - margin * 2, boxHeight);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(f.location + " / " + f.category + " (" + f.risk + ")", margin + 3, y + 5);
  doc.setFont("helvetica", "normal");
  doc.text(f.description.substring(0, 90), margin + 3, y + 10);

  if (hasPhoto) {
    var photoX = margin + 3;
    var photoY = y + 13;
    var photoW = 35;
    var photoH = 18;
    for (var p = 0; p < Math.min(f.photos.length, 3); p++) {
      try {
        doc.addImage(f.photos[p].url, "JPEG", photoX, photoY, photoW, photoH);
      } catch (e) {}
      photoX += photoW + 3;
    }
  }

  y += boxHeight + 3;
 });
  }

  // Penutup
  y += 5;
  if (y > 260) { doc.addPage(); y = 15; }
  var kejadian = document.getElementById("specialEvents").value || "Tidak ada";
  var kesimpulan = document.getElementById("conclusion").value || "-";

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
  y += 15;

  // Tanda tangan
  if (y > 250) { doc.addPage(); y = 15; }
  doc.setFontSize(8);
  doc.text("Mengetahui,", margin + 20, y);
  doc.text("Petugas AMC,", margin + 130, y);
  y += 5;

  if (sigData) {
    try {
      doc.addImage(sigData, "PNG", margin + 115, y, 40, 20);
    } catch (e) {}
  }
  y += 22;
  doc.text("(________________)", margin + 12, y);
  doc.text("(" + officer + ")", margin + 130, y);

  // Output sebagai base64
  var pdfBase64 = doc.output("datauristring").split(",")[1];

  if (callback) callback(pdfBase64);
}

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
          if (linkEl && boxEl) {
            linkEl.href = data.pdfUrl;
            boxEl.style.display = "block";
          }
          window._lastPdfUrl = data.pdfUrl;
        } else {
          showToast("Gagal: " + data.message, true);
        }
      })
      .catch(function(err) {
        showToast("Error koneksi: " + err.message, true);
      });
  });
}

  var payload = {
    tanggal: now.toLocaleDateString("id-ID"),
    shift: shift,
    namaDinas: officer,
    cuaca: cuacaEl ? cuacaEl.value : "",
    checklist: simpleChecklist,
    findings: simpleFindings
  };

  showToast("Menyimpan ke database...");

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "saveReport", payload: payload })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.success) {
        showToast("Gagal simpan data: " + data.message, true);
        return;
      }
      showToast("Membuat PDF...");

      generateAndSavePDF(function(pdfBase64) {
        var pdfPayload = {
          tanggal: payload.tanggal,
          shift: payload.shift,
          pdfBase64: pdfBase64
        };

        fetch(API_URL, {
          method: "POST",
          body: JSON.stringify({ action: "savePDF", payload: pdfPayload })
        })
          .then(function(res2) { return res2.json(); })
          .then(function(data2) {
            if (data2.success) {
              showToast("Laporan tersimpan ke Drive");
              var linkEl = document.getElementById("fileLink");
              var boxEl = document.getElementById("fileLinkBox");
              if (linkEl && boxEl) {
                linkEl.href = data2.pdfUrl;
                boxEl.style.display = "block";
              }
              window._lastPdfUrl = data2.pdfUrl;
            } else {
              showToast("Gagal simpan PDF: " + data2.message, true);
            }
          })
          .catch(function(err) {
            showToast("Error simpan PDF: " + err.message, true);
          });
      });
    })
    .catch(function(err) {
      showToast("Error koneksi: " + err.message, true);
    });
  
// ─── SHARE WHATSAPP ──────────────────────────────────────────

function shareWA() {
  var officer = document.getElementById("selOfficer").value;
  var shift = document.getElementById("selShift").value;
  var now = new Date();
  var hari = now.toLocaleDateString("id-ID", { weekday: "long" });
  var tanggal = now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  function statusItem(key) {
    var s = checklistState[key];
    if (!s) return "(OK)";
    if (s.status === "M") return "(OK)";
    return "(U/S)" + (s.note ? " — " + s.note : "");
  }

  var garbarata = statusItem("Aviobridge");
  var floodlight = statusItem("Flood Light");
  var adgs = statusItem("ADGS");
  var ht = statusItem("HT");
  var vhf = statusItem("VHF Portable");
  var cctv = statusItem("CCTV Monitor");
  var apd = statusItem("APD");
  var followme = statusItem("Follow Me Car");
  var komputer = statusItem("Komputer");

  var temuanText = "- Tidak ada temuan";
  if (findings.length > 0) {
    var lines = [];
    for (var i = 0; i < findings.length; i++) {
      var f = findings[i];
      lines.push("- " + f.description + " (" + f.risk + ")" + (f.status === "Open" ? " [Open]" : ""));
    }
    temuanText = lines.join("\n");
  }

  var kejadianEl = document.getElementById("specialEvents");
  var kesimpulanEl = document.getElementById("conclusion");
  var kejadian = kejadianEl && kejadianEl.value.trim() ? kejadianEl.value.trim() : "Tidak ada";
  var kesimpulan = kesimpulanEl && kesimpulanEl.value.trim() ? kesimpulanEl.value.trim() : "-";

  var msg =
    "Selamat Pagi,\n\n" +
    "Kepada Yth.\n" +
    "KEPALA BLU UPBU HALUOLEO KENDARI\n\n" +
    "Mohon izin melaporkan observasi awal\n" +
    "personil AMC BLU UPBU HALUOLEO KENDARI\n\n" +
    "Hari/Tanggal : " + hari + ", " + tanggal + "\n" +
    "Shift : " + shift + "\n\n" +
    "FASILITAS\n" +
    "- Garbarata " + garbarata + "\n" +
    "- Floodlight " + floodlight + "\n" +
    "- ADGS " + adgs + "\n\n" +
    "PERALATAN & INVENTARIS\n" +
    "- HT " + ht + "\n" +
    "- VHF Portable " + vhf + "\n" +
    "- CCTV Monitor " + cctv + "\n" +
    "- APD " + apd + "\n" +
    "- Follow Me Car " + followme + "\n" +
    "- Komputer " + komputer + "\n\n" +
    "TEMUAN\n" + temuanText + "\n\n" +
    "KEJADIAN KHUSUS\n- " + kejadian + "\n\n" +
    "KESIMPULAN\n- " + kesimpulan + "\n\n" +
    "Demikian dilaporkan personil AMC BLU UPBU\n" +
    "HALUOLEO KENDARI, mohon kiranya menjadi\n" +
    "bahan pemeriksaan.\n\n" +
    "Terima kasih";

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

  var fileLinkBox = document.getElementById("fileLinkBox");
  if (fileLinkBox) fileLinkBox.style.display = "none";

  clearSig();
  buildChecklist();
  renderFindings();

  var pages = document.querySelectorAll(".step-page");
  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove("active");
  }
  document.getElementById("page0").classList.add("active");
  document.getElementById("bottomNav").style.display = "flex";

  updateStepBar();
  updateBottomNav();
  window.scrollTo(0, 0);
}

// ─── START ───────────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", init);
