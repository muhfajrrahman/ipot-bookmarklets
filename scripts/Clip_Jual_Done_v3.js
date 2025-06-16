(function () {
  const data = [];

  document.querySelectorAll("span.ob-sec").forEach(span => {
    const kode = span.innerText.trim();
    const blok = span.closest(".margin-md");
    const jualBlok = blok?.querySelector(".container-ordersummary-s");
    if (!jualBlok) return;

    jualBlok.querySelectorAll(".row").forEach(row => {
      const cols = row.querySelectorAll(".col-25.value-ordersummary");
      if (cols.length >= 4) {
        const hargaText = cols[0].innerText.trim();
        const doneText = cols[2].innerText.trim();

        const harga = parseFloat(hargaText.replace(/[^\d.]/g, "")) || 0;
        const done = parseInt(doneText.replace(/[^\d]/g, "")) || 0;

        if (done > 0) {
          data.push({
            "Kode Dijual": kode,
            "Jual_Done_Lot": done,
            "Jual_Done_Harga": harga
          });
        }
      }
    });
  });

  console.clear();
  console.log("📤 Data Penjualan DONE:");
  console.table(data);

  if (data.length) {
    const header = Object.keys(data[0]);
    const lines = [header.join("\t")];
    data.forEach(row => lines.push(header.map(k => row[k]).join("\t")));
    navigator.clipboard.writeText(lines.join("\n"))
      .then(() => console.log("📋 Data Jual disalin ke clipboard!"))
      .catch(err => console.warn("❌ Gagal salin ke clipboard:", err));
  }
})();
