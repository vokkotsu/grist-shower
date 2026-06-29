const CONFIG = {
    tableId: 'Data_Outlook',
    colDate: 'Tanggal',
    colMetric: 'metrik',
    colValue: 'value',
    refTableId: 'Metrics',
    refColMetric: 'Metric',
    refColVisibility: 'Visibility',
    refColOrder: 'Order'
};

const DEFAULT_METRICS_FOR_EMPTY_TABLE = ['qty', 'revenue', 'cogs'];
const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// State Data Global
let allRecords = [];
let uniqueDates = [];
let uniqueMetrics = [];
let unsavedEdits = {};

// Default tahun berjalan (akan diupdate oleh API dan UI)
let activeYear = new Date().getFullYear();