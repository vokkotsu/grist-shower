// main.js
// Entry-point (Titik mulai) untuk aplikasi. Menghubungkan Grist ke fungsi lokal.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Tombol Tema
    ThemeManager.init();

    // PERBAIKAN UI: Optimasi Dark Mode untuk Dropdown (Select)
    document.querySelectorAll('select').forEach(select => {
        select.classList.remove('bg-transparent');
        select.classList.add('bg-white', 'dark:bg-gristDarkPanel', 'dark:text-white');
    });

    // 2. Hubungkan & Minta Izin ke Grist (Akses Penuh Wajib)
    grist.ready({ requiredAccess: 'full' });

    let isAppReady = false;

    // FUNGSI BARU: Mematikan (disable) pilihan bulan akhir yang lebih lampau dari bulan awal
    const updateFilterEndOptions = () => {
        if (!AppState.filterStartVal || !UIManager.els.filterEnd) return;

        const startNum = Utils.parseDateToNumber(AppState.filterStartVal);

        Array.from(UIManager.els.filterEnd.options).forEach(opt => {
            const optNum = Utils.parseDateToNumber(opt.value);
            // Jika tanggal opsi lebih kecil (sebelum) tanggal mulai, matikan opsi tersebut
            if (optNum < startNum) {
                opt.disabled = true;
                opt.style.color = '#9ca3af'; // Warnai abu-abu pudar
            } else {
                opt.disabled = false;
                opt.style.color = ''; // Kembalikan ke warna normal
            }
        });
    };

    // FUNGSI: Mencari semua tabel buatan pengguna di Grist secara dinamis
    const fetchAvailableTables = async () => {
        try {
            UIManager.els.loadingText.innerText = "Memindai daftar tabel di database...";
            UIManager.els.loadingPanel.classList.remove('hidden');

            const metaTable = await grist.docApi.fetchTable('_grist_Tables');
            if (metaTable && metaTable.tableId) {
                const userTables = metaTable.tableId.filter(id => !id.startsWith('_'));

                if (userTables.length > 0) {
                    Config.tables = userTables.sort();
                    if (!Config.tables.includes(Config.currentTableId)) {
                        Config.currentTableId = Config.tables[0];
                    }
                }
            }
        } catch (error) {
            console.error("Gagal membaca metadata Grist:", error);
            if (Config.tables.length === 0) Config.tables = [Config.currentTableId];
        }

        UIManager.initTableSelector();
    };

    // FUNGSI: Menarik data secara manual dari tabel mana saja melalui API
    const loadDataFromTable = async (tableId) => {
        try {
            UIManager.els.loadingText.innerText = `Memuat data dari tabel ${tableId.replace(/_/g, ' ')}...`;
            UIManager.els.loadingPanel.classList.remove('hidden');
            UIManager.els.tableContainer.classList.add('hidden');

            // 1. Mengambil data menggunakan API
            const rawData = await grist.docApi.fetchTable(tableId);

            // 2. Konversi Cerdas (Menangani format Kolom ATAU format Baris)
            let records = [];

            if (Array.isArray(rawData)) {
                // Jika Grist mengembalikan format Baris (Array of objects)
                records = rawData;
            } else if (rawData && rawData.id && Array.isArray(rawData.id)) {
                // Jika Grist mengembalikan format Kolom murni (Object of arrays)
                const keys = Object.keys(rawData);
                for (let i = 0; i < rawData.id.length; i++) {
                    let row = {};
                    keys.forEach(k => row[k] = rawData[k][i]);
                    records.push(row);
                }
            } else if (typeof rawData === 'object' && Object.keys(rawData).length > 0) {
                // Format fallback jika Grist memodifikasi struktur datanya
                const keys = Object.keys(rawData);
                const firstKey = keys[0];
                if (Array.isArray(rawData[firstKey])) {
                    for (let i = 0; i < rawData[firstKey].length; i++) {
                        let row = {};
                        keys.forEach(k => row[k] = rawData[k][i]);
                        records.push(row);
                    }
                }
            }

            // Validasi akhir jika konversi gagal menghasilkan apa pun namun rawData ada
            if (records.length === 0 && rawData !== null && rawData !== undefined) {
                console.warn("Raw Data diterima tapi tidak bisa dikonversi:", rawData);
            }

            AppState.unsavedEdits = {};

            // Kirim ke Logic
            BusinessLogic.processIncomingRecords(records);

            // Perbarui ketersediaan opsi dropdown "Sampai (End)" saat data baru dimuat
            updateFilterEndOptions();

        } catch (error) {
            console.error("Gagal mengambil tabel:", error);

            // Menampilkan log error ASLI dari sistem ke layar UI
            UIManager.showError(
                `<div class="text-left">
                    <p class="font-bold text-red-600 mb-2">Gagal memproses tabel: <u>${tableId}</u></p>
                    <p class="text-xs text-gray-600 mb-1">Pesan Error Sistem:</p>
                    <div class="bg-red-50 p-2 rounded text-xs font-mono border border-red-200 text-red-800 break-words">
                        ${error.name || 'Error'}: ${error.message || JSON.stringify(error)}
                    </div>
                    <p class="text-xs mt-3">Silakan tangkap layar (screenshot) pesan merah di atas jika masih bingung.</p>
                </div>`
            );
        }
    };

    // 3. Listener (Menerima Data Awal atau Auto-Refresh)
    grist.onRecords(async () => {
        if (!isAppReady) {
            isAppReady = true;
            await fetchAvailableTables();
        }
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
        updateFilterEndOptions(); // Kunci opsi kadaluwarsa saat Start berubah
    });

    UIManager.els.filterEnd.addEventListener('change', (e) => {
        UIManager.saveCurrentInputsToState();
        AppState.filterEndVal = e.target.value;
        BusinessLogic.applyDateFilter();
        UIManager.renderTable();
        updateFilterEndOptions();
    });
});