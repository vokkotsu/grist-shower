// main.js
// Entry-point (Titik mulai) untuk aplikasi. Menghubungkan Grist ke fungsi lokal.
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inisialisasi Tombol Tema
    ThemeManager.init();

    // 2. Hubungkan & Minta Izin ke Grist
    grist.ready({ requiredAccess: 'full' });

    // 3. Listener (Menerima Data)
    grist.onRecords(records => {
        BusinessLogic.processIncomingRecords(records);
    });

    // 4. Listener (Menyimpan Data ke Grist)
    UIManager.els.saveBtn.addEventListener('click', async () => {
        const actions = BusinessLogic.generateSavePayload();

        if (actions.length === 0) {
            UIManager.setSaveBtnState('no-change');
            setTimeout(() => UIManager.setSaveBtnState('default'), 2000);
            return;
        }

        try {
            UIManager.setSaveBtnState('loading');
            await grist.docApi.applyUserActions(actions); // <-- Eksekusi API
            AppState.unsavedEdits = {}; // Bersihkan cache jika sukses
            UIManager.setSaveBtnState('success');
        } catch (error) {
            console.error("Grist API Error:", error);
            UIManager.setSaveBtnState('error');

            // Mengirim pesan ke modal dialog khusus error API
            UIManager.els.errorModalMsg.innerText = error.message;
            UIManager.els.errorModal.classList.remove('hidden');
        } finally {
            setTimeout(() => UIManager.setSaveBtnState('default'), 2000);
        }
    });

    // 5. Listener (Perubahan Filter Rentang Tanggal)
    UIManager.els.filterStart.addEventListener('change', (e) => {
        UIManager.saveCurrentInputsToState(); // Merekam cache/teks yang baru diketik sebelum tabel menghilang/refresh
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