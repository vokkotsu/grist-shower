// main.js
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();

    // Inisialisasi awal Grist
    grist.ready({ requiredAccess: 'full' });

    // Fungsi untuk menarik metrik dari Table1
    const fetchMetricsFromTable1 = async () => {
        try {
            // Kita gunakan fetchTable, pastikan nama tabel benar: 'Table1'
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
                return true; // Berhasil
            }
            return false; // Tabel kosong
        } catch (err) {
            console.error("Gagal membaca Table1. Periksa apakah nama tabel benar-benar 'Table1'.", err);
            return false;
        }
    };

    UIManager.els.saveBtn.addEventListener('click', () => GristAPI.saveChanges());

    // Inisialisasi promise lebih awal
    const metricsPromise = fetchMetricsFromTable1();

    let isYearInitialized = false;

    grist.onRecords(async (records) => {
        // Tunggu metrik selesai ditarik
        await metricsPromise;

        AppState.allRecords = records;

        // Update uniqueMetrics
        const existingDatabaseMetrics = AppState.allRecords && AppState.allRecords.length > 0
            ? AppState.allRecords.map(r => r[Config.colMetric]).filter(Boolean)
            : [];
        AppState.uniqueMetrics = [...new Set([...Config.defaultMetrics, ...existingDatabaseMetrics])];

        // Pemicu otomatis untuk menambah periode (bulan) HANYA SEKALI
        if (!isYearInitialized) {
            BusinessLogic.addFullYear();
            isYearInitialized = true;
        }

        BusinessLogic.processIncomingRecords(records);
    });
});