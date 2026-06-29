// config.js
const Config = {
    // Pengaturan Baca Data (Source)
    readTable: 'Table1',
    readColMetric: 'Metric', // Nama kolom di Table1

    // Pengaturan Tulis Data (Destination)
    writeTable: 'Tes',
    writeCols: {
        date: 'Tanggal',
        metric: 'metrik',
        value: 'value'
    }
};

const AppState = {
    allRecords: [],
    uniqueDates: [],
    uniqueMetrics: [],
    unsavedEdits: {}
};