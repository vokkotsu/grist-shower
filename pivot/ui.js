// ui.js
const UI = {
    els: {
        loadingPanel: document.getElementById('loading-panel'),
        loadingText: document.getElementById('loading-text'),
        pivotContainer: document.getElementById('pivot-container'),
        thead: document.getElementById('pivot-head'),
        tbody: document.getElementById('pivot-body'),
        tfoot: document.getElementById('pivot-foot'),
        themeToggleBtn: document.getElementById('theme-toggle')
    },

    showLoading() {
        this.els.loadingPanel.classList.remove('hidden');
        this.els.pivotContainer.classList.add('hidden');
    },

    showTable() {
        this.els.loadingPanel.classList.add('hidden');
        this.els.pivotContainer.classList.remove('hidden');
    },

    showError(message) {
        this.els.loadingText.innerHTML = message;
        this.els.loadingText.classList.add('text-red-500');
        this.showLoading();
    },

    initTheme() {
        this.els.themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.documentElement.classList.contains('dark');
            localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
        });
    },

    renderPivotTable(pivotData, years, metrics, grandTotalsByYear, grandTotalAll) {
        // 1. Render Header (Thead)
        let headHTML = `<tr>
            <th class="p-3 text-left text-xs font-semibold text-gray-500 dark:text-gristDarkMuted uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gristDarkPanel z-10 border-r border-[#d9d9d9] dark:border-gristDarkBorder">Metrik</th>`;
        years.forEach(year => {
            headHTML += `<th class="p-3 text-right text-xs font-semibold text-gray-500 dark:text-gristDarkMuted uppercase tracking-wider">${year}</th>`;
        });
        headHTML += `<th class="p-3 text-right text-xs font-bold text-gray-700 dark:text-white uppercase tracking-wider border-l border-[#d9d9d9] dark:border-gristDarkBorder">Total Keseluruhan</th></tr>`;
        this.els.thead.innerHTML = headHTML;

        // 2. Render Body (Tbody)
        let bodyHTML = '';
        metrics.forEach(metric => {
            bodyHTML += `<tr>
                <td class="p-3 text-sm font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gristDarkBg z-10 border-r border-[#d9d9d9] dark:border-gristDarkBorder capitalize">${metric}</td>`;

            years.forEach(year => {
                const val = pivotData[metric][year] || 0;
                bodyHTML += `<td class="p-3 text-sm text-right text-gray-600 dark:text-gray-300 font-mono">${val !== 0 ? Utils.formatNumber(val) : '-'}</td>`;
            });

            bodyHTML += `<td class="p-3 text-sm text-right font-bold text-gray-800 dark:text-white font-mono border-l border-[#d9d9d9] dark:border-gristDarkBorder bg-blue-50/30 dark:bg-blue-900/10">${Utils.formatNumber(pivotData[metric].Total)}</td>
            </tr>`;
        });
        this.els.tbody.innerHTML = bodyHTML;

        // 3. Render Footer (Tfoot)
        let footHTML = `<tr>
            <td class="p-3 text-sm text-right text-gray-900 dark:text-white sticky left-0 bg-gray-50 dark:bg-gristDarkPanel z-10 border-r border-[#d9d9d9] dark:border-gristDarkBorder">Grand Total</td>`;
        years.forEach(year => {
            footHTML += `<td class="p-3 text-sm text-right text-gray-900 dark:text-white font-mono">${Utils.formatNumber(grandTotalsByYear[year])}</td>`;
        });
        footHTML += `<td class="p-3 text-sm text-right font-bold text-gray-900 dark:text-white font-mono border-l border-[#d9d9d9] dark:border-gristDarkBorder">${Utils.formatNumber(grandTotalAll)}</td></tr>`;
        this.els.tfoot.innerHTML = footHTML;
    }
};