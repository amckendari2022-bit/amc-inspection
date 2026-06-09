// ============================================================
// signature.js — Logika tanda tangan digital
// ============================================================

let sigData = null;
let sigDrawing = false;

// Inisialisasi canvas tanda tangan
function initSigCanvas() {
  const canvas = document.getElementById("sigCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Set resolusi canvas (2x untuk layar retina/HiDPI)
  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }
  resizeCanvas();

  // Dapatkan posisi pointer/touch relatif terhadap canvas
  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  // Mouse events
  canvas.addEventListener("mousedown", (e) => {
    sigDrawing = true;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!sigDrawing) return;
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    onSigDrawn();
  });

  canvas.addEventListener("mouseup", () => {
    sigDrawing = false;
  });

  canvas.addEventListener("mouseleave", () => {
    sigDrawing = false;
  });

  // Touch events (untuk smartphone)
  canvas.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      sigDrawing = true;
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    },
    { passive: false }
  );

  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      if (!sigDrawing) return;
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      onSigDrawn();
    },
    { passive: false }
  );

  canvas.addEventListener("touchend", () => {
    sigDrawing = false;
  });
}

// Dipanggil saat tanda tangan digambar
function onSigDrawn() {
  sigData = document.getElementById("sigCanvas").toDataURL();
  document.getElementById("sigCanvas").classList.add("signed");
  document.getElementById("sigHint").style.display = "none";
  document.getElementById("sigOk").style.display = "inline";
}

// Hapus tanda tangan
function clearSig() {
  const canvas = document.getElementById("sigCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  sigData = null;
  canvas.classList.remove("signed");
  document.getElementById("sigHint").style.display = "block";
  document.getElementById("sigOk").style.display = "none";
}
