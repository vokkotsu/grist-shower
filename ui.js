function renderTable() {
    const theadRow = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');
    theadRow.innerHTML = '';
    tbody.innerHTML = '';

    let thFirst = document.createElement('th');
    thFirst.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-2 text-left min-w-[200px] z-30 sticky left-0 transition-colors duration-200";
    thFirst.innerText = "IS in thousand USD";
    theadRow.appendChild(thFirst);

    // Header Tanggal (Disesuaikan dengan activeYear)
    uniqueDates.forEach(date => {
        let th = document.createElement('th');
        th.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-2 text-center min-w-[120px] transition-colors duration-200";
        th.innerText = date;
        theadRow.appendChild(th);
    });

    uniqueMetrics.forEach(metric => {
        let tr = document.createElement('tr');
        let tdMetric = document.createElement('td');
        tdMetric.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#262633] dark:text-gristDarkText text-[13px] font-medium border border-[#d9d9d9] dark:border-gristDarkBorder p-2 sticky left-0 z-10 capitalize transition-colors duration-200";
        tdMetric.innerText = metric;
        tr.appendChild(tdMetric);

        uniqueDates.forEach(date => {
            let td = document.createElement('td');
            td.className = "p-0 relative h-full border border-[#d9d9d9] dark:border-gristDarkBorder bg-white dark:bg-gristDarkBg transition-colors duration-200";

            let matchedRecord = allRecords.find(r => r[CONFIG.colMetric] === metric && parseGristDate(r[CONFIG.colDate]) === date);
            let val = matchedRecord && matchedRecord[CONFIG.colValue] !== null ? matchedRecord[CONFIG.colValue] : '';
            let recordId = matchedRecord ? matchedRecord.id : '';

            const editKey = `${metric}|${date}`;
            if (unsavedEdits[editKey] !== undefined) {
                val = unsavedEdits[editKey];
            }

            let input = document.createElement('input');
            input.type = 'text';
            input.className = "w-full h-full min-h-[32px] px-2 absolute inset-0 font-mono text-right text-[13px] text-[#262633] dark:text-gristDarkText bg-transparent focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#1f78d1] focus:bg-blue-50/30 dark:focus:bg-[#1f78d1]/20 focus:z-20 transition-none";
            input.value = val;
            input.dataset.id = recordId;
            input.dataset.date = date;
            input.dataset.metric = metric;

            input.addEventListener('input', (e) => {
                unsavedEdits[`${metric}|${date}`] = e.target.value;
            });

            td.appendChild(input);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

// Fitur Toggle Tahun (Merender ulang tabel saat tahun diganti)
document.getElementById('year-selector').addEventListener('change', (e) => {
    activeYear = parseInt(e.target.value);
    // Perbarui uniqueDates dengan format tahun yang baru dipilih (misal: "Jan 25")
    uniqueDates = monthNamesShort.map(m => m + ' ' + String(activeYear).slice(-2));
    renderTable();
});

// Fitur Toggle Dark Mode
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleDarkIcon = document.getElementById('theme-toggle-dark-icon');
const themeToggleLightIcon = document.getElementById('theme-toggle-light-icon');

if (document.documentElement.classList.contains('dark')) {
    themeToggleLightIcon.classList.remove('hidden');
} else {
    themeToggleDarkIcon.classList.remove('hidden');
}

themeToggleBtn.addEventListener('click', function () {
    themeToggleDarkIcon.classList.toggle('hidden');
    themeToggleLightIcon.classList.toggle('hidden');
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('color-theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('color-theme', 'dark');
    }
});