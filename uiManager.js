// uiManager.js
const UIManager = {
    els: {
        loadingPanel: document.getElementById('loading-panel'),
        tableContainer: document.getElementById('table-container'),
        errorBox: document.getElementById('error-box'),
        thead: document.getElementById('table-head'),
        tbody: document.getElementById('table-body'),
        saveBtn: document.getElementById('save-btn'),
        addMonthBtn: document.getElementById('add-month-btn')
    },

    showError(msg) {
        this.els.errorBox.innerHTML = msg;
        this.els.errorBox.classList.remove('hidden');
        this.els.loadingPanel.classList.remove('hidden');
        this.els.tableContainer.classList.add('hidden');
    },

    showTable() {
        this.els.loadingPanel.classList.add('hidden');
        this.els.errorBox.classList.add('hidden');
        this.els.tableContainer.classList.remove('hidden');
    },

    saveCurrentInputsToState() {
        const inputs = document.querySelectorAll('#table-body input');
        inputs.forEach(input => {
            AppState.unsavedEdits[`${input.dataset.metric}|${input.dataset.date}`] = input.value;
        });
    },

    setSaveBtnState(state) {
        const btn = this.els.saveBtn;
        if (state === 'loading') {
            btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menyimpan...`;
            btn.disabled = true;
            btn.className = "bg-gray-400 text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center shadow-sm cursor-not-allowed";
        } else if (state === 'no-change') {
            btn.innerHTML = 'Tidak ada perubahan';
            btn.className = "bg-yellow-500 text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center shadow-sm";
        } else if (state === 'success') {
            btn.innerHTML = `<svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> Tersimpan`;
            btn.className = "bg-[#16b378] text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center shadow-sm";
        } else if (state === 'error') {
            btn.innerHTML = 'Gagal Disimpan';
            btn.className = "bg-red-600 text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center shadow-sm";
        } else {
            btn.innerHTML = `<svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> Simpan Perubahan`;
            btn.disabled = false;
            btn.className = "bg-[#16b378] hover:bg-[#139a67] text-white font-medium py-1.5 px-3 rounded text-[13px] transition duration-150 flex items-center shadow-sm";
        }
    },

    renderTable() {
        this.els.thead.innerHTML = '';
        this.els.tbody.innerHTML = '';

        let thFirst = document.createElement('th');
        thFirst.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-2 text-left min-w-[200px] z-30 sticky left-0 transition-colors duration-200";
        thFirst.innerText = "IS in thousand USD";
        this.els.thead.appendChild(thFirst);

        AppState.uniqueDates.forEach(date => {
            let th = document.createElement('th');
            th.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-2 text-center min-w-[120px] transition-colors duration-200";
            th.innerText = date;
            this.els.thead.appendChild(th);
        });

        AppState.uniqueMetrics.forEach(metric => {
            let tr = document.createElement('tr');

            let tdMetric = document.createElement('td');
            tdMetric.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#262633] dark:text-gristDarkText text-[13px] font-medium border border-[#d9d9d9] dark:border-gristDarkBorder p-2 sticky left-0 z-10 capitalize transition-colors duration-200";
            tdMetric.innerText = metric;
            tr.appendChild(tdMetric);

            AppState.uniqueDates.forEach(date => {
                let td = document.createElement('td');
                td.className = "p-0 relative h-full border border-[#d9d9d9] dark:border-gristDarkBorder bg-white dark:bg-gristDarkBg transition-colors duration-200";

                let matched = AppState.allRecords.find(r =>
                    String(r[Config.colMetric]).trim() === String(metric).trim() &&
                    DateUtil.parse(r[Config.colDate]) === date
                );
                let val = matched && matched[Config.colValue] !== null ? matched[Config.colValue] : '';
                let recordId = matched ? matched.id : '';

                const editKey = `${metric}|${date}`;
                if (AppState.unsavedEdits[editKey] !== undefined) val = AppState.unsavedEdits[editKey];

                let input = document.createElement('input');
                input.type = 'text';
                input.className = "w-full h-full min-h-[32px] px-2 absolute inset-0 font-mono text-right text-[13px] text-[#262633] dark:text-gristDarkText bg-transparent focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#1f78d1] focus:bg-blue-50/30 dark:focus:bg-[#1f78d1]/20 focus:z-20 transition-none";
                input.value = val;
                input.dataset.id = recordId;
                input.dataset.date = date;
                input.dataset.metric = metric;

                td.appendChild(input);
                tr.appendChild(td);
            });
            this.els.tbody.appendChild(tr);
        });
    }
};
