const BusinessLogic = {
    processIncomingRecords(records) {
        if (!records || records.length === 0) {
            AppState.allRecords = [];
            AppState.uniqueSources = []; // Kosong
            UIManager.renderTable();
            return;
        }

        const sample = records[0];
        const availableCols = Object.keys(sample);

        const getActualCol = (confCol) => availableCols.find(c => c.toLowerCase() === confCol.toLowerCase()) || confCol;

        Config.colPeriode = getActualCol(Config.colPeriode);
        Config.colSource = getActualCol(Config.colSource);
        Config.metricColumns.forEach(m => {
            m.id = getActualCol(m.id);
        });

        if (!(Config.colPeriode in sample) || !(Config.colSource in sample)) {
            let colsList = availableCols.filter(k => k !== 'id').join(', ');
            UIManager.showError(`<b>Error Kolom:</b> Kolom '${Config.colPeriode}' atau '${Config.colSource}' tidak ditemukan di tabel Grist Anda.<br><br><b>Kolom yang terdeteksi di tabel:</b><br><span class="font-mono text-xs text-blue-600 bg-blue-50 p-2 rounded block mt-2 break-words leading-relaxed">${colsList}</span><br>Pastikan Anda memilih tabel yang benar pada Creator Panel Grist (Kanan).`);
            return;
        }

        AppState.allRecords = records;

        // MENGUMPULKAN DAFTAR SOURCE UNTUK DROPDOWN
        const sources = records.map(r => ValUtil.getChoiceVal(r[Config.colSource])).filter(Boolean);
        AppState.uniqueSources = [...new Set(sources)].sort();

        UIManager.renderTable();
    },

    addNewRow() {
        const newRecord = {
            id: `new_${AppState.newRecordCounter++}`,
            [Config.colPeriode]: '',
            [Config.colSource]: ''
        };

        Config.metricColumns.forEach(m => {
            newRecord[m.id] = null;
        });

        AppState.allRecords.push(newRecord);
        UIManager.renderTable();

        const container = UIManager.els.tableContainer;
        container.scrollTop = container.scrollHeight;
    },

    generateSavePayload() {
        const groupedUpdates = {};

        for (let key in AppState.unsavedEdits) {
            const [recordId, fieldId] = key.split('|');
            const rawVal = AppState.unsavedEdits[key];

            if (!groupedUpdates[recordId]) {
                groupedUpdates[recordId] = {};
            }

            if (fieldId === Config.colPeriode || fieldId === Config.colSource) {
                groupedUpdates[recordId][fieldId] = rawVal;
            } else {
                groupedUpdates[recordId][fieldId] = rawVal === '' ? null : Number(rawVal);
            }
        }

        const apiActions = [];
        for (let recordId in groupedUpdates) {
            const changes = groupedUpdates[recordId];

            if (changes[Config.colPeriode] !== undefined) {
                changes[Config.colPeriode] = DateUtil.toGristString(changes[Config.colPeriode]);
            }

            if (String(recordId).startsWith('new_')) {
                // Jangan push kalau source/periode kosong pada baris baru
                if (changes[Config.colSource] && changes[Config.colPeriode]) {
                    apiActions.push(['AddRecord', Config.tableId, null, changes]);
                }
            } else {
                apiActions.push(['UpdateRecord', Config.tableId, parseInt(recordId, 10), changes]);
            }
        }

        return apiActions;
    }
};