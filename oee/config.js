const Config = {
    tableId: 'Oee_metric__monthy',
    colPeriode: 'periode',
    colSource: 'source',

    // Daftar lengkap kolom numerik OEE
    metricColumns: [
        { id: 'days_per_month', label: 'days per month', width: '90px' },
        { id: 'idle_time', label: 'dle_time', width: '90px' },
        { id: 'holiday', label: 'holiday', width: '100px' },
        { id: 'cip', label: 'cip', width: '90px' },
        { id: 'maintenance', label: 'maintenance', width: '90px' },
        { id: 'unplanned_down', label: 'unplanned down', width: '100px' },
        { id: 'production_time', label: 'production time', width: '100px' },
        { id: 'machine_capacity', label: 'machine capacity', width: '100px' },
        { id: 'budget_production', label: 'budget production', width: '100px' },
        { id: 'actual_production', label: 'actual production', width: '100px' },
        { id: 'ndc_equivalent', label: 'ndc equivalent', width: '100px' },
        { id: 'total_productivity', label: 'total productivity', width: '100px' },
        { id: 'correction', label: 'correction', width: '90px' },
        { id: 'block_stock', label: 'block stock', width: '100px' },
        { id: 'reject', label: 'reject', width: '90px' },
        { id: 'effective_days', label: 'effective days', width: '90px' },
        { id: 'available_time', label: 'available time', width: '100px' },
        { id: 'production_time_effective', label: 'production time effective', width: '110px' },
        { id: 'time_available_rate', label: 'time available rate', width: '110px', isHighlight: true },
        { id: 'performance_rate', label: 'performance rate', width: '100px', isHighlight: true },
        { id: 'quality_rate', label: 'quality rate', width: '100px', isHighlight: true },
        { id: 'oee', label: 'oee', width: '100px', isHighlight: true }
    ]
};

const AppState = {
    allRecords: [],
    uniqueSources: [],
    unsavedEdits: {},
    newRecordCounter: 1
};