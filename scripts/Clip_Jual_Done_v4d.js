(function () {
  const data = [];

  // Safe alert via iframe
  const safeAlert = (msg) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    iframe.contentWindow.alert(msg);
    iframe.remove();
  };

  document.querySelectorAll(".container-ordersummary-s").forEach(blok => {
    const kodeSpan = blok.closest(".margin-vertical")?.previousElementSibling?.querySelector("span.ob-sec");
    const kode = kodeSpan?.innerText.trim() || "(?)";

    blok.querySelectorAll(".row").forEach(row => {
      if (row.classList.contains("border-top")) return;

      const cols = row.querySelectorAll(".col-25.value-ordersummary");
      if (cols.length >= 4) {
        const harga = parseFloat(cols[0].innerText.replace(/[^\d.]/g, "")) || 0;
        const done = parseInt(cols[2].innerText.replace(/[^\d]/g, "")) || 0;

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
      .then(() => {
        console.log("📋 Data Jual disalin ke clipboard!");
        safeAlert(`Data disalin ke clipboard, sebanyak ${data.length} baris`);
      })
      .catch(err => {
        console.warn("❌ Gagal salin ke clipboard:", err);
        safeAlert("❌ Gagal salin ke clipboard!");
      });
  } else {
    safeAlert("Tidak ada data ditemukan! Mungkin halaman belum memuat transaksi.");
  }
})();
