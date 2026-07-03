// main.js
// Entry-point (Titik mulai) untuk aplikasi. Menghubungkan Grist ke fungsi lokal.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Tombol Tema (Inisialisasi tabel selector dipindah ke bawah)
    ThemeManager.init();

    // 2. Hubungkan & Minta Izin ke Grist
    grist.ready({ requiredAccess: 'full' });

    let isAppReady = false;

    // FUNGSI BARU: Mencari semua tabel 'Journey' di Grist secara dinamis
    const fetchAvailableTables = async () => {
        try {
            UIManager.els.loadingText.innerText = "Memindai daftar tabel Journey...";
            UIManager.els.loadingPanel.classList.remove('hidden');

            // Mengakses tabel sistem internal Grist yang menyimpan daftar tabel
            const metaTable = await grist.docApi.fetchTable('_grist_Tables');
            if (metaTable && metaTable.tableId) {
                // Filter: Hanya ambil tabel yang namanya mengandung kata 'journey' (huruf besar/kecil bebas)
                const journeyTables = metaTable.tableId.filter(id => id.toLowerCase().includes('journey'));

                if (journeyTables.length > 0) {
                    Config.tables = journeyTables.sort(); // Urutkan sesuai abjad
                    // Jika tabel default tidak ada, gunakan tabel pertama yang ditemukan
                    if (!Config.tables.includes(Config.currentTableId)) {
                        Config.currentTableId = Config.tables[0];
                    }
                }
            }
        } catch (error) {
            console.error("Gagal membaca metadata Grist:", error);
            // Fallback (Cadangan) jika gagal membaca sistem Grist
            if (Config.tables.length === 0) Config.tables = [Config.currentTableId];
        }

        // Inisialisasi dropdown di UI setelah daftar tabel didapat
        UIManager.initTableSelector();
    };

    // FUNGSI BARU: Menarik data secara manual dari tabel mana saja melalui API
    const loadDataFromTable = async (tableId) => {
        try {
            UIManager.els.loadingText.innerText = `Memuat data dari tabel ${tableId.replace(/_/g, ' ')}...`;
            UIManager.els.loadingPanel.classList.remove('hidden');
            UIManager.els.tableContainer.classList.add('hidden');

            // Mengambil data menggunakan API (Format Kolom)
            const rawData = await grist.docApi.fetchTable(tableId);

            // PERBAIKAN: Konversi dari format "Kolom" ke format "Baris" agar bisa dibaca BusinessLogic
            const records = [];
            if (rawData && rawData.id) {
                const keys = Object.keys(rawData);
                for (let i = 0; i < rawData.id.length; i++) {
                    let row = {};
                    keys.forEach(k => row[k] = rawData[k][i]);
                    records.push(row);
                }
            }

            AppState.unsavedEdits = {}; // Reset memori ketikan saat pindah tabel
            BusinessLogic.processIncomingRecords(records);
        } catch (error) {
            console.error("Gagal mengambil tabel:", error);
            UIManager.showError(`Gagal mengambil data dari tabel <b>${tableId}</b>. Pastikan ID Tabel tersebut benar dan tabel tidak kosong.`);
        }
    };

    // 3. Listener (Menerima Data Awal atau Auto-Refresh)
    grist.onRecords(async () => {
        // Saat widget pertama kali dimuat, scan tabelnya terlebih dahulu
        if (!isAppReady) {
            isAppReady = true;
            await fetchAvailableTables();
        }

        // Tarik data dari tabel yang sedang aktif
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