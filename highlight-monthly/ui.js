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

        // HEADER
        let thPeriode = document.createElement('th');
        thPeriode.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-2 text-center min-w-[150px] w-[150px] sticky left-0 z-40 transition-colors duration-200";
        thPeriode.innerText = "Periode";
        this.els.thead.appendChild(thPeriode);

        let thDepartment = document.createElement('th');
        thDepartment.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-2 text-left min-w-[160px] w-[160px] sticky left-[150px] sticky-shadow z-40 transition-colors duration-200";
        thDepartment.innerText = "Department";
        this.els.thead.appendChild(thDepartment);

        Config.metricColumns.forEach(metric => {
            let th = document.createElement('th');
            th.className = `bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-2 text-right z-30 transition-colors duration-200 ${metric.isHighlight ? 'text-blue-600 dark:text-blue-400' : ''}`;
            th.style.minWidth = metric.width;
            th.innerText = metric.label;
            this.els.thead.appendChild(th);
        });

        // BODY
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

            // 1. CELL PERIODE (DATE PICKER)
            let tdPeriode = document.createElement('td');
            tdPeriode.className = "p-0 relative border border-[#d9d9d9] dark:border-gristDarkBorder sticky left-0 z-20 transition-colors duration-200 bg-white dark:bg-gristDarkBg group-hover:bg-blue-50/20 dark:group-hover:bg-[#343442]";

            const keyPeriode = `${record.id}|${Config.colPeriode}`;
            let dbPeriode = DateUtil.formatForMonthPicker(record[Config.colPeriode]) || '';
            let valPeriode = AppState.unsavedEdits[keyPeriode] !== undefined ? AppState.unsavedEdits[keyPeriode] : dbPeriode;

            let inputPeriode = document.createElement('input');
            inputPeriode.type = 'month'; // MENGGUNAKAN MONTH PICKER BAWAAN BROWSER
            inputPeriode.className = "block w-full h-full min-h-[36px] px-3 text-center text-[13px] text-[#262633] dark:text-gristDarkText font-medium bg-transparent focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#1f78d1] focus:bg-blue-50/30 dark:focus:bg-[#1f78d1]/20 transition-none cursor-pointer";
            if (isNewRow && !valPeriode) inputPeriode.classList.add('bg-yellow-50', 'dark:bg-yellow-900/20');
            inputPeriode.value = valPeriode;

            inputPeriode.addEventListener('input', (e) => {
                AppState.unsavedEdits[keyPeriode] = e.target.value;
                if (e.target.value) inputPeriode.classList.remove('bg-yellow-50', 'dark:bg-yellow-900/20');
            });
            tdPeriode.appendChild(inputPeriode);
            tr.appendChild(tdPeriode);

            // 2. CELL Department (CHECKBOXES)
            let tdDepartment = document.createElement('td');
            tdDepartment.className = "p-0 relative border border-[#d9d9d9] dark:border-gristDarkBorder sticky left-[150px] sticky-shadow z-20 transition-colors duration-200 bg-white dark:bg-gristDarkBg group-hover:bg-blue-50/20 dark:group-hover:bg-[#343442]";

            const keyDepartment = `${record.id}|${Config.colDepartment}`;

            // PERBAIKAN: Ekstrak seluruh pilihan Array dari Grist jika tipe datanya berupa Choice List ('L')
            let rawDepartment = record[Config.colDepartment];
            let dbDepartment = '';
            if (Array.isArray(rawDepartment) && rawDepartment[0] === 'L') {
                dbDepartment = rawDepartment.slice(1).join(', '); // Menarik seluruh isi array pilihan tanpa terpotong
            } else {
                dbDepartment = ValUtil.getChoiceVal(rawDepartment) || ''; // Fallback ke metode lama untuk Choice biasa
            }

            let valDepartment = AppState.unsavedEdits[keyDepartment] !== undefined ? AppState.unsavedEdits[keyDepartment] : dbDepartment;

            // Membuat kontainer yang bisa di-scroll untuk daftar checkbox
            let checkboxContainer = document.createElement('div');
            checkboxContainer.className = "w-full h-full min-h-[60px] max-h-[100px] px-2 py-1 text-left text-[12px] font-medium bg-transparent focus:outline-none transition-none overflow-y-auto flex flex-col gap-1";
            if (isNewRow && !valDepartment) checkboxContainer.classList.add('bg-yellow-50', 'dark:bg-yellow-900/20');

            // Pecah data yang sudah tersimpan menjadi array (agar bisa dicocokkan dengan checkbox)
            const activeVals = valDepartment.split(',').map(s => s.trim()).filter(Boolean);

            AppState.uniqueDepartments.forEach(src => {
                // Label pembungkus agar area klik lebih luas
                let label = document.createElement('label');
                label.className = "flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 p-0.5 rounded";

                let checkbox = document.createElement('input');
                checkbox.type = "checkbox";
                checkbox.value = src;
                checkbox.className = "w-3 h-3 text-[#16b378] bg-gray-100 border-gray-300 rounded focus:ring-[#16b378] dark:focus:ring-[#139a67] focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer";

                // Centang secara otomatis jika nilainya ada di database atau status memori
                if (activeVals.includes(src)) checkbox.checked = true;

                checkbox.addEventListener('change', () => {
                    // Ambil semua checkbox yang dalam keadaan tercentang di dalam kontainer baris ini
                    const checkedBoxes = Array.from(checkboxContainer.querySelectorAll('input[type="checkbox"]:checked'));
                    const selectedOptions = checkedBoxes.map(cb => cb.value);

                    // Simpan sebagai string yang dipisahkan koma untuk Payload Grist
                    AppState.unsavedEdits[keyDepartment] = selectedOptions.join(', ');

                    // Manipulasi UI warna peringatan jika kosong
                    if (selectedOptions.length > 0) {
                        checkboxContainer.classList.remove('bg-yellow-50', 'dark:bg-yellow-900/20');
                    } else if (isNewRow) {
                        checkboxContainer.classList.add('bg-yellow-50', 'dark:bg-yellow-900/20');
                    }
                });

                let span = document.createElement('span');
                span.innerText = src;
                span.className = "text-[#262633] dark:text-white leading-tight mt-[1px]";

                label.appendChild(checkbox);
                label.appendChild(span);
                checkboxContainer.appendChild(label);
            });

            tdDepartment.appendChild(checkboxContainer);
            tr.appendChild(tdDepartment);

            // 3. CELLS METRIK NUMERIK
            Config.metricColumns.forEach(metric => {
                let td = document.createElement('td');
                td.className = "p-0 relative h-full border border-[#d9d9d9] dark:border-gristDarkBorder bg-white dark:bg-gristDarkBg group-hover:bg-transparent transition-colors duration-200";

                let dbVal = record[metric.id] !== null && record[metric.id] !== undefined ? record[metric.id] : '';
                const editKey = `${record.id}|${metric.id}`;
                let finalVal = AppState.unsavedEdits[editKey] !== undefined ? AppState.unsavedEdits[editKey] : dbVal;

                let input = document.createElement('input');
                input.type = 'text';
                input.step = 'any';
                input.className = `block w-full h-full min-h-[36px] px-2 font-mono text-right text-[13px] bg-transparent focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#1f78d1] focus:bg-blue-50/30 dark:focus:bg-[#1f78d1]/20 transition-none ${metric.isHighlight ? 'text-blue-700 font-semibold dark:text-blue-300' : 'text-[#262633] dark:text-gristDarkText'}`;
                input.value = finalVal;

                input.addEventListener('input', (e) => AppState.unsavedEdits[editKey] = e.target.value);
                td.appendChild(input);
                tr.appendChild(td);
            });

            this.els.tbody.appendChild(tr);
        });

        this.els.loadingPanel.classList.add('hidden');
        this.els.tableContainer.classList.remove('hidden');
    }
};