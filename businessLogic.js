// businessLogic.js
const BusinessLogic = {
    processIncomingRecords(records) {
        if (!records) records = [];

        // Simpan data mentah dari tabel "Tes"
        AppState.allRecords = records;

        // Render tabel
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