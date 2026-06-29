// main.js
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();

    // Ekstrak fungsi penarikan data agar bisa digunakan saat loading awal
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

                // Perbarui uniqueMetrics di AppState
                const existingDatabaseMetrics = AppState.allRecords && AppState.allRecords.length > 0 ? AppState.allRecords.map(r => r[Config.colMetric]).filter(Boolean) : [];
                AppState.uniqueMetrics = [...new Set([...Config.defaultMetrics, ...existingDatabaseMetrics])];
            }
        } catch (err) {
            console.warn("Gagal membaca Table1. Pastikan tabel bernama 'Table1' ada dan memiliki kolom Metric.", err);
        }
    };

    // Saat tombol "Tambah Bulan" diklik
    UIManager.els.addMonthBtn.addEventListener('click', () => {
        // Langsung generate 12 bulan dan sel-sel (cells) nya dari memori
        // Proses ini sekarang berjalan instan tanpa perlu loading ke server Grist
        BusinessLogic.addFullYear();
    });

    UIManager.els.saveBtn.addEventListener('click', () => GristAPI.saveChanges());

    // VARIABEL PENANDA: Agar data Table1 tidak di-download berkali-kali setiap ada perubahan sel
    let isMetricsLoaded = false;

    // 1. Pasang Listener untuk tabel utama TERLEBIH DAHULU (Sangat penting agar tidak miss data!)
    grist.onRecords(async (records) => {
        // Jika Table1 belum pernah diunduh, unduh dulu sekarang (hanya 1x di awal)
        if (!isMetricsLoaded) {
            await fetchMetricsFromTable1();
            isMetricsLoaded = true;
        }

        // Setelah metrik dari Table1 siap, baru lanjutkan memproses data utama dan memunculkan tabel
        BusinessLogic.processIncomingRecords(records);
    });

    // 2. Inisialisasi Akses Grist API (Memberi tahu Grist bahwa widget sudah siap)
    grist.ready({ requiredAccess: 'full' });
});