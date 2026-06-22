// ============================================================
// checklist.js — Logika dan rendering checklist inspeksi
// ============================================================

var checklistState = {};

// Item khusus yang punya sub-unit checkbox
var SPECIAL_UNITS = {
  "Aviobridge": {
    label: "Garbarata",
    units: ["Garbarata 01", "Garbarata 02", "Garbarata 03", "Garbarata 04"]
  },
  "ADGS": {
    label: "Parking Stand",
    units: ["Parking Stand 02", "Parking Stand 03"]
  },
  "Flood Light": {
    label: "Floodlight",
    units: ["Floodlight 01", "Floodlight 02", "Floodlight 03", "Floodlight 04", "Floodlight 05", "Floodlight 06", "Floodlight 07"]
  }
};

function buildChecklistState() {
  checklistState = {};
  CHECKLIST_DATA.forEach(function(cat) {
    cat.items.forEach(function(item) {
      checklistState[item] = {
        status: "M",
        note: "",
        photos: [],
        units: [] // untuk item khusus (Aviobridge, ADGS, Flood Light)
      };
    });
  });
}

function getChecklistStats() {
  var all = Object.values(checklistState);
  var total = all.length;
  var m = all.filter(function(v) { return v.status === "M"; }).length;
  var tm = all.filter(function(v) { return v.status === "TM"; }).length;
  var score = Math.round((m / total) * 100);
  return { total: total, m: m, tm: tm, score: score };
}

function updateStats() {
  var stats = getChecklistStats();
  document.getElementById("statGood").textContent = stats.m;
  document.getElementById("statDmgd").textContent = stats.tm;
  document.getElementById("statScore").textContent = stats.score + "%";
  document.getElementById("progressFill").style.width = stats.score + "%";
}

function buildChecklist() {
  var container = document.getElementById("checklistContainer");
  container.innerHTML = "";
  CHECKLIST_DATA.forEach(function(cat) {
    var section = document.createElement("div");
    section.className = "section-mb";
    var issues = cat.items.filter(function(item) {
      return checklistState[item] && checklistState[item].status === "TM";
    }).length;
    section.innerHTML = buildCatHeader(cat.category, cat.items.length, issues);
    cat.items.forEach(function(item) {
      section.innerHTML += buildCheckItemHTML(item, item);
    });
    container.appendChild(section);
  });
  updateStats();
}

function buildCatHeader(label, total, issues) {
  return '<div class="cat-header">' +
    '<span class="cat-label">' + label + '</span>' +
    '<div class="cat-line"></div>' +
    (issues > 0 ? '<span class="cat-count" style="color:#ef4444;border-color:rgba(239,68,68,0.3)">' + issues + ' TM</span>' : '') +
    '<span class="cat-count">' + total + ' item</span>' +
    '</div>';
}

