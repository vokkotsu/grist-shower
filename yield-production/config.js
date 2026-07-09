const Config = {
    tableId: 'Yield_Production_metric__monthly',
    colPeriode: 'periode',
    colSource: 'source',

    // Daftar lengkap kolom numerik OEE secara berurutan (Kiri ke Kanan)
    metricColumns: [
        { id: 'rm_powder', label: 'rm powder', width: '90px' },
        { id: 'rm_oil', label: 'rm oil', width: '90px' },
        { id: 'rm_glucose', label: 'rm glucose', width: '90px' }
    ]
};

const AppState = {
    allRecords: [],
    uniqueSources: [], // Menyimpan daftar Dropdown Source
    unsavedEdits: {},
    newRecordCounter: 1
};