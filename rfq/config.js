const Config = {
    tableId: 'Rfq_rft_metric__monthly2',
    colPeriode: 'periode',
    colSource: 'source',

    // Daftar lengkap kolom numerik OEE secara berurutan (Kiri ke Kanan)
    metricColumns: [
        { id: 'rfq', label: 'rfq', width: '90px' },
        { id: 'rft', label: 'rft', width: '90px' }
    ]
};

const AppState = {
    allRecords: [],
    uniqueSources: [], // Menyimpan daftar Dropdown Source
    unsavedEdits: {},
    newRecordCounter: 1
};