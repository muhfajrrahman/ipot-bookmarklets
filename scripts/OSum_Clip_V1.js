(function(){
  const data = [];

  document.querySelectorAll("div.mt-50").forEach(blok => {
    const kodeEl = blok.querySelector("span.ob-sec");
    const kode = kodeEl ? kodeEl.innerText.trim() : "(tidak ditemukan)";

    const nilaiTerpasang = Array.from(blok.querySelectorAll(".label-orderstatus"))
      .filter(e => e.innerText.includes("Nilai Terpasang"));

    let beli = "(?)", jual = "(?)";

    if (nilaiTerpasang.length >= 2) {
      beli = nilaiTerpasang[0].nextElementSibling?.innerText.trim() || "(?)";
      jual = nilaiTerpasang[1].nextElementSibling?.innerText.trim() || "(?)";
    }

    data.push({
      "Kode Saham": kode,
      "Nilai Terpasang Beli": beli,
      "Nilai Terpasang Jual": jual
    });
  });

  console.clear();
  console.log("📊 Data Nilai Terpasang:");
  console.table(data);

  if (data.length) {
    const header = Object.keys(data[0]);
    const lines = [header.join("\t")];
    data.forEach(row => {
      lines.push(header.map(k => row[k]).join("\t"));
    });
    const text = lines.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      console.log("📋 Data disalin ke clipboard!");
    }).catch(err => {
      console.warn("❌ Gagal salin ke clipboard:", err);
    });
  }
})();
