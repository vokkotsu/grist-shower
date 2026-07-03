// config.js
// Berisi pengaturan referensi nama tabel dan kolom, serta state/memori internal aplikasi.
const Config = {
    // Daftar tabel akan diisi otomatis dari hasil scan database Grist
    tables: [],
    currentTableId: 'Journey',  // Tabel default saat widget pertama dimuat

    colCompany: 'Company_Name', // ID Kolom Nama Perusahaan
    colSKU: 'SKU_Grade',        // ID Kolom SKU / Grade
    colDate: 'Date',            // ID Kolom Tanggal/Bulan
    colDesc: 'Deskripsi'        // ID Kolom Catatan/Progress
};

const AppState = {
    allRecords: [],
    uniqueDates: [],
    filteredDates: [],
    uniqueRowGroups: [],
    unsavedEdits: {},
    filterStartVal: null,
    filterEndVal: null
};