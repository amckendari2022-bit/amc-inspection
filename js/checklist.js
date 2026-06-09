// ============================================================
// checklist.js — Logika dan rendering checklist inspeksi
// ============================================================

// State checklist: { "itemKey": { status, note, photos[] } }
// itemKey untuk stand: "Parking Stand 01 — Marka", dll.
let checklistState = {};

// Inisialisasi state — semua item default "Good"
function buildChecklistState() {
  checklistState = {};

  CHECKLIST_DATA.forEach((cat) => {
    if (cat.isStandCategory) {
      // Generate item untuk setiap parking stand
      cat.stands.forEach((stand) => {
        cat.standItems.forEach((item) => {
          const key = `${stand} — ${item}`;
          checklistState[key] = { status: "Good", note: "", photos: [] };
        });
      });
    } else {
      cat.items.forEach((item) => {
        checklistState[item] = { status: "Good", note: "", photos: [] };
      });
    }
  });
}

// Hitung statistik checklist
function getChecklistStats() {
  const all = Object.values(checklistState);
  const total = all.length;
  const good = all.filter((v) => v.status === "Good").length;
  const attn = all.filter((v) => v.status === "Needs Attention").length;
  const dmgd = all.filter((v) => v.status === "Damaged").length;
  const score = Math.round((good / total) * 100);
  return { total, good, attn, dmgd, score };
}

// Update tampilan statistik di atas checklist
function updateStats() {
  const { good, attn, dmgd, score } = getChecklistStats();
  document.getElementById("statGood").textContent = good;
  document.getElementById("statAttn").textContent = attn;
  document.getElementById("statDmgd").textContent = dmgd;
  document.getElementById("statScore").textContent = score + "%";
  document.getElementById("progressFill").style.width = score + "%";
}

// Build seluruh DOM checklist
function buildChecklist() {
  const container = document.getElementById("checklistContainer");
  container.innerHTML = "";

  CHECKLIST_DATA.forEach((cat) => {
    if (cat.isStandCategory) {
      renderStandCategory(cat, container);
    } else {
      renderNormalCategory(cat, container);
    }
  });

  updateStats();
}

// Render kategori biasa
function renderNormalCategory(cat, container) {
  const issues = cat.items.filter(
    (item) => checklistState[item]?.status !== "Good"
  ).length;

  const section = document.createElement("div");
  section.className = "section-mb";
  section.innerHTML = buildCatHeader(cat.category, cat.items.length, issues);

  cat.items.forEach((item) => {
    section.appendChild(buildCheckItem(item, item));
  });

  container.appendChild(section);
}

// Render kategori Parking Stand (per-stand accordion)
function renderStandCategory(cat, container) {
  const section = document.createElement("div");
  section.className = "section-mb";

  // Hitung total issues di semua stand
  let totalItems = 0;
  let totalIssues = 0;
  cat.stands.forEach((stand) => {
    cat.standItems.forEach((item) => {
      const key = `${stand} — ${item}`;
      totalItems++;
      if (checklistState[key]?.status !== "Good") totalIssues++;
    });
  });

  section.innerHTML = buildCatHeader(cat.category, totalItems, totalIssues);

  // Setiap stand jadi accordion
  cat.stands.forEach((stand) => {
    const standIssues = cat.standItems.filter(
      (item) => checklistState[`${stand} — ${item}`]?.status !== "Good"
    ).length;

    const accordion = document.createElement("div");
    accordion.className = "stand-accordion";
    accordion.id = "acc_" + stand.replace(/\s+/g, "_");

    const hasIssue = standIssues > 0;
    accordion.innerHTML = `
      <div class="stand-header" onclick="toggleAccordion('${stand}')">
        <span class="stand-icon">${stand.includes("Helipad") ? "🚁" : "🅿️"}</span>
        <span class="stand-name">${stand}</span>
        <div style="display:flex;align-items:center;gap:6px;margin-left:auto">
          ${hasIssue ? `<span class="cat-count" style="color:#f59e0b;border-color:rgba(245,158,11,0.3)">${standIssues} isu</span>` : `<span class="cat-count text-green">✓</span>`}
          <span class="stand-arrow" id="arrow_${stand.replace(/\s+/g, "_")}">▼</span>
        </div>
      </div>
      <div class="stand-body" id="body_${stand.replace(/\s+/g, "_")}" style="display:none">
        ${cat.standItems
          .map((item) => {
            const key = `${stand} — ${item}`;
            return buildCheckItemHTML(key, item);
          })
          .join("")}
      </div>
    `;

    section.appendChild(accordion);
  });

  container.appendChild(section);
}

