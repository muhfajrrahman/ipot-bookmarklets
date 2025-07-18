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

    // Hapus indikator loading
    const existing = document.getElementById("ohlcv-loading");
    if (existing) existing.remove();

    // Hapus hasil sebelumnya jika ada
    const oldResult = document.getElementById("ohlcv-result");
    if (oldResult) oldResult.remove();

    // Buat elemen hasil
    const container = document.createElement("div");
    container.id = "ohlcv-result";
    container.innerHTML = `
      <style>
        #ohlcv-result { font-family: sans-serif; margin-top: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
