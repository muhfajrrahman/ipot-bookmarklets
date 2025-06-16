(function () {
  const data = [];

  // Telusuri setiap blok saham
  document.querySelectorAll("div.mt-50").forEach(blok => {
    const kodeEl = blok.querySelector("span.ob-sec");
    const kode = kodeEl ? kodeEl.innerText.trim() : "(tidak ditemukan)";

    let beli = "(?)";
    let jual = "(?)";

    // Telusuri semua label 'Nilai Terpasang' di dalam blok
    blok.querySelectorAll(".label-orderstatus").forEach(label => {
      const teks = label.innerText.trim();
      const nilai = label.nextElementSibling?.innerText.trim();

      // Tentukan apakah ini bagian Beli atau Jual
      const kolom = label.closest(".col");
      const judul = kolom?.querySelector(".title-orderstatus")?.innerText.trim();

      if (teks === "Nilai Terpasang") {
        if (judul === "Pembelian") {
          beli = nilai || beli;
        } else if (judul === "Penjualan") {
          jual = nilai || jual;
        }
      }
    });

    data.push({
      "Kode Saham": kode,
      "Nilai Terpasang Beli": beli,
      "Nilai Terpasang Jual": jual
    });
  });

  // Tampilkan ke console
  console.clear();
  console.log("📊 Data Nilai Terpasang:");
  console.table(data);

  // Salin ke clipboard dalam format tab-delimited
  if (data.length) {
    const header = Object.keys(data[0]);
    const lines = [header.join("\t")];

    data.forEach(row => {
      lines.push(header.map(k => row[k]).join("\t"));
    });

    const text = lines.join("\n");

    navigator.clipboard.writeText(text)
      .then(() => console.log("📋 Data disalin ke clipboard!"))
      .catch(err => console.warn("❌ Gagal salin ke clipboard:", err));
  }
})();
