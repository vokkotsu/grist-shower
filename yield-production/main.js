document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    if (document.documentElement.classList.contains('dark')) lightIcon.classList.remove('hidden');
    else darkIcon.classList.remove('hidden');

    btn.addEventListener('click', () => {
        darkIcon.classList.toggle('hidden');
        lightIcon.classList.toggle('hidden');
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    grist.ready({ requiredAccess: 'full' });

    grist.onRecords(records => {
        BusinessLogic.processIncomingRecords(records);
    });

    UIManager.els.addRowBtn.addEventListener('click', () => {
        BusinessLogic.addNewRow();
    });

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
            console.error(error);
            UIManager.setSaveBtnState('error');
            alert("Gagal menyimpan ke Grist: " + error.message);
        } finally {
            setTimeout(() => UIManager.setSaveBtnState('default'), 2000);
        }
    });
});