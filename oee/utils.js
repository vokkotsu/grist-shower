const DateUtil = {
    // Mengubah format Date dari Grist menjadi format "YYYY-MM" yang dibutuhkan elemen <input type="month">
    formatForMonthPicker(val) {
        if (!val) return '';
        try {
            let d;
            // Format Reference Date Grist
            if (Array.isArray(val) && val[0] === 'd' && typeof val[1] === 'number') d = new Date(val[1] * 1000);
            // Format Timestamp
            else if (typeof val === 'number') d = new Date(val > 100000000000 ? val : val * 1000);
            // Format ISO String
            else if (typeof val === 'string') d = new Date(val);

            if (d && !isNaN(d.getTime())) {
                const yyyy = d.getUTCFullYear();
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
                return `${yyyy}-${mm}`; // Menghasilkan "2024-05"
            }
        } catch (e) { console.error(e); }
        return '';
    },

    // Mengubah kembali "YYYY-MM" dari Date Picker menjadi string utuh untuk dikirim ke Grist
    toGristString(uiMonthStr) {
        if (!uiMonthStr) return null;
        // Selalu asumsikan hari pertama pada bulan tersebut (YYYY-MM-01)
        return `${uiMonthStr}-01`;
    }
};

const ValUtil = {
    getChoiceVal(val) {
        if (Array.isArray(val) && val.length > 1) return String(val[1]);
        return val;
    }
};