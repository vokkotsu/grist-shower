// main.js
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();

    // Inisialisasi awal Grist
    grist.ready({ requiredAccess: 'full' });

    const fetchMetricsFromTable1 = async () => {
        try {
            const table1Data = await grist.docApi.fetchTable('Table1');
            if (table1Data && table1Data.Metric) {
                const metrics = [];
                for (let i = 0; i < table1Data.Metric.length; i++) {
                    if (table1Data.Visibility && table1Data.Visibility[i] === 'Hidden') continue;
                    metrics.push({
                        name: table1Data.Metric[i],
                        order: table1Data.Order ? Number(table1Data.Order[i]) : i
                    });
                }
                metrics.sort((a, b) => a.order - b.order);
                Config.defaultMetrics = metrics.map(m => m.name).filter(Boolean);
                return true;
            }
            return false;
        } catch (err) {
            console.error("Gagal membaca Table1.", err);
            return false;
        }
    };

    UIManager.els.saveBtn.addEventListener('click', () => GristAPI.saveChanges());

    const metricsPromise = fetchMetricsFromTable1();
    let isYearInitialized = false;

    grist.onRecords(async (records) => {
        await metricsPromise;
        AppState.allRecords = records;

        const existingDatabaseMetrics = AppState.allRecords && AppState.allRecords.length > 0
            ? AppState.allRecords.map(r => r[Config.colMetric]).filter(Boolean)
            : [];
        AppState.uniqueMetrics = [...new Set([...Config.defaultMetrics, ...existingDatabaseMetrics])];

        if (!isYearInitialized) {
            // Panggil fungsi tanpa perlu menyentuh UI tombol
            BusinessLogic.addFullYear();
            isYearInitialized = true;
        }

        BusinessLogic.processIncomingRecords(records);
    });
});