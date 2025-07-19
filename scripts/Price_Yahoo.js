(async function () {
  try {
    const input = prompt("Masukkan kode saham (pisahkan dengan koma):", "AVIA,AXIO,CAMP,CLEO,ELSA,ERAA,ESSA,FWCT,GOOD,HRTA,MLIA,MTEL,OMED,PSGO,ROTI,SIDO,SPMA,TPMA,UCID,ULTJ");
    if (!input) return;

    const list = input
      .split(",")
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    const results = [];

    // Tampilkan indikator loading
    let loadingDiv = document.createElement("div");
    loadingDiv.id = "ohlcv-loading";
    loadingDiv.style = "font-family:sans-serif;padding:10px;color:#444;background:#ffffe0;border:1px solid #ccc;margin-top:10px;";
    loadingDiv.innerText = "⏳ Memuat data saham, mohon tunggu...";
    document.body.appendChild(loadingDiv);

    for (let kode of list) {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

      try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${kode}.JK?interval=1d&range=1d`);
        const json = await res.json();
        const d = json.chart.result[0];
        const q = d.indicators.quote[0];
        const ts = d.timestamp[0];

        const waktu = new Date(ts * 1000);
        const tanggal = waktu.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
        const jam = waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

        results.push({
          kode,
          date: `${tanggal} ${jam}`,
          open: q.open[0],
          high: q.high[0],
          low: q.low[0],
          close: q.close[0],
          volume: (q.volume[0] / 100).toFixed(0)
        });

      } catch {
        results.push({ kode, error: true });
      }
    }

    // Hapus loading
    const existing = document.getElementById("ohlcv-loading");
    if (existing) existing.remove();

    // Hapus hasil sebelumnya jika ada
    const oldResult = document.getElementById("ohlcv-result");
    if (oldResult) oldResult.remove();

    // Buat HTML tabel hasil
    const container = document.createElement("div");
    container.id = "ohlcv-result";
    container.innerHTML = `
      <style>
        #ohlcv-result { font-family: sans-serif; margin-top: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { border: 1px solid #999; padding: 8px; text-align: center; }
        th { background: #f0f0f0; }
      </style>
      <h2>📊 Data OHLCV Yahoo Finance</h2>
      <table id="ohlcv-table">
        <thead>
          <tr>
            <th>Kode</th><th>Waktu</th><th>Open</th><th>High</th><th>Low</th><th>Close</th><th>Volume (lot)</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => r.error
            ? `<tr><td colspan="7" style="color:red;">${r.kode}: gagal fetch</td></tr>`
            : `<tr><td>${r.kode}</td><td>${r.date}</td><td>${r.open}</td><td>${r.high}</td><td>${r.low}</td><td>${r.close}</td><td>${r.volume}</td></tr>`
          ).join("")}
        </tbody>
      </table>
    `;
    document.body.appendChild(container);

    // ⏱️ Salin otomatis ke clipboard
    const rows = document.querySelectorAll("#ohlcv-table tr");
    let text = "";
    rows.forEach(row => {
      const cols = row.querySelectorAll("th, td");
      const rowText = Array.from(cols).map(col => col.innerText).join("\t");
      text += rowText + "\n";
    });

    await navigator.clipboard.writeText(text);
    alert("✅ Data otomatis disalin ke clipboard!");

  } catch (e) {
    alert("❌ Gagal: " + e.message);
  }
})();
