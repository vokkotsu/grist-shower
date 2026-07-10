// utils.js
const ValUtil = {
    // Mengekstrak nilai teks murni dari Grist (mendukung tipe Choice biasa maupun Choice List)
    getChoiceVal(val) {
        if (Array.isArray(val)) {
            if (val[0] === 'L') return val.slice(1).join(', ');
            if (val.length > 1) return String(val[1]);
        }
        return val ? String(val) : '';
    }
};

const DateUtil = {
    // Mengamankan nilai tanggal (YYYY-MM-DD) yang dikirim dari HTML Date Picker
    toGristDate(dateStr) {
        if (!dateStr) return null;

        // Input type="date" sudah secara native menghasilkan string dengan format "YYYY-MM-DD"
        // sehingga kita bisa langsung melemparnya ke Grist tanpa perlu ditambahkan "-01"
        return dateStr;
    }
};