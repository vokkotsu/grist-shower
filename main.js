// main.js
document.addEventListener('DOMContentLoaded', async () => {
    ThemeManager.init();

    // Ekstrak fungsi penarikan data agar bisa digunakan berulang kali
    const fetchMetricsFromTable1 = async () => {
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

                // Perbarui uniqueMetrics di AppState agar sel baru langsung terbentuk
                const existingDatabaseMetrics = AppState.allRecords ? AppState.allRecords.map(r => r[Config.colMetric]).filter(Boolean) : [];
                AppState.uniqueMetrics = [...new Set([...Config.defaultMetrics, ...existingDatabaseMetrics])];
            }
        } catch (err) {
            console.warn("Gagal membaca Table1. Pastikan tabel bernama 'Table1' ada dan memiliki kolom Metric.", err);
        }
    };

    // Saat tombol "Tambah Bulan" diklik
    UIManager.els.addMonthBtn.addEventListener('click', async () => {
        // Berikan indikator visual sedang memuat metrik
        const originalContent = UIManager.els.addMonthBtn.innerHTML;
        UIManager.els.addMonthBtn.innerHTML = 'Memuat Metrik...';

        // 1. Tarik ulang metrik dari Table1 untuk berjaga-jaga ada metrik baru
        await fetchMetricsFromTable1();

        // 2. Generate 12 bulan dan sel-sel (cells) nya
        BusinessLogic.addFullYear();

        // 3. Kembalikan bentuk awal tombol
        UIManager.els.addMonthBtn.innerHTML = originalContent;
    });

    UIManager.els.saveBtn.addEventListener('click', () => GristAPI.saveChanges());

    // 1. Inisialisasi Akses Grist API
    grist.ready({ requiredAccess: 'full' });

    // 2. Ambil Metrik Predefined dari 'Table1' saat halaman pertama kali dibuka
    await fetchMetricsFromTable1();

    // 3. Pasang Listener untuk tabel utama (Tes)
    grist.onRecords(records => BusinessLogic.processIncomingRecords(records));
});