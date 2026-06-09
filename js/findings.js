// ============================================================
// findings.js — Logika modul temuan inspeksi
// ============================================================

let findings = [];
let editingFindingIdx = null;
let currentRisk = "";
let findingPhotos = [];

// ─── MODAL ───────────────────────────────────────────────────

function openFindingModal(idx = null) {
  editingFindingIdx = idx;
  currentRisk = "";
  findingPhotos = [];

  document.getElementById("modalTitle").textContent =
    idx !== null ? "Edit Temuan" : "Temuan Baru";

  if (idx !== null) {
    // Edit mode — isi form dengan data existing
    const f = findings[idx];
    document.getElementById("fLoc").value = f.location;
    document.getElementById("fCat").value = f.category;
    document.getElementById("fAnimal").value = f.animalType || "";
    document.getElementById("fQty").value = f.quantity || "";
    document.getElementById("fMitigation").value = f.mitigation || "";
    document.getElementById("fDesc").value = f.description;
    findingPhotos = [...f.photos];
    currentRisk = f.risk;
    onCatChange();
    setRisk(f.risk);
  } else {
    // New finding — reset form
    document.getElementById("fLoc").value = "";
    document.getElementById("fCat").value = "";
    document.getElementById("fAnimal").value = "";
    document.getElementById("fQty").value = "";
    document.getElementById("fMitigation").value = "";
    document.getElementById("fDesc").value = "";
    document.getElementById("wildlifeBox").style.display = "none";
    resetRiskPills();
  }

  renderFindingPhotos();
  document.getElementById("findingModal").classList.add("open");
}

function closeFindingModal() {
  document.getElementById("findingModal").classList.remove("open");
}

function modalOverlayClick(e) {
  if (e.target === document.getElementById("findingModal")) {
    closeFindingModal();
  }
}

// ─── FORM LOGIC ──────────────────────────────────────────────

// Tampilkan/sembunyikan wildlife module
function onCatChange() {
  const cat = document.getElementById("fCat").value;
  document.getElementById("wildlifeBox").style.display =
    cat === "Wildlife" ? "block" : "none";
}

// Set tingkat risiko
function setRisk(r) {
  currentRisk = r;
  const map = { Low: "rLow", Medium: "rMed", High: "rHigh" };

  Object.entries(map).forEach(([risk, id]) => {
    const el = document.getElementById(id);
    if (risk === r) {
      el.style.background = RISK_BG[r];
      el.style.borderColor = RISK_COLORS[r];
      el.style.color = RISK_COLORS[r];
      el.style.fontWeight = "800";
      el.style.boxShadow = `0 0 8px ${RISK_COLORS[r]}44`;
    } else {
      el.style.background = "rgba(255,255,255,0.03)";
      el.style.boxShadow = "";
      el.style.fontWeight = "700";
    }
  });
}

function resetRiskPills() {
  ["rLow", "rMed", "rHigh"].forEach((id) => {
    const el = document.getElementById(id);
    el.style.background = "rgba(255,255,255,0.03)";
    el.style.boxShadow = "";
    el.style.fontWeight = "700";
  });
}

// ─── FOTO ────────────────────────────────────────────────────

function handleFindingPhotos(e) {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      findingPhotos.push({ name: file.name, url: ev.target.result });
      renderFindingPhotos();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = "";
}

function renderFindingPhotos() {
  const grid = document.getElementById("fPhotoGrid");
  grid.innerHTML = findingPhotos
    .map(
      (p, i) => `
      <div class="photo-thumb">
        <img src="${p.url}" alt="${p.name}" />
        <button class="photo-del" onclick="removeFindingPhoto(${i})">×</button>
      </div>`
    )
    .join("");
}

function removeFindingPhoto(idx) {
  findingPhotos.splice(idx, 1);
  renderFindingPhotos();
}

// ─── SAVE / DELETE ───────────────────────────────────────────

function saveFinding() {
  // Validasi
  if (!document.getElementById("fLoc").value) {
    showToast("Pilih lokasi temuan", true); return;
  }
  if (!document.getElementById("fCat").value) {
    showToast("Pilih kategori temuan", true); return;
  }
  if (!currentRisk) {
    showToast("Pilih tingkat risiko", true); return;
  }
  if (!document.getElementById("fDesc").value.trim()) {
    showToast("Isi deskripsi temuan", true); return;
  }
  if (findingPhotos.length === 0) {
    showToast("Foto temuan wajib diisi", true); return;
  }

  const finding = {
    id:
      editingFindingIdx !== null
        ? findings[editingFindingIdx].id
        : "TEM-" + Date.now(),
    location: document.getElementById("fLoc").value,
    category: document.getElementById("fCat").value,
    risk: currentRisk,
    description: document.getElementById("fDesc").value.trim(),
    photos: [...findingPhotos],
    status:
      editingFindingIdx !== null ? findings[editingFindingIdx].status : "Open",
    animalType: document.getElementById("fAnimal").value,
    quantity: document.getElementById("fQty").value,
    mitigation: document.getElementById("fMitigation").value,
  };

  if (editingFindingIdx !== null) {
    findings[editingFindingIdx] = finding;
  } else {
    findings.push(finding);
  }

  closeFindingModal();
  renderFindings();
  showToast("✓ Temuan disimpan");
}

function deleteFinding(i) {
  findings.splice(i, 1);
  renderFindings();
  showToast("Temuan dihapus");
}

function toggleFindingStatus(i) {
  findings[i].status = findings[i].status === "Open" ? "Closed" : "Open";
  renderFindings();
}

// ─── RENDER ──────────────────────────────────────────────────

function renderFindings() {
  document.getElementById("findingCount").textContent =
    findings.length + " temuan";

  const container = document.getElementById("findingsContainer");
  const empty = document.getElementById("findingsEmpty");

  // Hapus semua card lama
  container.querySelectorAll(".finding-card").forEach((el) => el.remove());

  if (findings.length === 0) {
    empty.style.display = "block";
    return;
  }
  empty.style.display = "none";

  findings.forEach((f, i) => {
    const card = document.createElement("div");
    card.className = "finding-card";

    const openStyle =
      f.status === "Open"
        ? "background:rgba(239,68,68,0.1);color:var(--red);border-color:rgba(239,68,68,0.3)"
        : "background:rgba(34,197,94,0.1);color:var(--green);border-color:rgba(34,197,94,0.3)";

    const riskColor = RISK_COLORS[f.risk] || "#fff";

    card.innerHTML = `
      <div class="finding-card-header">
        <div>
          <div class="finding-loc">${f.location}</div>
          <div class="finding-cat">${f.category}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px">
          ${f.risk ? `<span class="risk-badge" style="background:${RISK_BG[f.risk]};color:${riskColor};border:1px solid ${riskColor}44">${f.risk}</span>` : ""}
          <span class="status-badge" style="${openStyle}">${f.status}</span>
        </div>
      </div>
      <div class="finding-body">
        <div class="finding-desc">${f.description}</div>
        ${
          f.category === "Wildlife" && f.animalType
            ? `<div class="finding-meta">🐦 ${f.animalType} × ${f.quantity || 1} | ${f.mitigation || "—"}</div>`
            : ""
        }
        ${f.photos.length > 0 ? `<div class="finding-meta">📷 ${f.photos.length} foto</div>` : ""}
        <div class="finding-actions">
          <button class="btn btn-ghost btn-sm" onclick="openFindingModal(${i})">Edit</button>
          <button class="btn btn-sm" style="${openStyle}"
            onclick="toggleFindingStatus(${i})">
            ${f.status === "Open" ? "Tutup" : "Buka"}
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteFinding(${i})">Hapus</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}
