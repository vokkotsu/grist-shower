const BusinessLogic = {
    // Fungsi baru untuk mengekstrak metadata kolom dari tabel internal Grist
    async fetchChoicesFromMetadata(tableId, colId) {
        try {
            // Ambil ID referensi tabel terlebih dahulu
            const tables = await grist.docApi.fetchTable('_grist_Tables');
            const tableIndex = tables.tableId.indexOf(tableId);
            if (tableIndex === -1) return null;
            const tableRef = tables.id[tableIndex];

            // Ambil detail konfigurasi setiap kolom
            const columns = await grist.docApi.fetchTable('_grist_Tables_column');
            const colIndex = columns.id.findIndex((id, i) => columns.parentId[i] === tableRef && columns.colId[i] === colId);

            // Jika kolom ditemukan, ekstrak widgetOptions (berisi daftar choices)
            if (colIndex !== -1) {
                const widgetOptions = columns.widgetOptions[colIndex];
                if (widgetOptions) {
                    const opts = JSON.parse(widgetOptions);
                    if (opts && opts.choices) {
                        return opts.choices; // Mengembalikan array pilihan murni dari setting Grist
                    }
                }
            }
        } catch (e) {
            console.warn("Metadata kolom gagal ditarik, fallback ke data tabel:", e);
        }
        return null;
    },

    async processIncomingRecords(records) {
        if (!records || records.length === 0) {
            AppState.allRecords = [];
            // Walaupun tabel kosong, kita tetap mencoba menarik daftar choice dari metadata kolom
            let metadataChoices = await this.fetchChoicesFromMetadata(Config.tableId, Config.colDepartment);
            AppState.uniqueDepartments = metadataChoices || [];
            UIManager.renderTable();
            return;
        }

        const sample = records[0];
        const availableCols = Object.keys(sample);
        const getActualCol = (confCol) => availableCols.find(c => c.toLowerCase() === confCol.toLowerCase()) || confCol;

        Config.colPeriode = getActualCol(Config.colPeriode);
        Config.colDepartment = getActualCol(Config.colDepartment);
        Config.metricColumns.forEach(m => m.id = getActualCol(m.id));

        if (!(Config.colPeriode in sample) || (!(Config.colDepartment in sample))) {
            let colsList = availableCols.filter(k => k !== 'id').join(', ');
            UIManager.showError(`<b>Error Kolom:</b> Kolom '${Config.colPeriode}' atau '${Config.colDepartment}' tidak ditemukan.<br><br><b>Kolom yang terdeteksi:</b><br><span class="font-mono text-xs text-blue-600 bg-blue-50 p-2 rounded block mt-2 break-words leading-relaxed">${colsList}</span>`);
            return;
        }

        AppState.allRecords = records;

        // FITUR BARU: Menarik pilihan langsung dari Setting Kolom Grist (Metadata)
        let metadataChoices = await this.fetchChoicesFromMetadata(Config.tableId, Config.colDepartment);

        if (metadataChoices && metadataChoices.length > 0) {
            AppState.uniqueDepartments = metadataChoices;
        } else {
            // Fallback jika API Metadata gagal (tarik manual dari nilai yang sudah pernah diinput)
            const departments = records.map(r => ValUtil.getChoiceVal(r[Config.colDepartment])).filter(Boolean);
            AppState.uniqueDepartments = [...new Set(departments)].sort();
        }

        UIManager.renderTable();
    },

    addNewRow() {
        const newRecord = {
            id: `new_${AppState.newRecordCounter++}`,
            [Config.colPeriode]: '',
            [Config.colDepartment]: ''
        };

        Config.metricColumns.forEach(m => newRecord[m.id] = null);
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

            if (!groupedUpdates[recordId]) groupedUpdates[recordId] = {};

            if (fieldId === Config.colPeriode || fieldId === Config.colDepartment) {
                groupedUpdates[recordId][fieldId] = rawVal;
            } else {
                groupedUpdates[recordId][fieldId] = rawVal === '' ? null : String(rawVal);
            }
        }

        const apiActions = [];
        for (let recordId in groupedUpdates) {
            const changes = groupedUpdates[recordId];

            // Terjemahkan nilai format kalender (YYYY-MM) menjadi string valid Grist (YYYY-MM-DD)
            if (changes[Config.colPeriode] !== undefined) {
                changes[Config.colPeriode] = DateUtil.toGristString(changes[Config.colPeriode]);
            }

            if (String(recordId).startsWith('new_')) {
                if (changes[Config.colDepartment] && changes[Config.colPeriode]) {
                    apiActions.push(['AddRecord', Config.tableId, null, changes]);
                }
            } else {
                apiActions.push(['UpdateRecord', Config.tableId, parseInt(recordId, 10), changes]);
            }
        }

        return apiActions;
    }
};