(async function () {
  try {
    const input = prompt("Masukkan kode saham (pisahkan dengan koma):", "BBCA,BBRI,GOOD");
    if (!input) return;

    const list = input
      .split(",")
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    const results = [];

    for (let kode of list) {
      // Delay antar fetch (500–1500ms)
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

      try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${kode}.JK?interval=1d&range=1d`);
        const json = await res.json();
        const d = json.chart.result[0];
        const q = d.indicators.quote[0];
        const ts = d.timestamp[0];

        results.push({
          kode,
          date: new Date(ts * 1000).toLocaleString("id-ID", { hour: '2-digit', minute: '2-digit' }),
          open: q.open[0],
          high: q.high[0],
          low: q.low[0],
          close: q.close[0],
          volume: (q.volume[0] / 100).toFixed(0) // convert to lot
        });

      } catch (e) {
        results.push({ kode, error: true });
      }
    }

    // Buat HTML isi tabel + tombol copy
    const html = `
      <html>
      <head>
        <title>Data OHLCV</title>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #999; padding: 8px; text-align: center; }
          th { background: #f0f0f0; }
          button { margin-top: 15px; padding: 8px 16px; font-size: 14px; }
        </style>
      </head>
      <body>
        <h2>📊 Data OHLCV Yahoo Finance</h2>
        <table id="ohlcv-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Waktu</th>
              <th>Open</th>
              <th>High</th>
              <th>Low</th>
              <th>Close</th>
              <th>Volume (lot)</th>
            </tr>
          </thead>
          <tbody>
            ${
              results.map(r => r.error
                ? `<tr><td colspan="7" style="color:red;">${r.kode}: gagal fetch</td></tr>`
                : `<tr>
                    <td>${r.kode}</td>
                    <td>${r.date}</td>
                    <td>${r.open}</td>
                    <td>${r.high}</td>
                    <td>${r.low}</td>
                    <td>${r.close}</td>
                    <td>${r.volume}</td>
                  </tr>`
              ).join("")
            }
          </tbody>
        </table>
        <button onclick="copyToClipboard()">📋 Copy to Clipboard</button>

        <script>
          function copyToClipboard() {
            const rows = document.querySelectorAll("#ohlcv-table tr");
            let text = "";
            rows.forEach(row => {
              const cols = row.querySelectorAll("th, td");
              const rowText = Array.from(cols).map(col => col.innerText).join("\\t");
              text += rowText + "\\n";
            });

            navigator.clipboard.writeText(text)
              .then(() => alert("✅ Tersalin ke clipboard!"))
              .catch(err => alert("❌ Gagal salin: " + err));
          }
        </script>
      </body>
      </html>
    `;

    // Tampilkan di tab baru
    const tab = window.open();
    tab.document.write(html);

  } catch (e) {
    alert("❌ Error: " + e.message);
  }
})();
