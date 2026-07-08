const Config = {
    tableId: 'Yield_Production_metric__monthly',
    colPeriode: 'periode',
    colDepartment: 'department',

    // Daftar lengkap kolom numerik OEE secara berurutan (Kiri ke Kanan)
    metricColumns: [
        { id: 'rm_powder', label: 'Quantity RM Powder (KG)', width: '90px' },
        { id: 'rm_oil', label: 'Quantity RM Oil (KG)', width: '90px' },
        { id: 'rm_glucose', label: 'Quantity RM Glucose (KG)', width: '90px' }
    ]
};

const AppState = {
    allRecords: [],
    uniqueDepartments: [], // Menyimpan daftar Dropdown Department
    unsavedEdits: {},
    newRecordCounter: 1
};