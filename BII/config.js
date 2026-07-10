// config.js
const Config = {
    // --- KONFIGURASI TABEL 1 (TABEL UTAMA) ---
    tableId: 'Journey',         // Mengikuti acuan repo BII
    colPIC: 'Nama',             // ID Kolom untuk PIC Sales
    colCompany: 'Company_Name', // ID Kolom untuk Customer/Klien
    colSKU: 'SKU_Grade',        // ID Kolom untuk Produk
    colDate: 'Date',            // ID Kolom Periode
    colDesc: 'Deskripsi',       // ID Kolom Detail Update

    // --- KONFIGURASI TABEL 2 (LOG/RIWAYAT) ---
    table2Id: 'RnD_Task_Log',
    t2ColName: 'PIC_Terkait',
    t2ColCompany: 'Klien',
    t2ColSKU: 'Produk_Fokus',
    t2ColDate: 'Bulan_Laporan',
    t2ColValue: 'Feedback_Klien'
};

const AppState = {
    picMap: new Map(),      // Relasi PIC -> Daftar "Customer — Product"
    cpDataMap: new Map(),   // Memetakan kembali teks gabungan ke masing-masing Company & SKU asli
    isSubmitting: false
};