javascript:(async()=>{

    // ============================================================
    // Scrapping_Fundamental_V_1.js
    // IPOT Fundamental
    // - Validasi semua emiten = 12 Month
    // - Scrape 4 emiten yang sedang tampil
    // - Angka + satuan dipisah menjadi 2 kolom
    // - Hasil TSV -> Clipboard -> siap Paste ke Excel
    // ============================================================

    const EMITEN = [...document.querySelectorAll(
        'section[data-type="fundamental"] > div[data-code]'
    )];

    // ------------------------------------------------------------
    // 1. VALIDASI JUMLAH EMITEN
    // ------------------------------------------------------------

    if (EMITEN.length === 0) {
        alert("Tidak ditemukan data fundamental emiten.");
        return;
    }

    // ------------------------------------------------------------
    // 2. VALIDASI PERIODE
    // ------------------------------------------------------------

    const belum12M = [];

    EMITEN.forEach(el => {

        const kode =
            el.getAttribute("data-code") ||
            el.querySelector(".ob-sec")?.textContent.trim() ||
            "(Tidak diketahui)";

        const periode =
            el.querySelector('select[name="quarter"]')
              ?.closest(".smart-select")
              ?.querySelector(".item-after")
              ?.textContent.trim() || "";

        if (periode !== "12 Month") {
            belum12M.push(`${kode} periodenya belum 12 bulan`);
        }
    });

    if (belum12M.length > 0) {

        alert(
            belum12M.join("\n") +
            "\n\nScrapping dibatalkan."
        );

        return;
    }

    // ------------------------------------------------------------
    // 3. FUNGSI MEMISAHKAN ANGKA DAN SATUAN
    // ------------------------------------------------------------

    function pecahNilai(text) {

        text = (text || "").trim();

        // Kosong
        if (!text) {
            return ["", ""];
        }

        // Hilangkan spasi berlebihan
        text = text.replace(/\s+/g, " ");

        /*
            Contoh:
            20 B
            1.25 T
            500 M
            18.7 %
            -5.2 %
            386
        */

        const match = text.match(
            /^(-?[\d.,]+)\s*([A-Za-z%]+)?$/
        );

        if (!match) {
            // Kalau ternyata bukan angka,
            // jangan dipaksakan menjadi numeric.
            return [text, ""];
        }

        let angka = match[1];
        let satuan = match[2] || "";

        /*
            IPOT menggunakan titik sebagai decimal separator
            berdasarkan HTML yang kita lihat.
            Contoh: 690.8 B

            Jadi:
            "690.8" -> Number -> 690.8
        */

        angka = Number(angka.replace(/,/g, ""));

        if (Number.isNaN(angka)) {
            return [text, satuan];
        }

        return [angka, satuan];
    }

    // ------------------------------------------------------------
    // 4. FUNGSI TEXT BIASA
    // ------------------------------------------------------------

    function text(el) {
        return (el?.textContent || "").trim();
    }

    // ------------------------------------------------------------
    // 5. AMBIL DATA MASING-MASING EMITEN
    // ------------------------------------------------------------

    const hasil = [];

    EMITEN.forEach(emiten => {

        const kode =
            emiten.getAttribute("data-code") || "";

        const nama =
            text(emiten.querySelector(".ob-secname"));

        const table =
            emiten.querySelector(
                'table.data-table[data-type="fundamental"]'
            );

        if (!table) return;

        // --------------------------------------------------------
        // Header periode
        // --------------------------------------------------------

        const headers = [...table.querySelectorAll("thead th")]
            .map(th => text(th));

        /*
            Kolom pertama adalah nama item:
            ""
            ANLZ 2026
            [6M] 2026
            12M 2025
            ...
        */

        // --------------------------------------------------------
        // Header output
        // --------------------------------------------------------

        const header = [
            "Kode",
            "Nama Emiten"
        ];

        for (let i = 1; i < headers.length; i++) {

            const periode = headers[i];

            header.push(periode);
            header.push("Satuan");
        }

        // --------------------------------------------------------
        // Data rows
        // --------------------------------------------------------

        const rows = [
            header
        ];

        const trs = [...table.querySelectorAll("tbody tr")];

        trs.forEach(tr => {

            const cells = [...tr.querySelectorAll("td")];

            if (cells.length === 0) return;

            const namaData = text(cells[0]);

            const row = [
                kode,
                namaData
            ];

            for (let i = 1; i < cells.length; i++) {

                const [angka, satuan] =
                    pecahNilai(text(cells[i]));

                row.push(angka);
                row.push(satuan);
            }

            rows.push(row);
        });

        // --------------------------------------------------------
        // Simpan hasil emiten
        // --------------------------------------------------------

        hasil.push({
            kode,
            nama,
            rows
        });
    });

    // ------------------------------------------------------------
    // 6. GABUNGKAN SEMUA EMITEN
    // ------------------------------------------------------------

    /*
        Saya buat satu blok per emiten.

        Jadi hasil Excel:

        CLEO
        Kode | Nama Data | ANLZ 2026 | Satuan | 12M 2025 | Satuan ...
        ...

        CSRA
        Kode | Nama Data | ...
        ...
    */

    const output = [];

    hasil.forEach((emiten, index) => {

        // Judul emiten
        output.push(
            `${emiten.kode}\t${emiten.nama}`
        );

        // Data
        emiten.rows.forEach(row => {

            output.push(
                row.map(v => v ?? "").join("\t")
            );

        });

        // Baris kosong antar emiten
        if (index < hasil.length - 1) {
            output.push("");
            output.push("");
        }
    });

    const tsv = output.join("\r\n");

    // ------------------------------------------------------------
    // 7. COPY KE CLIPBOARD
    // ------------------------------------------------------------

    try {

        await navigator.clipboard.writeText(tsv);

        alert(
            "Scrapping berhasil.\n\n" +
            `${hasil.length} emiten berhasil diambil.\n\n` +
            "Data sudah masuk Clipboard.\n" +
            "Silakan Paste (Ctrl+V) ke Excel."
        );

    } catch (err) {

        /*
            Fallback untuk browser yang menolak
            navigator.clipboard
        */

        const ta = document.createElement("textarea");

        ta.value = tsv;

        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "0";

        document.body.appendChild(ta);

        ta.focus();
        ta.select();

        const berhasil =
            document.execCommand("copy");

        ta.remove();

        if (berhasil) {

            alert(
                "Scrapping berhasil.\n\n" +
                `${hasil.length} emiten berhasil diambil.\n\n` +
                "Data sudah masuk Clipboard.\n" +
                "Silakan Paste (Ctrl+V) ke Excel."
            );

        } else {

            alert(
                "Scrapping berhasil, tetapi Clipboard gagal diakses.\n\n" +
                "Silakan cek Developer Console."
            );
        }
    }

})();