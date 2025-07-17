javascript: (async () => {
    try {
        const input = prompt("Kode saham (pisah koma):", "AVIA,AXIO,CAMP,CLEO,ELSA,ERAA,ESSA,FWCT,GOOD,HRTA,MLIA,MTEL,OMED,PSGO,ROTI,SIDO,SPMA,TPMA,UCID,ULTJ");
        if (!input) return;
        const list = input.split(",").map(s => s.trim().toUpperCase()).filter(Boolean),
            results = [];
        for (let kode of list) {
            await new Promise(r => setTimeout(r, Math.random() * 1000 + 500));
            try {
                const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${kode}.JK?interval=1d&range=1d`),
                    json = await res.json(),
                    d = json.chart.result[0],
                    q = d.indicators.quote[0],
                    ts = d.timestamp[0];
                results.push({
                    kode,
                    date: new Date(ts * 1e3).toLocaleString("id-ID", {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    open: q.open[0],
                    high: q.high[0],
                    low: q.low[0],
                    close: q.close[0],
                    volume: (q.volume[0] / 100).toFixed(0)
                })
            } catch (e) {
                results.push({
                    kode,
                    error: 1
                })
            }
        }
        const html = `<div id="ohlcv-popup" style="position:fixed;top:10%;left:50%;transform:translateX(-50%);background:#fff;border:1px solid #ccc;padding:20px;z-index:9999;font-family:sans-serif;box-shadow:0 0 15px #aaa"><h3>📊 Data OHLCV Yahoo Finance</h3><table border="1" cellspacing="0" cellpadding="5"><thead style="background:#f0f0f0"><tr><th>Kode</th><th>Waktu</th><th>Open</th><th>High</th><th>Low</th><th>Close</th><th>Volume (lot)</th></tr></thead><tbody>${results.map(r=>r.error?`<tr><td colspan="7" style="color:red;">${r.kode}: gagal fetch</td></tr>`:`<tr><td>${r.kode}</td><td>${r.date}</td><td>${r.open}</td><td>${r.high}</td><td>${r.low}</td><td>${r.close}</td><td>${r.volume}</td></tr>`).join("")}</tbody></table><div style="text-align:right;margin-top:10px;"><button onclick="document.getElementById('ohlcv-popup').remove()">❌ Tutup</button></div></div>`,
            box = document.createElement("div");
        box.innerHTML = html, document.body.appendChild(box)
    } catch (e) {
        alert("❌ Gagal: " + e.message)
    }
})();