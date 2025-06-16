(function () {
  const data = [];

  // Loop semua saham
  document.querySelectorAll("div.card[data-code]").forEach(card => {
    const kode = card.getAttribute("data-code");

    // Ambil semua blok order: baris 1 = beli, baris 2 = jual
    const orderBlocks = card.querySelectorAll("div.open-order.margin-top");

    // Ambil blok pembelian saja (blok pertama)
    const beliBlock = orderBlocks[0];
    if (!beliBlock) return;

    const rows = beliBlock.querySelectorAll(".row.padding-horizontal.margin-top-half.fsize-12");

    rows.forEach(row => {
      const cols = row.querySelectorAll(".col");
      if (cols.length >= 3) {
        const open = parseInt(cols[0].innerText.trim()) || 0;
        const done = parseInt(cols[1].innerText.trim()) || 0;
        const harga = parseFloat(cols[2].innerText.trim()) || 0;

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

    data.forEach(row => {
      lines.push(header.map(k => row[k]).join("\t"));
    });

    const text = lines.join("\n");
    navigator.clipboard.writeText(text)
      .then(() => console.log("📋 Data Beli disalin ke clipboard!"))
      .catch(err => console.warn("❌ Gagal salin ke clipboard:", err));
  }
})();
