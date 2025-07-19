javascript:(async()=>{
  const input = prompt("Masukkan kode saham (pisahkan dengan koma):", "BBCA, BBRI, GOOD");
  if (!input) return;

  const list = input.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
  const results = [];

  const container = document.createElement("div");
  container.style = "position:fixed;top:0;left:0;width:100%;height:100%;overflow:auto;z-index:999999;background:white;padding:20px;font-family:sans-serif;";
  container.innerHTML = `<h2>📈 Data OHLCV Saham</h2><div id='status'>⏳ Memuat data...</div><div id='result'></div>`;
  document.body.appendChild(container);

  let counter = 0;
  const statusDiv = document.getElementById("status");
  const resultDiv = document.getElementById("result");

  for (let kode of list) {
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${kode}.JK?interval=1d&range=1d`;
      const res = await fetch(url);
      const json = await res.json();
      const d = json.chart.result[0];
      const q = d.indicators.quote[0];
      const ts = d.timestamp[0];

      const waktu = new Date(ts * 1000);
      const tanggal = waktu.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit" });
      const jam = waktu.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

      const open = q.open[0];
      const close = q.close[0];
      const high = q.high[0];
      const low = q.low[0];
      const volume = (q.volume[0] / 100).toFixed(0);

      results.push({
        kode,
        date: `${tanggal}-${jam}`,
        close,
        open,
        change: (close - open).toFixed(2),
        high,
        low,
        delta: (high - low).toFixed(2),
        volume
      });

      counter++;
      statusDiv.innerText = `✅ ${counter} data berhasil diambil...`;
    } catch {
      results.push({ kode, error: true });
    }
  }

  statusDiv.innerText = `✅ Proses selesai (${counter} data berhasil).`;

  const tableHTML = `
    <table id="ohlcv-table" border="1" cellspacing="0" cellpadding="5">
      <thead>
        <tr>
          <th>Kode</th><th>Waktu</th><th>Close</th><th>Open</th><th>+/-</th>
          <th>High</th><th>Low</th><th>Delta</th><th>Volume (lot)</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => r.error
          ? `<tr><td colspan="9" style="color:red;">${r.kode}: gagal fetch</td></tr>`
          : `<tr>
              <td>${r.kode}</td><td>${r.date}</td><td>${r.close}</td><td>${r.open}</td>
              <td>${r.change}</td><td>${r.high}</td><td>${r.low}</td><td>${r.delta}</td><td>${r.volume}</td>
            </tr>`
        ).join("")}
      </tbody>
    </table>
    <p><em>✅ Data otomatis disalin ke clipboard</em></p>
  `;
  resultDiv.innerHTML = tableHTML;

  const rows = container.querySelectorAll("#ohlcv-table tr");
  let text = "";
  rows.forEach(row => {
    const cols = row.querySelectorAll("th, td");
    const rowText = Array.from(cols).map(col => col.innerText).join("\t");
    text += rowText + "\n";
  });

  try {
    await navigator.clipboard.writeText(text);
    alert("✅ Data berhasil disalin ke clipboard!");
  } catch (e) {
    alert("❌ Gagal salin: " + e.message);
  }
})();
