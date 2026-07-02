// config.js
// Berisi pengaturan referensi nama tabel dan kolom, serta state/memori internal aplikasi.
const Config = {
    tableId: 'Yoko_journey',          // Ganti dengan Table ID yang sesuai (Cek Raw Data di Grist)
    colCompany: 'Company_Name', // ID Kolom Nama Perusahaan
    colSKU: 'SKU_Grade',        // ID Kolom SKU / Grade
    colDate: 'Date',            // ID Kolom Tanggal/Bulan
    colDesc: 'Deskripsi'        // ID Kolom Catatan/Progress
};

const AppState = {
    allRecords: [],        // Kumpulan raw data dari Grist
    uniqueDates: [],       // Kumpulan bulan-bulan unik yang sudah terurut
    uniqueRowGroups: [],   // Gabungan antara Company Name & SKU untuk sisi kiri (Frozen Cols)
    unsavedEdits: {}       // State memori untuk menampung ketikan sementara
};