// businessLogic.js
const BusinessLogic = {
    processIncomingRecords(records) {
        // 1. Inisialisasi variabel dengan aman agar tidak undefined
        if (!AppState.masterMetrics) AppState.masterMetrics = [];
        if (!AppState.allRecords) AppState.allRecords = [];
        if (!AppState.uniqueDates) AppState.uniqueDates = [];
        if (!AppState.uniqueMetrics) AppState.uniqueMetrics = [];

        // 2. Jika data kosong, tampilkan default dan keluar
        if (!records || records.length === 0) {
            AppState.allRecords = [];
            AppState.uniqueDates = [];
            AppState.uniqueMetrics = [...Config.defaultMetrics];

            if (UIManager.els.addMonthBtn) UIManager.els.addMonthBtn.classList.remove('hidden');
            UIManager.showTable();
            UIManager.renderTable();
            return;
        }

        // 3. Validasi struktur kolom (Data harus memiliki kolom yang didefinisikan di Config)
        const sample = records[0];
        if (!(Config.colDate in sample) || !(Config.colMetric in sample) || !(Config.colValue in sample)) {
            let cols = Object.keys(sample).filter(k => k !== 'id').join(', ');
            UIManager.showError(`<b>Error Kolom:</b> Cari: ${Config.colDate}, ${Config.colMetric}, ${Config.colValue}. <br>Tersedia: ${cols}`);
            return;
        }

        // 4. Update state records
        AppState.allRecords = records;

        // 5. Ekstraksi tanggal unik dari data yang sudah ada
        const incomingDates = [...new Set(records.map(r => DateUtil.parse(r[Config.colDate])))].filter(Boolean).sort();

        // 6. Logika khusus tahun: jika sudah ada data Januari, sembunyikan tombol tambah bulan
        let janDateStr = incomingDates.find(d => String(d).toLowerCase().startsWith('Jan'));
        if (janDateStr) {
            if (UIManager.els.addMonthBtn) UIManager.els.addMonthBtn.classList.add('hidden');
            const parts = janDateStr.split(' ');
            const year = parts.length >= 2 ? parts[1] : String(new Date().getFullYear()).slice(-2);
            const fullYear = DateUtil.monthNamesShort.map(m => m + ' ' + year);
            AppState.uniqueDates = [...new Set([...fullYear, ...incomingDates])].sort();
        } else {
            if (UIManager.els.addMonthBtn) UIManager.els.addMonthBtn.classList.remove('hidden');
            AppState.uniqueDates = incomingDates;
        }

        // 7. Sinkronisasi metrik: Gabungkan metrik default dengan metrik yang sudah ada di database
        const existingDatabaseMetrics = records.map(r => r[Config.colMetric]).filter(Boolean);
        AppState.uniqueMetrics = [...new Set([...Config.defaultMetrics, ...existingDatabaseMetrics])];

        // 8. Render ke UI
        UIManager.showTable();
        UIManager.renderTable();
    },

    addFullYear() {
        let yearToUse = String(new Date().getFullYear()).slice(-2);
        if (AppState.uniqueDates.length > 0) {
            let parts = AppState.uniqueDates[0].split(' ');
            if (parts.length >= 2) yearToUse = parts[1];
        }

        const fullYearDates = DateUtil.monthNamesShort.map(m => m + ' ' + yearToUse);
        UIManager.saveCurrentInputsToState();

        AppState.uniqueDates = [...new Set([...AppState.uniqueDates, ...fullYearDates])];
        UIManager.renderTable();
    },

    generateSavePayload() {
        UIManager.saveCurrentInputsToState();

        const apiActions = [];
        const inputs = document.querySelectorAll('#table-body input');

        inputs.forEach(input => {
            const id = input.dataset.id ? parseInt(input.dataset.id) : null;
            const val = input.value.trim();
            const metric = input.dataset.metric;
            const date = input.dataset.date;

            // Konversi nilai
            const finalVal = (val === '' || isNaN(Number(val))) ? val : Number(val);
            const dbDate = DateUtil.toGristString(date);

            // LOGIKA PENCARIAN ID YANG LEBIH TEPAT
            // Cari apakah record ini sudah ada di AppState berdasarkan Metric & Tanggal
            let existingRecord = AppState.allRecords.find(r =>
                r[Config.colMetric] === metric &&
                DateUtil.parse(r[Config.colDate]) === date
            );

            // Jika id di input kosong, coba ambil dari existingRecord
            const recordId = id || (existingRecord ? existingRecord.id : null);

            // Payload untuk Grist
            if (recordId) {
                // UPDATE: Hanya jika ada perubahan nilai
                const originalVal = existingRecord ? existingRecord[Config.colValue] : null;
                if (String(originalVal) !== String(finalVal)) {
                    apiActions.push(['UpdateRecord', 'Tes', recordId, { [Config.colValue]: finalVal }]);
                }
            } else if (val !== '') {
                // ADD: Hanya jika ada isi dan belum ada recordnya
                apiActions.push(['AddRecord', 'Tes', null, {
                    [Config.colDate]: dbDate,
                    [Config.colMetric]: metric,
                    [Config.colValue]: finalVal
                }]);
            }
        });

        console.log("Payload yang dikirim:", apiActions);
        return apiActions;
    }
};