// Toggle accordion stand
function toggleAccordion(stand) {
  const bodyId = "body_" + stand.replace(/\s+/g, "_");
  const arrowId = "arrow_" + stand.replace(/\s+/g, "_");
  const body = document.getElementById(bodyId);
  const arrow = document.getElementById(arrowId);
  if (body.style.display === "none") {
    body.style.display = "block";
    arrow.textContent = "▲";
  } else {
    body.style.display = "none";
    arrow.textContent = "▼";
  }
}

// Build category header HTML
function buildCatHeader(label, total, issues) {
  return `
    <div class="cat-header">
      <span class="cat-label">${label}</span>
      <div class="cat-line"></div>
      ${issues > 0 ? `<span class="cat-count" style="color:#f59e0b;border-color:rgba(245,158,11,0.3)">${issues} isu</span>` : ""}
      <span class="cat-count">${total} item</span>
    </div>
  `;
}

// Build checklist item sebagai DOM element
function buildCheckItem(key, displayName) {
  const el = document.createElement("div");
  el.outerHTML; // placeholder
  const wrapper = document.createElement("div");
  wrapper.innerHTML = buildCheckItemHTML(key, displayName);
  return wrapper.firstElementChild;
}

// Build checklist item sebagai HTML string
function buildCheckItemHTML(key, displayName) {
  const state = checklistState[key] || { status: "Good", note: "", photos: [] };
  const isIssue = state.status !== "Good";
  const safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");

  const pillsHTML = ["Good", "Needs Attention", "Damaged"]
    .map(
      (s) => `
      <div class="status-pill" onclick="setItemStatus('${key}','${s}')"
        style="background:${state.status === s ? STATUS_COLORS[s] : "var(--bg3)"};
               color:${state.status === s ? "#000" : STATUS_COLORS[s]};
               border-color:${state.status === s ? STATUS_COLORS[s] : STATUS_COLORS[s] + "44"}">
        ${STATUS_ICON[s]}
      </div>`
    )
    .join("");

  const bodyHTML = isIssue
    ? `
    <div class="check-item-body">
      <div class="field">
        <label class="lbl">Catatan</label>
        <textarea placeholder="Deskripsi kondisi..." style="min-height:60px"
          onchange="setItemNote('${key}',this.value)">${state.note}</textarea>
      </div>
      <div class="field">
        <label class="lbl">Foto ${state.status === "Damaged" ? "(Wajib)" : "(Opsional)"}</label>
        <div class="photo-upload-area" onclick="document.getElementById('pi_${safeKey}').click()">
          <div class="photo-upload-icon">📷</div>
          <div class="photo-upload-text">Tambah foto</div>
        </div>
        <input type="file" id="pi_${safeKey}" accept="image/*" multiple
          onchange="handleItemPhotos('${key}',event)" style="display:none" />
        <div class="photo-grid" id="pg_${safeKey}">
          ${renderPhotosHTML(state.photos, key)}
        </div>
      </div>
    </div>`
    : "";

  return `
    <div class="check-item" id="ci_${safeKey}"
      style="${isIssue ? `border-color:${STATUS_COLORS[state.status]};background:${STATUS_BG[state.status]}` : ""}">
      <div class="check-item-header">
        <span class="check-item-name">${displayName}</span>
        <div class="status-pills">${pillsHTML}</div>
      </div>
      ${bodyHTML}
    </div>`;
}

// Render foto grid sebagai HTML string
function renderPhotosHTML(photos, key) {
  return photos
    .map(
      (p, i) => `
      <div class="photo-thumb">
        <img src="${p.url}" alt="${p.name}" />
        <button class="photo-del" onclick="removeItemPhoto('${key}',${i})">×</button>
      </div>`
    )
    .join("");
}

// Set status item dan rebuild
function setItemStatus(key, status) {
  if (!checklistState[key]) return;
  checklistState[key].status = status;
  buildChecklist();
}

// Set catatan item
function setItemNote(key, note) {
  if (!checklistState[key]) return;
  checklistState[key].note = note;
}

// Handle upload foto item
function handleItemPhotos(key, e) {
  const files = Array.from(e.target.files);
  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      checklistState[key].photos.push({ name: file.name, url: ev.target.result });
      const safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");
      const grid = document.getElementById("pg_" + safeKey);
      if (grid) grid.innerHTML = renderPhotosHTML(checklistState[key].photos, key);
    };
    reader.readAsDataURL(file);
  });
  e.target.value = "";
}

// Hapus foto item
function removeItemPhoto(key, idx) {
  checklistState[key].photos.splice(idx, 1);
  const safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");
  const grid = document.getElementById("pg_" + safeKey);
  if (grid) grid.innerHTML = renderPhotosHTML(checklistState[key].photos, key);
}
