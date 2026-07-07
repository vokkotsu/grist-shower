// logic.js
const BusinessLogic = {
    processIncomingRecords(records) {
        if (!records || records.length === 0) {
            UIManager.showError("Data kosong. Silakan isi beberapa baris di Grist terlebih dahulu.");
            return;
        }

        const sample = records[0];
        // Memeriksa keberadaan kolom Tabel 1 sesuai spesifikasi asli
        if (!(Config.colCompany in sample) || !(Config.colSKU in sample) || !(Config.colDate in sample) || !(Config.colDesc in sample) || !(Config.colName in sample)) {
            let cols = Object.keys(sample).filter(k => k !== 'id').join(', ');
            UIManager.showError(`<b>Error Kolom:</b> Pastikan ID Kolom: <b>${Config.colName}</b>, ${Config.colCompany}, ${Config.colSKU}, ${Config.colDate}, ${Config.colDesc} tersedia di tabel. <br><br>Tersedia saat ini: ${cols}`);
            return;
        }

        AppState.allRecords = records;

        // 1. Ekstrak nama unik untuk mengisi dropdown
        let rawNames = [...new Set(records.map(r => r[Config.colName]))].filter(Boolean);
        AppState.uniqueNames = rawNames.sort();

        // 2. Tentukan nama yang aktif secara default jika kosong
        if (!AppState.currentNameFilter || !AppState.uniqueNames.includes(AppState.currentNameFilter)) {
            AppState.currentNameFilter = AppState.uniqueNames[0] || '';
        }

        UIManager.initNameSelector();
        this.applyFiltersAndRender();
    },

    applyFiltersAndRender() {
        // 3. Saring data khusus untuk nama yang dipilih
        AppState.filteredRecords = AppState.allRecords.filter(r => r[Config.colName] === AppState.currentNameFilter);

        // 4. Ekstrak tanggal HANYA dari data milik nama terpilih
        let rawDates = [...new Set(AppState.filteredRecords.map(r => r[Config.colDate]))].filter(Boolean);
        AppState.uniqueDates = Utils.sortDates(rawDates);

        // 5. Kumpulkan grup (Company & SKU) HANYA untuk nama terpilih
        const groupMap = new Map();
        AppState.filteredRecords.forEach(r => {
            const c = r[Config.colCompany] || '';
            const s = r[Config.colSKU] || '';
            if (c || s) groupMap.set(`${c}|${s}`, { company: c, sku: s });
        });
        AppState.uniqueRowGroups = Array.from(groupMap.values());

        // Atur default nilai filter Tanggal jika belum diset atau sudah tidak valid
        if (!AppState.filterStartVal || !AppState.uniqueDates.includes(AppState.filterStartVal)) {
            AppState.filterStartVal = AppState.uniqueDates[0];
        }
        if (!AppState.filterEndVal || !AppState.uniqueDates.includes(AppState.filterEndVal)) {
            AppState.filterEndVal = AppState.uniqueDates[AppState.uniqueDates.length - 1];
        }

        this.applyDateFilter();

        UIManager.updateDateSelectors();
        UIManager.showTable();
        UIManager.renderTable();
    },

    applyDateFilter() {
        const startNum = Utils.parseDateToNumber(AppState.filterStartVal);
        const endNum = Utils.parseDateToNumber(AppState.filterEndVal);

        if (startNum > endNum) {
            AppState.filterEndVal = AppState.filterStartVal;
            UIManager.updateDateSelectors();
        }

        AppState.filteredDates = AppState.uniqueDates.filter(d => {
            const num = Utils.parseDateToNumber(d);
            return num >= Utils.parseDateToNumber(AppState.filterStartVal) && num <= Utils.parseDateToNumber(AppState.filterEndVal);
        });
    },

    generateSavePayload() {
        UIManager.saveCurrentInputsToState();

        const apiActions = [];
        const inputs = document.querySelectorAll('#table-body textarea');

        inputs.forEach(input => {
            const id = parseInt(input.dataset.id);
            const val = input.value.trim();

            if (id) {
                // Skenario 1: Update sel yang sudah ada
                const original = AppState.allRecords.find(r => r.id === id);
                if (original && String(original[Config.colDesc] || '').trim() !== val) {

                    // A. Update data lama di Tabel 1
                    apiActions.push(['UpdateRecord', Config.tableId, id, { [Config.colDesc]: val }]);

                    // B. Tambah sebagai riwayat baru di Tabel 2
                    apiActions.push(['AddRecord', Config.table2Id, null, {
                        [Config.t2ColName]: AppState.currentNameFilter,
                        [Config.t2ColDate]: input.dataset.date,
                        [Config.t2ColCompany]: input.dataset.company,
                        [Config.t2ColSKU]: input.dataset.sku,
                        [Config.t2ColValue]: val
                    }]);
                }
            } else if (val !== '') {
                // Skenario 2: Mengisi sel yang masih kosong (Data Baru)

                // A. Tambah baris baru di Tabel 1
                apiActions.push(['AddRecord', Config.tableId, null, {
                    [Config.colName]: AppState.currentNameFilter,
                    [Config.colDate]: input.dataset.date,
                    [Config.colCompany]: input.dataset.company,
                    [Config.colSKU]: input.dataset.sku,
                    [Config.colDesc]: val
                }]);

                // B. Tambah baris baru di Tabel 2
                apiActions.push(['AddRecord', Config.table2Id, null, {
                    [Config.t2ColName]: AppState.currentNameFilter,
                    [Config.t2ColDate]: input.dataset.date,
                    [Config.t2ColCompany]: input.dataset.company,
                    [Config.t2ColSKU]: input.dataset.sku,
                    [Config.t2ColValue]: val
                }]);
            }
        });
        return apiActions;
    }
};