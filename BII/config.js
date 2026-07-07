// config.js
const Config = {
    // --- KONFIGURASI TABEL 1 (TABEL UTAMA) ---
    tableId: 'Journey',         // Tetap menggunakan 'Journey'
    colName: 'Nama',            // Tetap menggunakan 'Nama'
    colCompany: 'Company_Name', // Tetap menggunakan 'Company_Name'
    colSKU: 'SKU_Grade',        // Tetap menggunakan 'SKU_Grade'
    colDate: 'Date',            // Tetap menggunakan 'Date'
    colDesc: 'Deskripsi',       // Tetap menggunakan 'Deskripsi'

    // --- KONFIGURASI TABEL 2 (LOG/RIWAYAT) ---
    table2Id: 'RnD_Task_Log',       // ID Tabel Kedua
    t2ColName: 'PIC_Terkait',       // Kolom Nama di tabel 2
    t2ColCompany: 'Klien',          // Kolom Klien di tabel 2
    t2ColSKU: 'Produk_Fokus',       // Kolom Produk di tabel 2
    t2ColDate: 'Bulan_Laporan',     // Kolom Bulan di tabel 2
    t2ColValue: 'Feedback_Klien'    // Kolom Instruksi/Feedback di tabel 2
};

const AppState = {
    allRecords: [],
    filteredRecords: [],
    uniqueNames: [],
    currentNameFilter: '',
    uniqueDates: [],
    filteredDates: [],
    uniqueRowGroups: [],
    unsavedEdits: {},
    filterStartVal: null,
    filterEndVal: null
};