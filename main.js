// main.js
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    grist.ready({ requiredAccess: 'full' });

    // 1. Fetch Master Metrics dari Table1 (Background process)
    const fetchMasterMetrics = async () => {
        try {
            const data = await grist.docApi.fetchTable(Config.sourceTable);
            if (data && data[Config.readColMetric]) {
                AppState.masterMetrics = data[Config.readColMetric].filter(Boolean);
                // Trigger render ulang jika tabel sudah ada isinya
                if (AppState.allRecords.length > 0) BusinessLogic.processIncomingRecords(AppState.allRecords);
            }
        } catch (err) { console.error("Gagal fetch Table1", err); }
    };
    fetchMasterMetrics();

    // 2. Handle data dari tabel 'Tes'
    let isInitialized = false;
    grist.onRecords((records) => {
        AppState.allRecords = records;

        // Jalankan addFullYear sekali saja saat startup
        if (!isInitialized) {
            BusinessLogic.addFullYear();
            isInitialized = true;
        }

        BusinessLogic.processIncomingRecords(records);
    });

    UIManager.els.saveBtn.addEventListener('click', () => GristAPI.saveChanges());
});