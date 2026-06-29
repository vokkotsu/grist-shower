// gristApi.js
const GristAPI = {
    init() {
        grist.ready({ requiredAccess: 'full' });
        grist.onRecords(records => BusinessLogic.processIncomingRecords(records));
    },

    async saveChanges() {
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
    }
};