// logic.js
const BusinessLogic = {
    // Fungsi untuk menarik master opsi (Choice) langsung dari Setting Grist
    async fetchChoicesFromMetadata(tableId, colId) {
        try {
            const tables = await grist.docApi.fetchTable('_grist_Tables');
            const tableIndex = tables.tableId.indexOf(tableId);
            if (tableIndex === -1) return null;
            const tableRef = tables.id[tableIndex];

            const columns = await grist.docApi.fetchTable('_grist_Tables_column');
            const colIndex = columns.id.findIndex((id, i) => columns.parentId[i] === tableRef && columns.colId[i] === colId);

            if (colIndex !== -1) {
                const widgetOptions = columns.widgetOptions[colIndex];
                if (widgetOptions) {
                    const opts = JSON.parse(widgetOptions);
                    if (opts && opts.choices) return opts.choices;
                }
            }
        } catch (e) {
            console.warn("Metadata kolom gagal ditarik:", e);
        }
        return null;
    },

    async processRecords(records) {
        AppState.picMap.clear();
        AppState.cpDataMap.clear();

        // 1. Tarik struktur PIC yang valid (Mencegah nama sales hilang jika kebetulan sedang tak punya riwayat data)
        let metadataPICs = await this.fetchChoicesFromMetadata(Config.tableId, Config.colPIC);
        if (metadataPICs) {
            metadataPICs.forEach(pic => AppState.picMap.set(pic, new Set()));
        }

        // 2. Baca data historis untuk memetakan kombinasi [Customer & Product] untuk masing-masing PIC
        if (records && records.length > 0) {
            records.forEach(r => {
                let pic = ValUtil.getChoiceVal(r[Config.colPIC]);
                let company = ValUtil.getChoiceVal(r[Config.colCompany]);
                let sku = ValUtil.getChoiceVal(r[Config.colSKU]);

                // Jika ada data Company atau SKU, gabungkan dan petakan ke PIC
                if (company || sku) {
                    let cpCombined = `${company || '-'} — ${sku || '-'}`;

                    if (pic) {
                        if (!AppState.picMap.has(pic)) AppState.picMap.set(pic, new Set());
                        AppState.picMap.get(pic).add(cpCombined);
                    }

                    // Simpan mapping untuk memecah kembali teks gabungan saat dikirim
                    AppState.cpDataMap.set(cpCombined, { company: company || '', sku: sku || '' });
                }
            });
        }

        UIManager.renderPICDropdown();
    },

    async submitForm() {
        if (AppState.isSubmitting) return;

        const data = UIManager.getFormData();

        // Validasi Front-end
        if (!data.pic) return UIManager.showToast("Nama Sales (PIC) belum dipilih!", true);
        if (!data.custProd) return UIManager.showToast("Customer & Product belum dipilih!", true);
        if (!data.date) return UIManager.showToast("Periode/Tanggal belum diisi!", true);
        if (!data.detail) return UIManager.showToast("Detail Update tidak boleh kosong!", true);

        UIManager.setLoading(true);

        try {
            // Ekstrak kembali string "Customer — Product" menjadi dua nilai aslinya
            const cpData = AppState.cpDataMap.get(data.custProd) || { company: '', sku: '' };

            const apiActions = [];

            // A. Tembakan ke Tabel 1 (Journey)
            apiActions.push(['AddRecord', Config.tableId, null, {
                [Config.colPIC]: data.pic,
                [Config.colCompany]: cpData.company,
                [Config.colSKU]: cpData.sku,
                [Config.colDate]: DateUtil.toGristDate(data.date),
                [Config.colDesc]: data.detail
            }]);

            // B. Tembakan ke Tabel 2 (RnD Task Log) dengan pola sinkronisasi Ganda (Dual-Write) persis seperti BII
            apiActions.push(['AddRecord', Config.table2Id, null, {
                [Config.t2ColName]: data.pic,
                [Config.t2ColCompany]: cpData.company,
                [Config.t2ColSKU]: cpData.sku,
                [Config.t2ColDate]: DateUtil.toGristDate(data.date),
                [Config.t2ColValue]: data.detail
            }]);

            await grist.docApi.applyUserActions(apiActions);

            UIManager.showToast("Data Update berhasil disimpan!");
            UIManager.resetForm();

        } catch (error) {
            console.error("Gagal menyimpan data:", error);
            UIManager.showToast("Gagal menyimpan: " + error.message, true);
        } finally {
            UIManager.setLoading(false);
        }
    }
};