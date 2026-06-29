// main.js
document.addEventListener('DOMContentLoaded', async () => {
    ThemeManager.init();
    UIManager.els.addMonthBtn.addEventListener('click', () => BusinessLogic.addFullYear());
    UIManager.els.saveBtn.addEventListener('click', () => GristAPI.saveChanges());

    // 1. Inisialisasi Akses Grist API
    grist.ready({ requiredAccess: 'full' });

    // 2. Ambil Metrik Predefined dari 'Table1' berdasarkan struktur CSV Anda
    try {
        const table1Data = await grist.docApi.fetchTable('Table1');

        if (table1Data && table1Data.Metric) {
            const metrics = [];
            for (let i = 0; i < table1Data.Metric.length; i++) {
                // Saring metrik yang di-hide berdasarkan kolom Visibility di CSV
                if (table1Data.Visibility && table1Data.Visibility[i] === 'Hidden') {
                    continue;
                }
                metrics.push({
                    name: table1Data.Metric[i],
                    // Konversi Order ke angka agar bisa disortir dengan benar
                    order: table1Data.Order ? Number(table1Data.Order[i]) : i
                });
            }

            // Urutkan sesuai angka di kolom "Order"
            metrics.sort((a, b) => a.order - b.order);

            // Timpa defaultMetrics dengan data dari Table1
            Config.defaultMetrics = metrics.map(m => m.name).filter(Boolean);
        }
    } catch (err) {
        console.warn("Gagal membaca Table1. Pastikan tabel bernama 'Table1' ada dan memiliki kolom Metric.", err);
    }

    // 3. Pasang Listener untuk tabel utama (Tes)
    // (Langkah ini menggantikan GristAPI.init() pada kode sebelumnya)
    grist.onRecords(records => BusinessLogic.processIncomingRecords(records));
});