(function () {
  const data = [];

  document.querySelectorAll(".container-ordersummary-b").forEach(blok => {
    // Cari kode saham dari span.ob-sec sebelumnya (ke atas)
    const kodeSpan = blok.closest(".margin-vertical")?.previousElementSibling?.querySelector("span.ob-sec");
    const kode = kodeSpan?.innerText.trim() || "(?)";

    // Loop baris data
    blok.querySelectorAll(".row").forEach(row => {
      const cols = row.querySelectorAll(".col-25.value-ordersummary");
      if (cols.length >= 4) {
        const done = parseInt(cols[1].innerText.replace(/[^\d]/g, "")) || 0;
        const harga = parseFloat(cols[3].innerText.replace(/[^\d.]/g, "")) || 0;

        if (done > 0) {
          data.push({
            "Kode Dibeli": kode,
            "Beli_Done_Lot": done,
            "Beli_Done_Harga": harga
          });
        }
      }
    });
  });

  console.clear();
  console.log("📥 Data Pembelian DONE:");
  console.table(data);

  if (data.length) {
    const header = Object.keys(data[0]);
    const lines = [header.join("\t")];
    data.forEach(row => lines.push(header.map(k => row[k]).join("\t")));
    navigator.clipboard.writeText(lines.join("\n"))
      .then(() => console.log("📋 Data Beli disalin ke clipboard!"))
      .catch(err => console.warn("❌ Gagal salin ke clipboard:", err));
  }
})();
