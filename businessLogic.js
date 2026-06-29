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

            // Jika kosong dan belum ada di DB, lewati
            if (!id && val === '') return;

            const finalVal = isNaN(Number(val)) || val === '' ? val : Number(val);
            const dbDate = DateUtil.toGristString(input.dataset.date);

            // Payload untuk Grist
            if (id) {
                // Update record yang sudah ada
                apiActions.push(['UpdateRecord', Config.writeTable, id, { [Config.writeCols.value]: finalVal }]);
            } else {
                // Tambah record baru
                apiActions.push(['AddRecord', Config.writeTable, null, {
                    [Config.writeCols.date]: dbDate,
                    [Config.writeCols.metric]: input.dataset.metric,
                    [Config.writeCols.value]: finalVal
                }]);
            }
        });

        // DEBUG: Lihat apa yang dikirim ke Grist
        console.log("Mengirim payload ke Grist:", JSON.stringify(apiActions));

        return apiActions;
    }
};