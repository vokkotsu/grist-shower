// config.js
const Config = {
    tableId: 'Journey',         // Menggunakan tabel tunggal "Journey"
    colName: 'Nama',            // Kolom untuk membedakan data per dropdown
    colCompany: 'Company_Name',
    colSKU: 'SKU_Grade',
    colDate: 'Date',
    colDesc: 'Deskripsi'
};

const AppState = {
    allRecords: [],
    filteredRecords: [],   // Data yang sudah disaring berdasarkan Nama yang dipilih
    uniqueNames: [],       // Daftar nama-nama orang yang tersedia di database
    currentNameFilter: '', // Menyimpan nama yang sedang aktif di layar
    uniqueDates: [],
    filteredDates: [],
    uniqueRowGroups: [],
    unsavedEdits: {},
    filterStartVal: null,
    filterEndVal: null
};