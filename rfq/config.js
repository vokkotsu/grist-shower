const Config = {
    tableId: 'Rfq_rft_metric__monthly',
    colPeriode: 'periode',
    colSource: 'source',

    // Daftar lengkap kolom numerik OEE secara berurutan (Kiri ke Kanan)
    metricColumns: [
        { id: 'rm_powder', label: 'Quantity RM Powder (KG)', width: '90px' },
        { id: 'rm_oli', label: 'Quantity RM Oil (KG)', width: '90px' },
    ]
};

const AppState = {
    allRecords: [],
    uniqueSources: [], // Menyimpan daftar Dropdown Source
    unsavedEdits: {},
    newRecordCounter: 1
};