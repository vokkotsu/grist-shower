// main.js
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();

    // Optimasi Dark Mode untuk semua Select
    document.querySelectorAll('select').forEach(select => {
        select.classList.remove('bg-transparent');
        select.classList.add('bg-white', 'dark:bg-gristDarkPanel', 'dark:text-white');
    });

    grist.ready({ requiredAccess: 'full' });

    // Fitur mematikan pilihan bulan lampau
    const updateFilterEndOptions = () => {
        if (!AppState.filterStartVal || !UIManager.els.filterEnd) return;
        const startNum = Utils.parseDateToNumber(AppState.filterStartVal);

        Array.from(UIManager.els.filterEnd.options).forEach(opt => {
            const optNum = Utils.parseDateToNumber(opt.value);
            if (optNum < startNum) {
                opt.disabled = true;
                opt.style.color = '#9ca3af';
            } else {
                opt.disabled = false;
                opt.style.color = '';
            }
        });
    };

    // Saat menerima data/refresh dari Grist, langsung lemparkan ke otak program
    grist.onRecords((records) => {
        BusinessLogic.processIncomingRecords(records);
        updateFilterEndOptions();
    });

    // Listener (Pilih Nama Orang / Journey)
    UIManager.els.nameSelector.addEventListener('change', (e) => {
        UIManager.saveCurrentInputsToState(); // Amankan ketikan
        AppState.currentNameFilter = e.target.value;

        // Reset filter tanggal agar bersih setiap ganti orang
        AppState.filterStartVal = null;
        AppState.filterEndVal = null;

        BusinessLogic.applyFiltersAndRender();
        updateFilterEndOptions();
    });

    // Listener Menyimpan Data
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
            // Data baru akan langsung dibroadcast balik oleh Grist ke grist.onRecords()
        } catch (error) {
            console.error("Grist API Error:", error);
            UIManager.setSaveBtnState('error');
            alert(error.message);
        } finally {
            setTimeout(() => UIManager.setSaveBtnState('default'), 2000);
        }
    });

    // Listener Rentang Tanggal
    UIManager.els.filterStart.addEventListener('change', (e) => {
        UIManager.saveCurrentInputsToState();
        AppState.filterStartVal = e.target.value;
        BusinessLogic.applyDateFilter();
        UIManager.renderTable();
        updateFilterEndOptions();
    });

    UIManager.els.filterEnd.addEventListener('change', (e) => {
        UIManager.saveCurrentInputsToState();
        AppState.filterEndVal = e.target.value;
        BusinessLogic.applyDateFilter();
        UIManager.renderTable();
        updateFilterEndOptions();
    });
});