function buildCheckItemHTML(key, displayName) {
  var state = checklistState[key] || { status: "M", note: "", photos: [], units: [] };
  var isTM = state.status === "TM";
  var safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");
  var isSpecial = SPECIAL_UNITS[key] !== undefined;

  var pillsHTML = ["M", "TM"].map(function(s) {
    return '<div class="status-pill" onclick="setItemStatus(\'' + key + '\',\'' + s + '\')"' +
      ' style="background:' + (state.status === s ? STATUS_COLORS[s] : "var(--bg3)") + ';' +
      'color:' + (state.status === s ? "#fff" : STATUS_COLORS[s]) + ';' +
      'border-color:' + STATUS_COLORS[s] + '44;' +
      'width:40px;height:32px;border-radius:6px;font-size:13px;font-weight:800;">' +
      s + '</div>';
  }).join("");

  var bodyHTML = "";
  if (isTM) {
    // Checkbox unit khusus untuk Aviobridge, ADGS, Flood Light
    var unitsHTML = "";
    if (isSpecial) {
      var specialData = SPECIAL_UNITS[key];
      unitsHTML = '<div class="field">' +
        '<label class="lbl">' + specialData.label + ' yang TM</label>' +
        '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;margin-top:4px">';
      specialData.units.forEach(function(unit) {
        var checked = state.units && state.units.indexOf(unit) > -1;
        unitsHTML += '<label style="display:flex;align-items:center;gap:6px;padding:6px 8px;' +
          'background:' + (checked ? 'rgba(239,68,68,0.15)' : 'var(--bg3)') + ';' +
          'border:1px solid ' + (checked ? 'rgba(239,68,68,0.4)' : 'var(--border)') + ';' +
          'border-radius:6px;cursor:pointer;font-size:12px;">' +
          '<input type="checkbox" ' + (checked ? 'checked' : '') + ' ' +
          'onchange="toggleUnit(\'' + key + '\',\'' + unit + '\',this.checked)" ' +
          'style="accent-color:#ef4444;width:14px;height:14px;" />' +
          unit + '</label>';
      });
      unitsHTML += '</div></div>';
    }

    bodyHTML = '<div class="check-item-body">' +
      unitsHTML +
      '<div class="field">' +
      '<label class="lbl">Keterangan / Temuan</label>' +
      '<textarea placeholder="Deskripsi kondisi..." style="min-height:60px"' +
      ' onchange="setItemNote(\'' + key + '\',this.value)">' + (state.note || "") + '</textarea>' +
      '</div>' +
      '<div class="field">' +
      '<label class="lbl">Foto (Opsional)</label>' +
      '<div class="photo-upload-area" onclick="document.getElementById(\'pi_' + safeKey + '\').click()">' +
      '<div class="photo-upload-icon">📷</div>' +
      '<div class="photo-upload-text">Tambah foto</div>' +
      '</div>' +
      '<input type="file" id="pi_' + safeKey + '" accept="image/*" multiple' +
      ' onchange="handleItemPhotos(\'' + key + '\',event)" style="display:none" />' +
      '<div class="photo-grid" id="pg_' + safeKey + '">' +
      renderPhotosHTML(state.photos || [], key) +
      '</div>' +
      '</div>' +
      '</div>';
  }

  return '<div class="check-item" id="ci_' + safeKey + '"' +
    ' style="' + (isTM ? 'border-color:' + STATUS_COLORS.TM + ';background:' + STATUS_BG.TM : '') + '">' +
    '<div class="check-item-header">' +
    '<span class="check-item-name">' + displayName + '</span>' +
    '<div class="status-pills">' + pillsHTML + '</div>' +
    '</div>' +
    bodyHTML +
    '</div>';
}

function renderPhotosHTML(photos, key) {
  return (photos || []).map(function(p, i) {
    return '<div class="photo-thumb">' +
      '<img src="' + p.url + '" alt="' + p.name + '" />' +
      '<button class="photo-del" onclick="removeItemPhoto(\'' + key + '\',' + i + ')">×</button>' +
      '</div>';
  }).join("");
}

function setItemStatus(key, status) {
  if (!checklistState[key]) return;
  checklistState[key].status = status;
  if (status === "M") {
    checklistState[key].units = [];
  }
  buildChecklist();
}

function setItemNote(key, note) {
  if (!checklistState[key]) return;
  checklistState[key].note = note;
}

function toggleUnit(key, unit, checked) {
  if (!checklistState[key]) return;
  if (!checklistState[key].units) checklistState[key].units = [];
  var idx = checklistState[key].units.indexOf(unit);
  if (checked && idx === -1) {
    checklistState[key].units.push(unit);
  } else if (!checked && idx > -1) {
    checklistState[key].units.splice(idx, 1);
  }
}

function handleItemPhotos(key, e) {
  var files = Array.from(e.target.files);
  files.forEach(function(file) {
    var reader = new FileReader();
    reader.onload = function(ev) {
      if (!checklistState[key].photos) checklistState[key].photos = [];
      checklistState[key].photos.push({ name: file.name, url: ev.target.result });
      var safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");
      var grid = document.getElementById("pg_" + safeKey);
      if (grid) grid.innerHTML = renderPhotosHTML(checklistState[key].photos, key);
    };
    reader.readAsDataURL(file);
  });
  e.target.value = "";
}

function removeItemPhoto(key, idx) {
  if (!checklistState[key] || !checklistState[key].photos) return;
  checklistState[key].photos.splice(idx, 1);
  var safeKey = key.replace(/[^a-zA-Z0-9]/g, "_");
  var grid = document.getElementById("pg_" + safeKey);
  if (grid) grid.innerHTML = renderPhotosHTML(checklistState[key].photos, key);
}

// Helper untuk WA — dapatkan status unit khusus
function getUnitStatus(key) {
  var state = checklistState[key];
  if (!state || state.status === "M") return null;

  var specialData = SPECIAL_UNITS[key];
  if (!specialData) return { status: "TM", note: state.note };

  var tmUnits = state.units || [];
  var allUnits = specialData.units;

  if (tmUnits.length === 0) {
    return { status: "TM", units: allUnits, note: state.note };
  }

  var result = {};
  allUnits.forEach(function(unit) {
    result[unit] = tmUnits.indexOf(unit) > -1 ? "TM" : "M";
  });
  return { status: "TM", unitDetail: result, note: state.note };
}
