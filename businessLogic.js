// businessLogic.js
const BusinessLogic = {
    processIncomingRecords(records) {
        if (!records || records.length === 0) {
            AppState.allRecords = [];
            AppState.uniqueDates = [];
            AppState.uniqueMetrics = [...Config.defaultMetrics];
            UIManager.els.addMonthBtn.classList.remove('hidden');
            UIManager.showTable();
            UIManager.renderTable();
            return;
        }

        const sample = records[0];
        if (!(Config.colDate in sample) || !(Config.colMetric in sample) || !(Config.colValue in sample)) {
            let cols = Object.keys(sample).filter(k => k !== 'id').join(', ');
            UIManager.showError(`<b>Error Kolom:</b> Cari: ${Config.colDate}, ${Config.colMetric}, ${Config.colValue}. <br>Tersedia: ${cols}`);
            return;
        }

        AppState.allRecords = records;
        const incomingDates = [...new Set(records.map(r => DateUtil.parse(r[Config.colDate])))].filter(Boolean);

        let janDateStr = incomingDates.find(d => String(d).toLowerCase().startsWith('jan'));
        if (janDateStr) {
            UIManager.els.addMonthBtn.classList.add('hidden');
            const parts = janDateStr.split(' ');
            const year = parts.length >= 2 ? parts[1] : String(new Date().getFullYear()).slice(-2);
            const fullYear = DateUtil.monthNamesShort.map(m => m + ' ' + year);
            AppState.uniqueDates = [...new Set([...fullYear, ...incomingDates])];
        } else {
            UIManager.els.addMonthBtn.classList.remove('hidden');
            AppState.uniqueDates = [...new Set([...AppState.uniqueDates, ...incomingDates])];
        }

        AppState.uniqueMetrics = [...new Set(records.map(r => r[Config.colMetric]))].filter(Boolean);
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

        AppState.uniqueMetrics.forEach(metric => {
            fullYearDates.forEach(date => {
                let matched = AppState.allRecords.find(r => r[Config.colMetric] === metric && DateUtil.parse(r[Config.colDate]) === date);
                if (!matched || matched[Config.colValue] === null || matched[Config.colValue] === '') {
                    if (AppState.unsavedEdits[`${metric}|${date}`] === undefined) {
                        AppState.unsavedEdits[`${metric}|${date}`] = '';
                    }
                }
            });
        });

        AppState.uniqueDates = [...new Set([...AppState.uniqueDates, ...fullYearDates])];
        UIManager.els.addMonthBtn.classList.add('hidden');
        UIManager.renderTable();
    },

    generateSavePayload() {
        UIManager.saveCurrentInputsToState();

        let emptyRecords = AppState.allRecords.filter(r =>
            (!r[Config.colDate] || DateUtil.parse(r[Config.colDate]) === '') &&
            (!r[Config.colMetric] || String(r[Config.colMetric]).trim() === '') &&
            (r[Config.colValue] === null || String(r[Config.colValue]).trim() === '')
        ).sort((a, b) => a.id - b.id);

        const apiActions = [];
        const inputs = document.querySelectorAll('#table-body input');

        inputs.forEach(input => {
            const id = parseInt(input.dataset.id);
            const val = input.value.trim();
            if (!id && val === '') return;

            const finalVal = isNaN(Number(val)) || val === '' ? val : Number(val);
            const dbDate = DateUtil.toGristString(input.dataset.date);

            if (id) {
                const original = AppState.allRecords.find(r => r.id === id);
                if (original && String(original[Config.colValue]) !== String(val)) {
                    apiActions.push(['UpdateRecord', Config.tableId, id, { [Config.colValue]: finalVal }]);
                }
            } else {
                if (emptyRecords.length > 0) {
                    const recycle = emptyRecords.shift();
                    apiActions.push(['UpdateRecord', Config.tableId, recycle.id, { [Config.colDate]: dbDate, [Config.colMetric]: input.dataset.metric, [Config.colValue]: finalVal }]);
                } else {
                    apiActions.push(['AddRecord', Config.tableId, null, { [Config.colDate]: dbDate, [Config.colMetric]: input.dataset.metric, [Config.colValue]: finalVal }]);
                }
            }
        });
        return apiActions;
    }
};