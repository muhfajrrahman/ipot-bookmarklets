(function () {
  /* ===== Klik 1x = START, klik lagi = STOP ===== */
  var K = "__babaMon";
  if (window[K] && window[K].aktif) { window[K].stop(); return; }

  /* ===== Pengaturan ===== */
  var INTERVAL_DETIK = 30;   /* jeda scraping */
  var LOT_SAHAM = 100;       /* 1 lot = 100 lembar */
  var TUNGGU_DETIK = 3;      /* waktu tunggu setelah "memancing fokus" sebelum membaca angka */
  var AUDIO_HIDUP = true;    /* true = suara hampir tak terdengar agar tab dianggap "sedang memutar audio" */
  var ANTI_BLUR = true;      /* true = halaman tidak diberi tahu saat jendela kehilangan fokus */

  var S = window[K] = {
    aktif: true, timer: null, worker: null, ticks: [], last: null, log: [], ctx: null, badge: null
  };

  var pad = function (n) { return String(n).padStart(2, "0"); };
  var jam = function () {
    var d = new Date();
    return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  };
  var rp = function (n) { return (n < 0 ? "-" : "") + "Rp " + Math.abs(Math.round(n)).toLocaleString("id-ID"); };

  /* ===== 1. FUNGSI SCRAPING: total Done Beli & Jual ===== */
  function scrape() {
    var r = { lotB: 0, lotJ: 0, nilB: 0, nilJ: 0 };
    /* penanda halaman: blok Order Summary hanya ada di halaman yang benar */
    r.ada = document.querySelectorAll(".container-ordersummary-b, .container-ordersummary-s").length > 0;

    document.querySelectorAll(".container-ordersummary-b").forEach(function (blok) {
      blok.querySelectorAll(".row").forEach(function (row) {
        if (row.classList.contains("border-top")) return;
        var cols = row.querySelectorAll(".col-25.value-ordersummary");
        if (cols.length >= 4) {
          var done = parseInt(cols[1].innerText.replace(/[^\d]/g, "")) || 0;
          var harga = parseFloat(cols[3].innerText.replace(/[^\d.]/g, "")) || 0;
          r.lotB += done;
          r.nilB += done * LOT_SAHAM * harga;
        }
      });
    });

    document.querySelectorAll(".container-ordersummary-s").forEach(function (blok) {
      blok.querySelectorAll(".row").forEach(function (row) {
        if (row.classList.contains("border-top")) return;
        var cols = row.querySelectorAll(".col-25.value-ordersummary");
        if (cols.length >= 4) {
          var harga = parseFloat(cols[0].innerText.replace(/[^\d.]/g, "")) || 0;
          var done = parseInt(cols[2].innerText.replace(/[^\d]/g, "")) || 0;
          r.lotJ += done;
          r.nilJ += done * LOT_SAHAM * harga;
        }
      });
    });

    /* ===== 2. KALKULASI: Net Done = Jual - Beli ===== */
    r.net = r.nilJ - r.nilB;
    r.netLot = r.lotJ - r.lotB;
    return r;
  }

  /* ===== 4. ALARM: beep ===== */
  function beep(nada, kali) {
    try {
      if (!S.ctx) S.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (S.ctx.state === "suspended") S.ctx.resume();
      for (var i = 0; i < kali; i++) {
        var o = S.ctx.createOscillator(), g = S.ctx.createGain();
        o.frequency.value = nada;
        o.connect(g); g.connect(S.ctx.destination);
        var t0 = S.ctx.currentTime + i * 0.35;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.4, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.25);
        o.start(t0); o.stop(t0 + 0.3);
      }
    } catch (e) { console.warn("Beep gagal:", e); }
  }

  /* ===== 5. NOTIFIKASI WINDOWS ===== */
  function notif(judul, isi) {
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(judul, { body: isi, requireInteraction: true });
      }
    } catch (e) { console.warn("Notifikasi gagal:", e); }
  }

  /* ===== 6. LOG ===== */
  function catat(teks) {
    var baris = "[" + jam() + "] " + teks;
    S.log.push(baris);
    console.log("%cMonitoring Done: " + baris, "color:#0a7");
  }

  function badge(teks) {
    if (S.badge) S.badge.textContent = teks;
  }

  /* ===== PANCING FOKUS: halaman dibuat "merasa" sedang aktif ===== */
  function pancingFokus() {
    try { window.dispatchEvent(new Event("focus")); } catch (e) {}
    try { document.dispatchEvent(new Event("focus")); } catch (e) {}
    try { document.dispatchEvent(new Event("visibilitychange")); } catch (e) {}
  }

  function cek() {
    pancingFokus();
    S.ticks.push(jam());
    if (S.ticks.length > 200) S.ticks.shift();
    if (S.worker) S.worker.postMessage(TUNGGU_DETIK * 1000);
    else setTimeout(function () { if (S.aktif) proses(); }, TUNGGU_DETIK * 1000);
  }

  /* ===== PEMICU WAKTU DI WEB WORKER (tidak ikut ditidurkan browser seperti timer biasa) ===== */
  function mulaiPemicu() {
    var ms = INTERVAL_DETIK * 1000;
    var kode = "setInterval(function(){postMessage('tick')}," + ms + ");" +
               "onmessage=function(e){setTimeout(function(){postMessage('baca')},e.data)};";
    try {
      var url = URL.createObjectURL(new Blob([kode], { type: "application/javascript" }));
      S.worker = new Worker(url);
      S.worker.onmessage = function (e) {
        if (!S.aktif) return;
        if (e.data === "tick") cek(); else if (e.data === "baca") proses();
      };
      S.worker.onerror = function () {
        S.worker = null;
        if (!S.timer) S.timer = setInterval(cek, ms);
        catat("Worker diblokir situs, pakai timer biasa (bisa ikut tertidur)");
      };
      catat("Pemicu waktu: Web Worker");
    } catch (e) {
      S.worker = null;
      S.timer = setInterval(cek, ms);
      catat("Worker gagal dibuat, pakai timer biasa (bisa ikut tertidur)");
    }
  }

  /* ===== SUARA HAMPIR SENYAP: tab yang "memutar audio" tidak ditidurkan ===== */
  function suaraHidup() {
    if (!AUDIO_HIDUP) return;
    try {
      if (!S.ctx) S.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (S.ctx.state === "suspended") S.ctx.resume();
      var o = S.ctx.createOscillator(), g = S.ctx.createGain();
      o.frequency.value = 40;
      g.gain.value = 0.001;
      o.connect(g); g.connect(S.ctx.destination);
      o.start();
    } catch (e) { console.warn("Suara hidup gagal:", e); }
  }

  /* ===== 3. MEMORY + 4. COMPARE ===== */
  function proses() {
    var n = scrape();
    var kunci = [n.lotB, n.lotJ, n.nilB, n.nilJ].join("|");

    /* A. Bukan di halaman Order Summary -> abaikan total, memori tidak disentuh */
    if (!n.ada) {
      if (!S.diLuar) { S.diLuar = true; catat("Di luar halaman Order Summary, pembacaan dilewati"); }
      badge("● Monitoring ON | menunggu halaman Order Summary | cek " + jam() + " (klik = stop)");
      return;
    }
    if (S.diLuar) { S.diLuar = false; catat("Kembali di halaman Order Summary"); }

    if (S.last === null) {
      S.last = { kunci: kunci, data: n };
      catat("Baseline -> Beli " + n.lotB + " lot, Jual " + n.lotJ + " lot, Net " + rp(n.net));
      badge("● Monitoring Done ON | Net " + rp(n.net) + " | cek " + jam() + " (klik = stop)");
      return;
    }

    var p = S.last.data;

    /* B. Angka Done tidak mungkin turun di hari yang sama. Kalau turun: bisa halaman
       belum selesai dimuat, atau ganti hari. Tunggu 2x pembacaan berturut-turut,
       lalu patokan direset diam-diam (tanpa alarm). */
    if (n.lotB < p.lotB || n.lotJ < p.lotJ) {
      S.turun = (S.turun || 0) + 1;
      if (S.turun >= 2) {
        S.last = { kunci: kunci, data: n };
        S.turun = 0;
        catat("Angka turun 2x berturut-turut, patokan direset tanpa alarm -> Net " + rp(n.net));
      } else {
        catat("Angka turun (kemungkinan halaman belum termuat), diabaikan sementara");
      }
      badge("● Monitoring Done ON | Net " + rp(p.net) + " | cek " + jam() + " (klik = stop)");
      return;
    }
    S.turun = 0;

    if (kunci !== S.last.kunci) {
      var dB = n.lotB - p.lotB, dJ = n.lotJ - p.lotJ;
      var bagian = [];
      if (dB !== 0) bagian.push("Beli " + (dB > 0 ? "+" : "") + dB + " lot");
      if (dJ !== 0) bagian.push("Jual " + (dJ > 0 ? "+" : "") + dJ + " lot");
      if (!bagian.length) bagian.push("Harga done berubah");
      var ringkas = bagian.join(", ") + " | Net " + rp(p.net) + " -> " + rp(n.net);

      catat("BERUBAH: " + ringkas);
      /* nada rendah = ada beli, nada tinggi = ada jual */
      if (dB !== 0 && dJ === 0) beep(600, 2);
      else if (dJ !== 0 && dB === 0) beep(1000, 2);
      else beep(800, 3);
      notif("Done berubah", ringkas);

      S.last = { kunci: kunci, data: n };
    }
    badge("● Monitoring Done ON | Net " + rp(n.net) + " | cek " + jam() + " (klik = stop)");
  }

  /* ===== 9. START / STOP ===== */
  S.stop = function () {
    S.aktif = false;
    clearInterval(S.timer);
    try { if (S.worker) S.worker.terminate(); } catch (e) {}
    try { window.removeEventListener("blur", S.blok, true); } catch (e) {}
    try { delete document.hasFocus; delete document.hidden; delete document.visibilityState; } catch (e) {}
    if (S.badge) S.badge.remove();
    if (S.ctx) { try { S.ctx.close(); } catch (e) {} }
    catat("Monitoring DIHENTIKAN");
    beep = function () {};
  };

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  /* ===== TOPENG FOKUS: halaman selalu melapor "saya aktif & terlihat" ===== */
  S.blok = function (e) { if (e.target === window) e.stopImmediatePropagation(); };
  try {
    Object.defineProperty(document, "hasFocus", { value: function () { return true; }, configurable: true });
    Object.defineProperty(document, "hidden", { get: function () { return false; }, configurable: true });
    Object.defineProperty(document, "visibilityState", { get: function () { return "visible"; }, configurable: true });
  } catch (e) { console.warn("Topeng fokus gagal:", e); }
  if (ANTI_BLUR) window.addEventListener("blur", S.blok, true);

  var b = document.createElement("div");
  b.style.cssText = "position:fixed;right:10px;bottom:10px;z-index:2147483647;background:#0a5;color:#fff;" +
    "font:12px Arial;padding:6px 10px;border-radius:6px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.4)";
  b.onclick = function () { S.stop(); };
  document.body.appendChild(b);
  S.badge = b;

  /* bunyi pendek tanda monitoring aktif (sekaligus "membangunkan" suara browser) */
  beep(800, 1);
  catat("Monitoring DIMULAI, interval " + INTERVAL_DETIK + " detik");
  suaraHidup();
  cek();
  mulaiPemicu();
})();
