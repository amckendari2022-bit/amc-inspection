// ============================================================
// checklist.js — Logika dan rendering checklist inspeksi
// ============================================================

let checklistState = {};

function buildChecklistState() {
checklistState = {};
CHECKLIST_DATA.forEach((cat) => {
cat.items.forEach((item) => {
checklistState[item] = { status: "M", note: "", photos: [] };
});
});
}

function getChecklistStats() {
const all = Object.values(checklistState);
const total = all.length;
const m = all.filter((v) => v.status === "M").length;
const tm = all.filter((v) => v.status === "TM").length;
const score = Math.round((m / total) * 100);
return { total, m, tm, score };
}

function updateStats() {
const { m, tm, score } = getChecklistStats();
document.getElementById("statGood").textContent = m;
document.getElementById("statDmgd").textContent = tm;
document.getElementById("statScore").textContent = score + "%";
document.getElementById("progressFill").style.width = score + "%";
}

function buildChecklist() {
const container = document.getElementById("checklistContainer");
container.innerHTML = "";
CHECKLIST_DATA.forEach((cat) => {
const section = document.createElement("div");
section.className = "section-mb";
const issues = cat.items.filter(
(item) => checklistState[item]?.status === "TM"
).length;
section.innerHTML = buildCatHeader(cat.category, cat.items.length, issues);
cat.items.forEach((item) => {
section.innerHTML += buildCheckItemHTML(item, item);
});
container.appendChild(section);
});
updateStats();
}

function buildCatHeader(label, total, issues) {
return `
<div class="cat-header">
<span class="cat-label">${label}</span>
<div class="cat-line"></div>
${issues > 0 ? `<span class="cat-count" style="color:#ef4444;border-color:rgba(239,68,68,0.3)">${issues} TM</span>` : ""}
<span class="cat-count">${total} item</span>
</div>`;
}

function buildCheckItemHTML(key, displayName) {
const state = checklistState[key] || { status: "M", note: "", photos: [] };
const isTM = state.status === "TM";
const safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");

const pillsHTML = STATUSES.map((s) => `
<div class="status-pill" onclick="setItemStatus('${key}','${s}')"
style="background:${state.status === s ? STATUS_COLORS[s] : "var(--bg3)"};
color:${state.status === s ? "#fff" : STATUS_COLORS[s]};
border-color:${STATUS_COLORS[s]}44;
width:40px;height:32px;border-radius:6px;font-size:13px;font-weight:800;">
${s}
</div>`).join("");

const bodyHTML = isTM ? `
<div class="check-item-body">
<div class="field">
<label class="lbl">Keterangan / Temuan</label>
<textarea placeholder="Deskripsi kondisi..." style="min-height:60px"
onchange="setItemNote('${key}',this.value)">${state.note}</textarea>
</div>
<div class="field">
<label class="lbl">Foto (Opsional)</label>
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
</div>` : "";

return `
<div class="check-item" id="ci_${safeKey}"
style="${isTM ? `border-color:${STATUS_COLORS.TM};background:${STATUS_BG.TM}` : ""}">
<div class="check-item-header">
<span class="check-item-name">${displayName}</span>
<div class="status-pills">${pillsHTML}</div>
</div>
${bodyHTML}
</div>`;
}

function renderPhotosHTML(photos, key) {
return (photos || []).map((p, i) => `
<div class="photo-thumb">
<img src="${p.url}" alt="${p.name}" />
<button class="photo-del" onclick="removeItemPhoto('${key}',${i})">×</button>
</div>`).join("");
}

function setItemStatus(key, status) {
if (!checklistState[key]) return;
checklistState[key].status = status;
buildChecklist();
}

function setItemNote(key, note) {
if (!checklistState[key]) return;
checklistState[key].note = note;
}

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

function removeItemPhoto(key, idx) {
checklistState[key].photos.splice(idx, 1);
const safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");
const grid = document.getElementById("pg_" + safeKey);
if (grid) grid.innerHTML = renderPhotosHTML(checklistState[key].photos, key);
}
