// main.js
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();

    // Fungsi untuk menarik metrik dari Table1
    const fetchMetricsFromTable1 = async () => {
        try {
            const table1Data = await grist.docApi.fetchTable('Table1');

            if (table1Data && table1Data.Metric) {
                const metrics = [];
                for (let i = 0; i < table1Data.Metric.length; i++) {
                    if (table1Data.Visibility && table1Data.Visibility[i] === 'Hidden') {
                        continue;
                    }
                    metrics.push({
                        name: table1Data.Metric[i],
                        order: table1Data.Order ? Number(table1Data.Order[i]) : i
                    });
                }
                metrics.sort((a, b) => a.order - b.order);
                Config.defaultMetrics = metrics.map(m => m.name).filter(Boolean);
            }
        } catch (err) {
            console.warn("Gagal membaca Table1.", err);
        }
    };

    UIManager.els.saveBtn.addEventListener('click', () => GristAPI.saveChanges());

    // Inisialisasi data Table1 secara asinkron di latar belakang
    // Tanpa 'await' di sini agar tidak menghambat aliran data utama
    const metricsPromise = fetchMetricsFromTable1();

    let isYearInitialized = false;

    grist.onRecords(async (records) => {
        // Tunggu metrik selesai ditarik jika belum (tanpa memblokir UI terlalu lama)
        await metricsPromise;

        // Simpan records ke state
        AppState.allRecords = records;

        // Update uniqueMetrics dengan metrik yang baru saja didapat
        const existingDatabaseMetrics = AppState.allRecords && AppState.allRecords.length > 0 ? AppState.allRecords.map(r => r[Config.colMetric]).filter(Boolean) : [];
        AppState.uniqueMetrics = [...new Set([...Config.defaultMetrics, ...existingDatabaseMetrics])];

        // Pemicu otomatis untuk menambah periode (bulan) HANYA SEKALI
        if (!isYearInitialized) {
            BusinessLogic.addFullYear();
            isYearInitialized = true;
        }

        BusinessLogic.processIncomingRecords(records);
    });

    grist.ready({ requiredAccess: 'full' });
});