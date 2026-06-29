// businessLogic.js
const BusinessLogic = {
    processIncomingRecords(records) {
        AppState.allRecords = records;

        // Gabungkan tanggal dari data yang ada
        const incomingDates = [...new Set(records.map(r => DateUtil.parse(r[Config.colDate])))].filter(Boolean);
        AppState.uniqueDates = [...new Set([...AppState.uniqueDates, ...incomingDates])];

        // Gunakan masterMetrics (yang di-fetch dari Table1) sebagai acuan baris
        AppState.uniqueMetrics = [...AppState.masterMetrics];

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
            const id = parseInt(input.dataset.id);
            const val = input.value.trim();
            if (!id && val === '') return;

            const finalVal = isNaN(Number(val)) || val === '' ? val : Number(val);
            const dbDate = DateUtil.toGristString(input.dataset.date);

            // Simpan ke destTable (Tes) menggunakan writeColMetric
            if (id) {
                apiActions.push(['UpdateRecord', Config.destTable, id, { [Config.colValue]: finalVal }]);
            } else {
                apiActions.push(['AddRecord', Config.destTable, null, {
                    [Config.colDate]: dbDate,
                    [Config.writeColMetric]: input.dataset.metric,
                    [Config.colValue]: finalVal
                }]);
            }
        });
        return apiActions;
    }
};
