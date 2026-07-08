const Config = {
    tableId: 'Highlight__monthly',
    colPeriode: 'periode',
    colDepartment: 'department',

    // Daftar lengkap kolom numerik OEE secara berurutan (Kiri ke Kanan)
    metricColumns: [
        { id: 'subject', label: 'Subject', width: '90px' },
        { id: 'implication', label: 'Implication', width: '90px' },
        { id: 'action_plan', label: 'Action Plan', width: '90px' }
    ]
};

const AppState = {
    allRecords: [],
    uniqueDepartments: [], // Menyimpan daftar Dropdown Department
    unsavedEdits: {},
    newRecordCounter: 1
};