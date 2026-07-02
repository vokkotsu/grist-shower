// utils.js
// Berisi fungsi-fungsi bantuan (pembantu komputasi murni tanpa menyentuh State atau API)
const Utils = {
    // Referensi untuk mengurutkan bulan dari teks bahasa Inggris
    monthOrder: {
        "JANUARY": 1, "FEBRUARY": 2, "MARCH": 3, "APRIL": 4, "MAY": 5, "JUNE": 6,
        "JULY": 7, "AUGUST": 8, "SEPTEMBER": 9, "OCTOBER": 10, "NOVEMBER": 11, "DECEMBER": 12
    },

    // Mengubah string "JUNE'24" menjadi angka yang bisa disorting (2406)
    parseDateToNumber(dStr) {
        if (!dStr) return 0;
        let str = String(dStr).trim().toUpperCase();
        let parts = str.split("'");
        if (parts.length === 2) {
            let m = this.monthOrder[parts[0]] || 0;
            let y = parseInt(parts[1], 10);
            return (y * 100) + m;
        }
        return 9999;
    },

    // Melakukan pengurutan tanggal array berdasarkan bobot numeriknya
    sortDates(datesArray) {
        return datesArray.sort((a, b) => this.parseDateToNumber(a) - this.parseDateToNumber(b));
    },

    // Mengubah ukuran tinggi (height) Textarea secara dinamis menyesuaikan kontennya
    autoResizeTextarea(element) {
        element.style.height = 'auto'; // Reset ukuran
        element.style.height = (element.scrollHeight) + 'px'; // Atur sesuai tinggi scroll
    }
};