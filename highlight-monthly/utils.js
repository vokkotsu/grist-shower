const DateUtil = {
    // Mengubah nilai mentah dari Grist menjadi format solid "YYYY-MM"
    formatForMonthPicker(val) {
        if (val === null || val === undefined || val === '') return '';

        let strVal = String(val).trim();

        // 1. Ekstraksi aman dari string beraroma YYYY-MM atau YYYY-MM-DD (Paling akurat)
        const yyyymmMatch = strVal.match(/^(\d{4})-(\d{2})/);
        if (yyyymmMatch) return `${yyyymmMatch[1]}-${yyyymmMatch[2]}`;

        // 2. Ekstraksi jika Grist mengirimkan teks bulan lama (Misal: "Mei 24" atau "May 2024")
        const monthMap = { "jan": "01", "feb": "02", "mar": "03", "apr": "04", "mei": "05", "may": "05", "jun": "06", "jul": "07", "agu": "08", "aug": "08", "sep": "09", "okt": "10", "oct": "10", "nov": "11", "des": "12", "dec": "12" };
        let parts = strVal.toLowerCase().split(/[\s-]/);
        if (parts.length >= 2) {
            let mStr = parts[0];
            if (monthMap[mStr]) {
                let y = parts[parts.length - 1];
                if (y.length === 2) y = "20" + y;
                return `${y}-${monthMap[mStr]}`;
            }
        }

        // 3. Fallback jika Grist mengirimkan murni Timestamp UNIX
        try {
            let d;
            if (Array.isArray(val) && val[0] === 'd' && typeof val[1] === 'number') {
                d = new Date(val[1] * 1000);
            } else if (typeof val === 'number') {
                d = new Date(val > 100000000000 ? val : val * 1000);
            } else {
                d = new Date(strVal);
            }

            if (d && !isNaN(d.getTime())) {
                // Memastikan penggunaan tahun lokal agar zona waktu tidak menggeser bulan secara tidak sengaja
                const yyyy = d.getFullYear();
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                return `${yyyy}-${mm}`;
            }
        } catch (e) { console.error("Gagal format tanggal Grist:", val, e); }

        return '';
    },

    // Mengubah kembali "YYYY-MM" dari Date Picker menjadi string utuh untuk disimpan ke Grist
    toGristString(uiMonthStr) {
        if (!uiMonthStr) return null;
        // Asumsikan tanggal 01 pada bulan tersebut (YYYY-MM-01) agar terbaca sebagai Format Date baku
        return `${uiMonthStr}-01`;
    }
};

const ValUtil = {
    // Membaca data dari Grist dan menampilkannya ke HTML
    getChoiceVal(val) {
        if (Array.isArray(val)) {
            // Jika Grist mengirimkan format Choice List (selalu diawali huruf 'L')
            if (val[0] === 'L') {
                return val.slice(1).join(', '); // Ubah ['L', 'A', 'B'] menjadi "A, B"
            }
            // Jika ini Reference atau Choice biasa
            if (val.length > 1) return String(val[1]);
        }
        return val ? String(val) : '';
    },

    // Format data dari HTML kembali ke Grist saat tombol Simpan ditekan
    formatForSave(uiVal, isChoiceList) {
        if (!uiVal) return isChoiceList ? ['L'] : null; // Kirim array 'L' kosong jika dihapus

        if (isChoiceList) {
            // Pecah string "A, B" menjadi array ['L', 'A', 'B'] yang dimengerti Grist
            const parts = String(uiVal).split(',').map(s => s.trim()).filter(Boolean);
            return ['L', ...parts];
        }
        return String(uiVal);
    }
};