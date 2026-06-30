// utils.js
const Utils = {
    // Fungsi memformat angka menjadi format ribuan (id-ID)
    formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(num);
    },

    // Fungsi ekstraksi tahun yang sangat agresif (mampu membaca Array Grist, Text, atau Timestamp)
    extractYear(val) {
        if (val === null || val === undefined || val === '') return 'N/A';

        try {
            // 1. Deteksi format array Grist murni untuk Date
            if (Array.isArray(val) && val[0] === 'd' && typeof val[1] === 'number') {
                return String(new Date(val[1] * 1000).getUTCFullYear());
            }

            // 2. Jika nilai berupa number/timestamp murni
            if (typeof val === 'number') {
                if (val >= 1900 && val <= 2100) return String(val);
                let d = new Date(val > 100000000000 ? val : val * 1000);
                return String(d.getUTCFullYear());
            }

            // 3. Paksa parsing teks
            let strVal = String(val);

            // Cari 4 digit angka yang berawalan 19 atau 20 (misal: "Januari 2024")
            const yearMatch = strVal.match(/(19|20)\d{2}/);
            if (yearMatch) return yearMatch[0];

            // Deteksi 2 digit tahun di akhir string (misal: "Januari 25")
            const matchShort = strVal.match(/[\s,-](\d{2})$/);
            if (matchShort) return "20" + matchShort[1];

            // Fallback parsing Date
            let d = new Date(strVal);
            if (!isNaN(d.getTime())) return String(d.getUTCFullYear());

        } catch (e) {
            console.warn("Format tanggal gagal diparsing", val);
        }

        return String(val) || 'Lainnya';
    }
};