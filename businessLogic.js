// businessLogic.js
const BusinessLogic = {
    processIncomingRecords(records) {
        if (!records || records.length === 0) {
            AppState.allRecords = [];
            AppState.uniqueDates = [];
            AppState.uniqueMetrics = [...Config.defaultMetrics];
            UIManager.showTable();
            UIManager.renderTable();
            return;
        }

        const sample = records[0];
        // Validasi apakah kolom 'Metric' ada di data yang di-fetch
        if (!(Config.colDate in sample) || !(Config.colMetric in sample) || !(Config.colValue in sample)) {
            let cols = Object.keys(sample).filter(k => k !== 'id').join(', ');
            UIManager.showError(`<b>Error Kolom:</b> Cari: ${Config.colDate}, ${Config.colMetric}, ${Config.colValue}. <br>Tersedia: ${cols}`);
            return;
        }

        AppState.allRecords = records;

        // Tanggal
        const incomingDates = [...new Set(records.map(r => DateUtil.parse(r[Config.colDate])))].filter(Boolean);
        AppState.uniqueDates = [...new Set([...AppState.uniqueDates, ...incomingDates])];

        // Metrik dari Table1
        const fetchedMetrics = [...new Set(records.map(r => r[Config.colMetric]))].filter(Boolean);
        AppState.uniqueMetrics = fetchedMetrics.length > 0 ? fetchedMetrics : [...Config.defaultMetrics];

        UIManager.showTable();
        UIManager.renderTable();
    },

    addFullYear() {
        // ... (fungsi addFullYear tetap sama)
    },

    generateSavePayload() {
        UIManager.saveCurrentInputsToState();

        const apiActions = [];
        const inputs = document.querySelectorAll('#table-body input');

        inputs.forEach(input => {
            const id = parseInt(input.dataset.id);
            const val = input.value.trim();
            if (!id && val === '') return;

            const finalVal = isNaN(Number(val)) || val === '' ? val : Number(val);
            const dbDate = DateUtil.toGristString(input.dataset.date);

            // SIMPAN KE 'Tes' SESUAI PERMINTAAN ANDA
            if (id) {
                apiActions.push(['UpdateRecord', 'Tes', id, { [Config.colValue]: finalVal }]);
            } else {
                apiActions.push(['AddRecord', 'Tes', null, {
                    [Config.colDate]: dbDate,
                    [Config.colMetric]: input.dataset.metric,
                    [Config.colValue]: finalVal
                }]);
            }
        });
        return apiActions;
    }
};