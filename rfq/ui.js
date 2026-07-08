const UIManager = {
    els: {
        loadingPanel: document.getElementById('loading-panel'),
        tableContainer: document.getElementById('table-container'),
        errorBox: document.getElementById('error-box'),
        thead: document.getElementById('table-head'),
        tbody: document.getElementById('table-body'),
        saveBtn: document.getElementById('save-btn'),
        addRowBtn: document.getElementById('add-row-btn')
    },

    showError(msg) {
        this.els.errorBox.innerHTML = msg;
        this.els.errorBox.classList.remove('hidden');
        this.els.loadingPanel.classList.remove('hidden');
        this.els.tableContainer.classList.add('hidden');
    },

    setSaveBtnState(state) {
        const btn = this.els.saveBtn;
        if (state === 'loading') {
            btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle></svg> Menyimpan...`;
            btn.className = "bg-gray-400 text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center shadow-sm cursor-not-allowed pointer-events-none";
        } else if (state === 'no-change') {
            btn.innerHTML = 'Tidak ada perubahan';
            btn.className = "bg-yellow-500 text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center shadow-sm pointer-events-none";
        } else if (state === 'success') {
            btn.innerHTML = `<svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> Tersimpan`;
            btn.className = "bg-[#16b378] text-white font-medium py-1.5 px-3 rounded text-[13px] flex items-center shadow-sm pointer-events-none";
        } else {
            btn.innerHTML = `<svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> Simpan Perubahan`;
            btn.className = "bg-[#16b378] hover:bg-[#139a67] text-white font-medium py-1.5 px-3 rounded text-[13px] transition duration-150 flex items-center shadow-sm";
        }
    },

    renderTable() {
        this.els.thead.innerHTML = '';
        this.els.tbody.innerHTML = '';

        // --- HEADER ---
        // 1. Kolom Periode (Dilebarkan ke 180px)
        let thPeriode = document.createElement('th');
        thPeriode.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-2 text-center min-w-[180px] w-[180px] sticky left-0 z-40 transition-colors duration-200";
        thPeriode.innerText = "Periode";
        this.els.thead.appendChild(thPeriode);

        // 2. Kolom Source (Dilebarkan ke 220px, offset sticky diubah ke 180px)
        let thSource = document.createElement('th');
        thSource.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-2 text-left min-w-[220px] w-[220px] sticky left-[180px] sticky-shadow z-40 transition-colors duration-200";
        thSource.innerText = "Source";
        this.els.thead.appendChild(thSource);

        // 3. Header Metrik Dinamis
        Config.metricColumns.forEach(metric => {
            let th = document.createElement('th');
            th.className = `bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-2 text-right z-30 transition-colors duration-200 ${metric.isHighlight ? 'text-blue-600 dark:text-blue-400' : ''}`;
            th.style.minWidth = metric.width;
            th.innerText = metric.label;
            this.els.thead.appendChild(th);
        });

        // --- BODY ---
        if (AppState.allRecords.length === 0) {
            let tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="${2 + Config.metricColumns.length}" class="p-4 text-center text-gray-500">Belum ada data. Silakan klik 'Tambah Baris'.</td>`;
            this.els.tbody.appendChild(tr);
            return;
        }

        AppState.allRecords.forEach(record => {
            let tr = document.createElement('tr');
            tr.className = "hover:bg-blue-50/20 dark:hover:bg-white/5 transition-colors duration-150 group";
            const isNewRow = String(record.id).startsWith('new_');

            // 1. Cell Periode (Dilebarkan ke 180px)
            let tdPeriode = document.createElement('td');
            tdPeriode.className = "p-0 relative border border-[#d9d9d9] dark:border-gristDarkBorder min-w-[180px] w-[180px] sticky left-0 z-20 transition-colors duration-200 bg-white dark:bg-gristDarkBg group-hover:bg-blue-50/20 dark:group-hover:bg-[#343442]";

            const keyPeriode = `${record.id}|${Config.colPeriode}`;
            let dbPeriode = DateUtil.parse(record[Config.colPeriode]) || '';
            let valPeriode = AppState.unsavedEdits[keyPeriode] !== undefined ? AppState.unsavedEdits[keyPeriode] : dbPeriode;

            let inputPeriode = document.createElement('input');
            inputPeriode.type = 'text';
            inputPeriode.placeholder = 'Mei 24';
            inputPeriode.className = "block w-full h-full min-h-[36px] px-2 text-center text-[13px] text-[#262633] dark:text-gristDarkText font-medium bg-transparent focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#1f78d1] focus:bg-blue-50/30 dark:focus:bg-[#1f78d1]/20 transition-none";
            if (isNewRow && !valPeriode) inputPeriode.classList.add('bg-yellow-50', 'dark:bg-yellow-900/20');
            inputPeriode.value = valPeriode;

            inputPeriode.addEventListener('input', (e) => {
                AppState.unsavedEdits[keyPeriode] = e.target.value;
                if (e.target.value) inputPeriode.classList.remove('bg-yellow-50', 'dark:bg-yellow-900/20');
            });
            tdPeriode.appendChild(inputPeriode);
            tr.appendChild(tdPeriode);

            // 2. Cell Source (Dilebarkan ke 220px, offset left 180px)
            let tdSource = document.createElement('td');
            tdSource.className = "p-0 relative border border-[#d9d9d9] dark:border-gristDarkBorder min-w-[220px] w-[220px] sticky left-[180px] sticky-shadow z-20 transition-colors duration-200 bg-white dark:bg-gristDarkBg group-hover:bg-blue-50/20 dark:group-hover:bg-[#343442]";

            const keySource = `${record.id}|${Config.colSource}`;
            let dbSource = ValUtil.getChoiceVal(record[Config.colSource]) || '';
            let valSource = AppState.unsavedEdits[keySource] !== undefined ? AppState.unsavedEdits[keySource] : dbSource;

            let selectSource = document.createElement('select');
            selectSource.className = "block w-full h-full min-h-[36px] px-2 text-left text-[13px] text-[#262633] dark:text-gristDarkText font-medium bg-transparent focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#1f78d1] focus:bg-blue-50/30 dark:focus:bg-[#1f78d1]/20 transition-none cursor-pointer outline-none";
            if (isNewRow && !valSource) selectSource.classList.add('bg-yellow-50', 'dark:bg-yellow-900/20');

            let defaultOpt = document.createElement('option');
            defaultOpt.value = "";
            defaultOpt.text = "- Pilih Source -";
            defaultOpt.disabled = true;
            if (!valSource) defaultOpt.selected = true;
            selectSource.appendChild(defaultOpt);

            AppState.uniqueSources.forEach(src => {
                let opt = document.createElement('option');
                opt.value = src;
                opt.text = src;
                opt.className = "text-[#262633] dark:text-white bg-white dark:bg-gristDarkBg";
                if (src === valSource) opt.selected = true;
                selectSource.appendChild(opt);
            });

            selectSource.addEventListener('change', (e) => {
                AppState.unsavedEdits[keySource] = e.target.value;
                if (e.target.value) selectSource.classList.remove('bg-yellow-50', 'dark:bg-yellow-900/20');
            });
            tdSource.appendChild(selectSource);
            tr.appendChild(tdSource);

            // 3. Cells Metrik Dinamis
            Config.metricColumns.forEach(metric => {
                let td = document.createElement('td');
                td.className = "p-0 relative h-full border border-[#d9d9d9] dark:border-gristDarkBorder bg-white dark:bg-gristDarkBg group-hover:bg-transparent transition-colors duration-200";

                let dbVal = record[metric.id] !== null && record[metric.id] !== undefined ? record[metric.id] : '';
                const editKey = `${record.id}|${metric.id}`;
                let finalVal = AppState.unsavedEdits[editKey] !== undefined ? AppState.unsavedEdits[editKey] : dbVal;

                let input = document.createElement('input');
                input.type = 'number';
                input.step = 'any';
                input.className = `block w-full h-full min-h-[36px] px-2 font-mono text-right text-[13px] bg-transparent focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#1f78d1] focus:bg-blue-50/30 dark:focus:bg-[#1f78d1]/20 transition-none ${metric.isHighlight ? 'text-blue-700 font-semibold dark:text-blue-300' : 'text-[#262633] dark:text-gristDarkText'}`;
                input.value = finalVal;

                input.addEventListener('input', (e) => {
                    AppState.unsavedEdits[editKey] = e.target.value;
                });

                td.appendChild(input);
                tr.appendChild(td);
            });

            this.els.tbody.appendChild(tr);
        });

        this.els.loadingPanel.classList.add('hidden');
        this.els.tableContainer.classList.remove('hidden');
    }
};