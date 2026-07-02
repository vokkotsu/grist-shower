// ui.js
// Menangani semua manipulasi tampilan HTML (DOM), event click standar, dan tema gelap.
const UIManager = {
    els: {
        loadingPanel: document.getElementById('loading-panel'),
        tableContainer: document.getElementById('table-container'),
        errorBox: document.getElementById('error-box'),
        thead: document.getElementById('table-head'),
        tbody: document.getElementById('table-body'),
        saveBtn: document.getElementById('save-btn'),
        errorModal: document.getElementById('error-modal'),
        errorModalMsg: document.getElementById('error-modal-msg')
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

    // Menyalin isi input ke AppState saat sebelum disave
    saveCurrentInputsToState() {
        const inputs = document.querySelectorAll('#table-body textarea');
        inputs.forEach(input => {
            AppState.unsavedEdits[`${input.dataset.company}|${input.dataset.sku}|${input.dataset.date}`] = input.value;
        });
    },

    // Mengganti tampilan visual dari tombol Save
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

    // Membangun tabel HTML secara dinamis (Mapping Data ke Matrix)
    renderTable() {
        this.els.thead.innerHTML = '';
        this.els.tbody.innerHTML = '';

        // 1. Header (Kiri & Tanggal)
        let thCompany = document.createElement('th');
        thCompany.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-3 text-left min-w-[250px] z-30 sticky left-0";
        thCompany.innerText = "Company Name";
        this.els.thead.appendChild(thCompany);

        let thSKU = document.createElement('th');
        thSKU.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-3 text-left min-w-[200px] z-30 sticky left-[250px]";
        thSKU.innerText = "SKU / Grade";
        this.els.thead.appendChild(thSKU);

        AppState.uniqueDates.forEach(date => {
            let th = document.createElement('th');
            th.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#929299] dark:text-gristDarkMuted text-[11px] uppercase tracking-wider font-semibold border border-[#d9d9d9] dark:border-gristDarkBorder p-3 text-left min-w-[320px]";
            th.innerText = date;
            this.els.thead.appendChild(th);
        });

        // 2. Baris Data (Rows)
        AppState.uniqueRowGroups.forEach(group => {
            let tr = document.createElement('tr');

            let tdCompany = document.createElement('td');
            tdCompany.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#262633] dark:text-gristDarkText text-[13px] font-medium border border-[#d9d9d9] dark:border-gristDarkBorder p-3 align-top sticky left-0 z-10 whitespace-normal bg-white dark:bg-gristDarkBg";
            tdCompany.innerText = group.company || '-';
            tr.appendChild(tdCompany);

            let tdSKU = document.createElement('td');
            tdSKU.className = "bg-[#f7f7f7] dark:bg-gristDarkPanel text-[#262633] dark:text-gristDarkText text-[13px] font-medium border border-[#d9d9d9] dark:border-gristDarkBorder p-3 align-top sticky left-[250px] z-10 whitespace-normal bg-white dark:bg-gristDarkBg";
            tdSKU.innerText = group.sku || '-';
            tr.appendChild(tdSKU);

            // 3. Kolom Isian Berdasarkan Tanggal
            AppState.uniqueDates.forEach(date => {
                let td = document.createElement('td');
                td.className = "p-0 relative border border-[#d9d9d9] dark:border-gristDarkBorder bg-white dark:bg-gristDarkBg align-top";

                let matched = AppState.allRecords.find(r => r[Config.colCompany] === group.company && r[Config.colSKU] === group.sku && r[Config.colDate] === date);
                let val = matched && matched[Config.colDesc] !== null ? matched[Config.colDesc] : '';
                let recordId = matched ? matched.id : '';

                const editKey = `${group.company}|${group.sku}|${date}`;
                if (AppState.unsavedEdits[editKey] !== undefined) val = AppState.unsavedEdits[editKey];

                let input = document.createElement('textarea');
                input.className = "w-full min-h-[80px] overflow-hidden resize-none block p-3 bg-transparent text-[13px] text-[#262633] dark:text-gristDarkText leading-relaxed focus:outline-none focus:ring-0 focus:shadow-[inset_0_0_0_2px_#1f78d1] focus:bg-blue-50/30 dark:focus:bg-[#1f78d1]/20";
                input.value = val;
                input.placeholder = "Tambahkan catatan...";
                input.dataset.id = recordId;
                input.dataset.date = date;
                input.dataset.company = group.company;
                input.dataset.sku = group.sku;

                // Bind listener agar teks menyesuaikan ketinggian & merekam di cache
                input.addEventListener('input', function () {
                    Utils.autoResizeTextarea(this);
                    AppState.unsavedEdits[`${this.dataset.company}|${this.dataset.sku}|${this.dataset.date}`] = this.value;
                });

                td.appendChild(input);
                tr.appendChild(td);

                setTimeout(() => Utils.autoResizeTextarea(input), 0);
            });
            this.els.tbody.appendChild(tr);
        });
    }
};

const ThemeManager = {
    init() {
        const btn = document.getElementById('theme-toggle');
        const darkIcon = document.getElementById('theme-toggle-dark-icon');
        const lightIcon = document.getElementById('theme-toggle-light-icon');

        if (document.documentElement.classList.contains('dark')) lightIcon.classList.remove('hidden');
        else darkIcon.classList.remove('hidden');

        btn.addEventListener('click', () => {
            darkIcon.classList.toggle('hidden');
            lightIcon.classList.toggle('hidden');
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        });
    }
};