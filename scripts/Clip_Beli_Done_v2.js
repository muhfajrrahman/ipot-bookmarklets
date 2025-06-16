(function () {
  const data = [];

  document.querySelectorAll("div.card[data-code]").forEach(card => {
    const kode = card.getAttribute("data-code");
    const beliBlok = card.querySelector(".container-ordersummary-b");
    if (!beliBlok) return;

    const rows = beliBlok.querySelectorAll(".row.align-items-center.margin-vertical-half");

    rows.forEach(row => {
      const cols = row.querySelectorAll(".col");
      if (cols.length >= 4) {
        const doneText = cols[1].innerText.trim();
        const hargaText = cols[3].innerText.trim();

        const done = parseInt(doneText.replace(/[^\d]/g, "")) || 0;
        const harga = parseFloat(hargaText.replace(/[^\d.]/g, "")) || 0;

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
