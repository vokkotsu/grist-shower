const Config = {
    tableId: 'Highlight__monthly',
    colPeriode: 'periode',
    colDepartment: 'department',

    // Daftar lengkap kolom numerik OEE secara berurutan (Kiri ke Kanan)
    metricColumns: [
        { id: 'subject', label: 'subject', width: '90px' },
        { id: 'implication', label: 'implication', width: '90px' },
        { id: 'action_plan', label: 'action plan', width: '90px' }
    ]
};

const AppState = {
    allRecords: [],
    uniqueDepartments: [], // Menyimpan daftar Dropdown Department
    unsavedEdits: {},
    newRecordCounter: 1
};