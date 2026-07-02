// logic.js
// Melakukan validasi data, mempersiapkan format array, dan menghasilkan susunan Payload Grist
const BusinessLogic = {
    processIncomingRecords(records) {
        if (!records || records.length === 0) {
            UIManager.showError("Data kosong. Silakan isi beberapa baris di Grist terlebih dahulu.");
            return;
        }

        const sample = records[0];
        if (!(Config.colCompany in sample) || !(Config.colSKU in sample) || !(Config.colDate in sample) || !(Config.colDesc in sample)) {
            let cols = Object.keys(sample).filter(k => k !== 'id').join(', ');
            UIManager.showError(`<b>Error Kolom:</b> Pastikan ID Kolom di Grist persis sama: ${Config.colCompany}, ${Config.colSKU}, ${Config.colDate}, ${Config.colDesc}. <br><br>Tersedia saat ini: ${cols}`);
            return;
        }

        AppState.allRecords = records;

        // 1. Ekstrak tanggal unik lalu urutkan
        let rawDates = [...new Set(records.map(r => r[Config.colDate]))].filter(Boolean);
        AppState.uniqueDates = Utils.sortDates(rawDates);

        // 2. Kumpulkan grup unik (Kombinasi Company & SKU) menggunakan Map
        const groupMap = new Map();
        records.forEach(r => {
            const c = r[Config.colCompany] || '';
            const s = r[Config.colSKU] || '';
            if (c || s) groupMap.set(`${c}|${s}`, { company: c, sku: s });
        });
        AppState.uniqueRowGroups = Array.from(groupMap.values());

        // Atur default nilai filter (Tampilkan semua secara default)
        if (!AppState.filterStartVal || !AppState.uniqueDates.includes(AppState.filterStartVal)) {
            AppState.filterStartVal = AppState.uniqueDates[0];
        }
        if (!AppState.filterEndVal || !AppState.uniqueDates.includes(AppState.filterEndVal)) {
            AppState.filterEndVal = AppState.uniqueDates[AppState.uniqueDates.length - 1];
        }

        // Terapkan saringan rentang waktu sebelum dirender
        this.applyDateFilter();

        // Render UI
        UIManager.updateDateSelectors();
        UIManager.showTable();
        UIManager.renderTable();
    },

    applyDateFilter() {
        const startNum = Utils.parseDateToNumber(AppState.filterStartVal);
        const endNum = Utils.parseDateToNumber(AppState.filterEndVal);

        // Pencegahan error jika pengguna memilih Tanggal Awal > Tanggal Akhir
        if (startNum > endNum) {
            AppState.filterEndVal = AppState.filterStartVal;
            UIManager.updateDateSelectors(); // Paksa dropdown mereset ke angka valid
        }

        // Simpan hanya bulan-bulan yang berada di dalam rentang filter
        AppState.filteredDates = AppState.uniqueDates.filter(d => {
            const num = Utils.parseDateToNumber(d);
            return num >= Utils.parseDateToNumber(AppState.filterStartVal) && num <= Utils.parseDateToNumber(AppState.filterEndVal);
        });
    },

    generateSavePayload() {
        UIManager.saveCurrentInputsToState(); // Simpan yang belum sempat tercatat oleh listener

        const apiActions = [];
        const inputs = document.querySelectorAll('#table-body textarea');

        // Bentuk Payload Update / Add berdasar ketersediaan ID Data
        inputs.forEach(input => {
            const id = parseInt(input.dataset.id);
            const val = input.value.trim();

            if (id) {
                const original = AppState.allRecords.find(r => r.id === id);
                if (original && String(original[Config.colDesc] || '').trim() !== val) {
                    apiActions.push(['UpdateRecord', Config.tableId, id, { [Config.colDesc]: val }]);
                }
            } else if (val !== '') {
                apiActions.push(['AddRecord', Config.tableId, null, {
                    [Config.colDate]: input.dataset.date,
                    [Config.colCompany]: input.dataset.company,
                    [Config.colSKU]: input.dataset.sku,
                    [Config.colDesc]: val
                }]);
            }
        });
        return apiActions;
    }
};