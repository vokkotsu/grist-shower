// pivotLogic.js
const PivotLogic = {
    processRecords(records) {
        const pivotData = {};
        const yearsSet = new Set();
        const metricsSet = new Set();
        const grandTotalsByYear = {};
        let grandTotalAll = 0;

        // 1. Ekstrak dan Hitung Agregasi
        records.forEach(r => {
            const metric = r[CONFIG.colMetric];
            const rawDate = r[CONFIG.colDate];
            const value = Number(r[CONFIG.colValue]) || 0;

            if (!metric) return;

            const year = Utils.extractYear(rawDate);
            yearsSet.add(year);
            metricsSet.add(metric);

            // Inisialisasi object
            if (!pivotData[metric]) pivotData[metric] = { Total: 0 };
            if (!pivotData[metric][year]) pivotData[metric][year] = 0;
            if (!grandTotalsByYear[year]) grandTotalsByYear[year] = 0;

            // Kalkulasi SUM
            pivotData[metric][year] += value;
            pivotData[metric].Total += value;
            grandTotalsByYear[year] += value;
            grandTotalAll += value;
        });

        // 2. Urutkan Kolom dan Baris
        const sortedYears = Array.from(yearsSet).sort();
        const sortedMetrics = Array.from(metricsSet).sort();

        // 3. Picu UI untuk render
        UI.renderPivotTable(pivotData, sortedYears, sortedMetrics, grandTotalsByYear, grandTotalAll);
        UI.showTable();
    }
};