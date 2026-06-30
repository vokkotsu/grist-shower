// main.js
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi event listener tema gelap
    UI.initTheme();

    // Inisialisasi API Grist
    grist.ready({ requiredAccess: 'read table' });

    // Dengarkan perubahan data masuk
    grist.onRecords(records => {
        if (records && records.length > 0) {
            PivotLogic.processRecords(records);
        } else {
            UI.showError('Tidak ada data untuk ditampilkan.');
        }
    });
});