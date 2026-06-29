// config.js
const Config = {
    // Tabel untuk membaca Master Metrik
    sourceTable: 'Table1',
    readColMetric: 'Metric', // Kolom di Table1

    // Tabel untuk menyimpan data input
    destTable: 'Tes',
    writeColMetric: 'metrik', // Kolom di Tes
    colDate: 'Tanggal',
    colValue: 'value'
};

const AppState = {
    allRecords: [], // Data dari tabel Tes
    masterMetrics: [], // Data metrik dari Table1
    uniqueDates: [],
    uniqueMetrics: [],
    unsavedEdits: {}
};