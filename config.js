// config.js
const Config = {
    tableId: 'Table1', // Diubah dari 'Tes' ke 'Table1' agar sesuai dengan sumber data
    colDate: 'Tanggal',
    colMetric: 'Metric', // Diubah menjadi 'Metric' sesuai permintaan Anda
    colValue: 'value',
    defaultMetrics: ['Qty', 'Revenue from sales', 'COGS', 'Gross Profit'] // Sesuaikan dengan isi Metrics.csv Anda
};

const AppState = {
    allRecords: [],
    uniqueDates: [],
    uniqueMetrics: [],
    unsavedEdits: {}
};