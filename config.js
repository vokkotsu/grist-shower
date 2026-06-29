const CONFIG = {
    tableId: 'Tes',
    colDate: 'Tanggal',
    colMetric: 'metrik',
    colValue: 'value',
    refTableId: 'Table1',
    refColMetric: 'Metric',
    refColVisibility: 'Visibility',
    refColOrder: 'Order'
};

const DEFAULT_METRICS_FOR_EMPTY_TABLE = ['qty', 'revenue', 'cogs'];
const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// State Data Global (Bisa diakses oleh semua file JS lain)
let allRecords = [];
let uniqueDates = [];
let uniqueMetrics = [];
let unsavedEdits = {};