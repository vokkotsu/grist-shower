// main.js
// Entry-point (Titik mulai) untuk aplikasi. Menghubungkan Grist ke fungsi lokal.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Tombol Tema & Dropdown Tabel
    ThemeManager.init();
    UIManager.initTableSelector();

    // 2. Hubungkan & Minta Izin ke Grist
    grist.ready({ requiredAccess: 'full' });

    // FUNGSI BARU: Menarik data secara manual dari tabel mana saja melalui API
    const loadDataFromTable = async (tableId) => {
        try {
            UIManager.els.loadingText.innerText = `Memuat data dari tabel ${tableId.replace(/_/g, ' ')}...`;
            UIManager.els.loadingPanel.classList.remove('hidden');
            UIManager.els.tableContainer.classList.add('hidden');

            const records = await grist.docApi.fetchTable(tableId);
            AppState.unsavedEdits = {}; // Reset memori ketikan saat pindah tabel
            BusinessLogic.processIncomingRecords(records);
        } catch (error) {
            console.error("Gagal mengambil tabel:", error);
            UIManager.showError(`Gagal mengambil data dari tabel <b>${tableId}</b>. Pastikan ID Tabel tersebut benar dan tabel tidak kosong.`);
        }
    };

    // 3. Listener (Menerima Data Awal atau Auto-Refresh)
    grist.onRecords(() => {
        // Abaikan records otomatis bawaan Grist (karena kita punya multiple tables),
        // gunakan listener ini hanya sebagai pemicu untuk refresh tabel yang aktif.
        loadDataFromTable(Config.currentTableId);
    });

    // 4. Listener (Perubahan Dropdown Tabel)
    UIManager.els.tableSelector.addEventListener('change', (e) => {
        Config.currentTableId = e.target.value;
        loadDataFromTable(Config.currentTableId);
    });

    // 5. Listener (Menyimpan Data ke Grist)
    UIManager.els.saveBtn.addEventListener('click', async () => {
        const actions = BusinessLogic.generateSavePayload();

        if (actions.length === 0) {
            UIManager.setSaveBtnState('no-change');
            setTimeout(() => UIManager.setSaveBtnState('default'), 2000);
            return;
        }

        try {
            UIManager.setSaveBtnState('loading');
            await grist.docApi.applyUserActions(actions);
            AppState.unsavedEdits = {};
            UIManager.setSaveBtnState('success');
            // Setelah applyUserActions berhasil, Grist otomatis memicu onRecords()
            // sehingga layar akan me-refresh data (menghasilkan ID baru untuk AddRecord).
        } catch (error) {
            console.error("Grist API Error:", error);
            UIManager.setSaveBtnState('error');

            UIManager.els.errorModalMsg.innerText = error.message;
            UIManager.els.errorModal.classList.remove('hidden');
        } finally {
            setTimeout(() => UIManager.setSaveBtnState('default'), 2000);
        }
    });

    // 6. Listener (Perubahan Filter Rentang Tanggal)
    UIManager.els.filterStart.addEventListener('change', (e) => {
        UIManager.saveCurrentInputsToState();
        AppState.filterStartVal = e.target.value;
        BusinessLogic.applyDateFilter();
        UIManager.renderTable();
    });

    UIManager.els.filterEnd.addEventListener('change', (e) => {
        UIManager.saveCurrentInputsToState();
        AppState.filterEndVal = e.target.value;
        BusinessLogic.applyDateFilter();
        UIManager.renderTable();
    });
});