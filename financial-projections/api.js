grist.ready({ requiredAccess: 'full' });

grist.onRecords(async function (records) {
    const loadingDiv = document.getElementById('loading');
    const errorBox = document.getElementById('error-box');
    const tableContainer = document.getElementById('table-container');

    loadingDiv.classList.remove('hidden');
    tableContainer.classList.add('hidden');
    errorBox.classList.add('hidden');

    try {
        const refData = await grist.docApi.fetchTable(CONFIG.refTableId);
        if (refData && refData[CONFIG.refColMetric]) {
            const metricCol = refData[CONFIG.refColMetric];
            const visibilityCol = refData[CONFIG.refColVisibility];
            const orderCol = refData[CONFIG.refColOrder];

            let validMetrics = [];
            for (let i = 0; i < metricCol.length; i++) {
                const metricName = metricCol[i];
                const visibility = visibilityCol && visibilityCol[i] ? String(visibilityCol[i]).trim().toLowerCase() : '';
                const order = orderCol && orderCol[i] ? Number(orderCol[i]) : 9999;

                if (metricName && visibility !== 'hidden') {
                    validMetrics.push({ name: metricName, order: order });
                }
            }
            validMetrics.sort((a, b) => a.order - b.order);
            uniqueMetrics = [...new Set(validMetrics.map(m => m.name))];
        } else {
            uniqueMetrics = [...DEFAULT_METRICS_FOR_EMPTY_TABLE];
        }
    } catch (error) {
        console.error(`Gagal mengambil metrik dari tabel ${CONFIG.refTableId}:`, error);
        if (uniqueMetrics.length === 0) uniqueMetrics = [...DEFAULT_METRICS_FOR_EMPTY_TABLE];
    }

    if (!records || records.length === 0) {
        allRecords = [];
    } else {
        const sampleRecord = records[0];
        if (!(CONFIG.colDate in sampleRecord) || !(CONFIG.colMetric in sampleRecord) || !(CONFIG.colValue in sampleRecord)) {
            errorBox.innerHTML = `<b>Error Konfigurasi Kolom</b>`;
            errorBox.classList.remove('hidden');
            loadingDiv.classList.add('hidden');
            return;
        }
        allRecords = records;
    }

    // Ekstrak semua tahun yang ada di database
    const incomingDates = [...new Set(allRecords.map(r => parseGristDate(r[CONFIG.colDate])))].filter(Boolean);
    let yearsInData = new Set();
    incomingDates.forEach(d => {
        const parts = d.split(' ');
        if (parts.length >= 2) yearsInData.add(2000 + parseInt(parts[1]));
    });

    // Tambahkan tahun saat ini dan beberapa tahun ke depan untuk proyeksi
    let currentYr = new Date().getFullYear();
    yearsInData.add(currentYr - 1);
    yearsInData.add(currentYr);
    yearsInData.add(currentYr + 1);
    yearsInData.add(currentYr + 2);
    yearsInData.add(currentYr + 3);

    // Update Dropdown UI
    const yearSelector = document.getElementById('year-selector');
    yearSelector.innerHTML = '';
    Array.from(yearsInData).sort().forEach(y => {
        let opt = document.createElement('option');
        opt.value = y;
        opt.innerText = y;
        if (y === activeYear) opt.selected = true;
        yearSelector.appendChild(opt);
    });

    // Tetapkan uniqueDates berdasarkan activeYear yang dipilih
    uniqueDates = monthNamesShort.map(m => m + ' ' + String(activeYear).slice(-2));

    loadingDiv.classList.add('hidden');
    tableContainer.classList.remove('hidden');
    renderTable();
});

document.getElementById('save-btn').addEventListener('click', async () => {
    const saveBtn = document.getElementById('save-btn');
    const originalContent = saveBtn.innerHTML;

    saveBtn.innerHTML = `Menyimpan...`;
    saveBtn.disabled = true;
    saveBtn.className = "bg-gray-400 text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center shadow-sm cursor-not-allowed";

    let emptyRecords = allRecords.filter(r =>
        (!r[CONFIG.colDate] || parseGristDate(r[CONFIG.colDate]) === '') &&
        (!r[CONFIG.colMetric] || String(r[CONFIG.colMetric]).trim() === '') &&
        (r[CONFIG.colValue] === null || String(r[CONFIG.colValue]).trim() === '')
    );
    emptyRecords.sort((a, b) => a.id - b.id);

    const inputs = document.querySelectorAll('#table-body input');
    const apiActions = [];

    inputs.forEach(input => {
        const id = parseInt(input.dataset.id);
        const uiDate = input.dataset.date;
        const metric = input.dataset.metric;
        let val = input.value.trim();

        if (!id && val === '') return;

        const numericVal = Number(val);
        const finalVal = isNaN(numericVal) || val === '' ? val : numericVal;
        const gristDateStr = toGristDateString(uiDate);

        if (id) {
            const originalRecord = allRecords.find(r => r.id === id);
            if (originalRecord && String(originalRecord[CONFIG.colValue]) !== String(val)) {
                apiActions.push(['UpdateRecord', CONFIG.tableId, id, { [CONFIG.colValue]: finalVal }]);
            }
        } else {
            if (emptyRecords.length > 0) {
                const recycledRow = emptyRecords.shift();
                apiActions.push(['UpdateRecord', CONFIG.tableId, recycledRow.id, {
                    [CONFIG.colDate]: gristDateStr, [CONFIG.colMetric]: metric, [CONFIG.colValue]: finalVal
                }]);
            } else {
                apiActions.push(['AddRecord', CONFIG.tableId, null, {
                    [CONFIG.colDate]: gristDateStr, [CONFIG.colMetric]: metric, [CONFIG.colValue]: finalVal
                }]);
            }
        }
    });

    if (apiActions.length === 0) {
        saveBtn.innerHTML = 'Tidak ada perubahan';
        saveBtn.className = "bg-yellow-500 text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center shadow-sm";
        setTimeout(() => resetBtn(saveBtn, originalContent), 2000);
        return;
    }

    try {
        await grist.docApi.applyUserActions(apiActions);
        unsavedEdits = {};
        saveBtn.innerHTML = `Tersimpan`;
        saveBtn.className = "bg-[#16b378] text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center gap-1.5 shadow-sm";
    } catch (error) {
        console.error("Gagal menyimpan:", error);
        saveBtn.innerHTML = 'Gagal Disimpan';
        saveBtn.className = "bg-red-600 text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center shadow-sm";
        alert("Kesalahan API saat menyimpan: " + error.message);
    } finally {
        setTimeout(() => resetBtn(saveBtn, originalContent), 2000);
    }
});