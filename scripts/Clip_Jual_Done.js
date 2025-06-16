(function () {
  const data = [];

  // Loop semua saham
  document.querySelectorAll("div.card[data-code]").forEach(card => {
    const kode = card.getAttribute("data-code");

    // Ambil semua blok order: baris 1 = beli, baris 2 = jual
    const orderBlocks = card.querySelectorAll("div.open-order.margin-top");

    // Ambil blok penjualan saja (blok kedua)
    const jualBlock = orderBlocks[1];
    if (!jualBlock) return;

    const rows = jualBlock.querySelectorAll(".row.padding-horizontal.margin-top-half.fsize-12");

    rows.forEach(row => {
      const cols = row.querySelectorAll(".col");
      if (cols.length >= 3) {
        const open = parseInt(cols[0].innerText.trim()) || 0;
        const done = parseInt(cols[1].innerText.trim()) || 0;
        const harga = parseFloat(cols[2].innerText.trim()) || 0;

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

    data.forEach(row => {
      lines.push(header.map(k => row[k]).join("\t"));
    });

    const text = lines.join("\n");
    navigator.clipboard.writeText(text)
      .then(() => console.log("📋 Data Jual disalin ke clipboard!"))
      .catch(err => console.warn("❌ Gagal salin ke clipboard:", err));
  }
})();
