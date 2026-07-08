const Config = {
    tableId: 'Oee_metric__monthy',
    colPeriode: 'periode',
    colSource: 'source',

    // Daftar lengkap kolom numerik OEE secara berurutan (Kiri ke Kanan)
    metricColumns: [
        { id: 'days_per_month', label: 'Days/Mo', width: '90px' },
        { id: 'idle_time', label: 'Idle (Hrs)', width: '90px' },
        { id: 'holiday', label: 'Holiday (Hrs)', width: '100px' },
        { id: 'cip', label: 'CIP (Hrs)', width: '90px' },
        { id: 'maintenance', label: 'Maint (Hrs)', width: '90px' },
        { id: 'unplanned_down', label: 'Unplan Down', width: '100px' },
        { id: 'production_time', label: 'Prod Time', width: '100px' },
        { id: 'machine_capacity', label: 'Mach Cap', width: '100px' },
        { id: 'budget_production', label: 'Budget Prod', width: '100px' },
        { id: 'actual_production', label: 'Act Prod', width: '100px' },
        { id: 'ndc_equivalent', label: 'NDC Equiv', width: '100px' },
        { id: 'total_productivity', label: 'Total Prod', width: '100px' },
        { id: 'correction', label: 'Correction', width: '90px' },
        { id: 'block_stock', label: 'Block Stock', width: '100px' },
        { id: 'reject', label: 'Reject', width: '90px' },
        { id: 'effective_days', label: 'Eff Days', width: '90px' },
        { id: 'available_time', label: 'Avail Time', width: '100px' },
        { id: 'production_time_effective', label: 'Prod Time Eff', width: '110px' },
        { id: 'time_available_rate', label: 'Time Avail %', width: '110px', isHighlight: true },
        { id: 'performance_rate', label: 'Perform %', width: '100px', isHighlight: true },
        { id: 'quality_rate', label: 'Quality %', width: '100px', isHighlight: true },
        { id: 'oee', label: 'OEE %', width: '100px', isHighlight: true }
    ]
};

const AppState = {
    allRecords: [],
    uniqueSources: [], // Menyimpan daftar Dropdown Source
    unsavedEdits: {},
    newRecordCounter: 1
};