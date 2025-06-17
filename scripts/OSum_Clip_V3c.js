(function () {
  const data = [];

  document.querySelectorAll("div.mt-50").forEach(blok => {
    const kodeEl = blok.querySelector("span.ob-sec");
    const kode = kodeEl ? kodeEl.innerText.trim() : "N/A";

    let realisasiBeli = 0;
    let realisasiJual = 0;
    let nilaiTerpasangBeli = 0;
    let nilaiTerpasangJual = 0;

    blok.querySelectorAll(".label-orderstatus").forEach(label => {
      const teks = label.innerText.trim();
      const nilai = label.nextElementSibling?.innerText.trim() || "0";
      const angka = parseFloat(nilai.replace(/[^0-9.-]/g, "")) || 0;

      const kolom = label.closest(".col");
      const judul = kolom?.querySelector(".title-orderstatus")?.innerText.trim();

      if (judul === "Pembelian") {
        if (teks === "Nilai Beli") realisasiBeli = angka;
        else if (teks === "Nilai Terpasang") nilaiTerpasangBeli = angka;
      }

      if (judul === "Penjualan") {
        if (teks === "Nilai Jual") realisasiJual = angka;
        else if (teks === "Nilai Terpasang") nilaiTerpasangJual = angka;
      }
    });

    data.push({
      "Kode Saham": kode,
      "Realisasi Beli": realisasiBeli,
      "Realisasi Jual": realisasiJual,
      "Nilai Terpasang Beli": nilaiTerpasangBeli,
      "Nilai Terpasang Jual": nilaiTerpasangJual
    });
  });

  console.clear();
  console.log("📊 Data Order Status:");
  console.table(data);

  if (data.length) {
    const header = Object.keys(data[0]);
    const lines = [header.join("\t")];
    data.forEach(row => lines.push(header.map(k => row[k]).join("\t")));
    const text = lines.join("\n");

    navigator.clipboard.writeText(text)
      .then(() => {
        console.log("📋 Data disalin ke clipboard!");
        window.alert(`Data disalin ke clipboard, sebanyak ${data.length} baris`);
      })
      .catch(err => {
        console.warn("❌ Gagal salin ke clipboard:", err);
        window.alert("❌ Gagal salin ke clipboard!");
      });
  } else {
    window.alert("Tidak ada data ditemukan! Mungkin halaman belum memuat transaksi.");
  }
})();
