// dateUtils.js
const DateUtil = {
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],

    parse(val) {
        if (!val) return '';
        try {
            if (val instanceof Date) return this._formatShort(val);
            if (typeof val === 'string') {
                if (this.monthNamesShort.some(m => val.startsWith(m))) return val;
                const match = val.match(/^(\d{4})-(\d{2})-\d{2}/);
                if (match && match[2] >= 1 && match[2] <= 12) {
                    return this.monthNamesShort[parseInt(match[2], 10) - 1] + ' ' + match[1].slice(-2);
                }
                let d = new Date(val);
                if (!isNaN(d.getTime())) return this._formatShort(d);
            }
            if (typeof val === 'number') {
                return this._formatShort(new Date(val > 100000000000 ? val : val * 1000));
            }
            if (Array.isArray(val) && val.length >= 2 && typeof val[1] === 'number') {
                return this._formatShort(new Date(val[1] * 1000));
            }
        } catch (e) { console.error("Format tanggal gagal:", e); }
        return String(val);
    },

    _formatShort(dateObj) {
        return this.monthNamesShort[dateObj.getUTCMonth()] + ' ' + String(dateObj.getUTCFullYear()).slice(-2);
    },

    toGristString(uiStr) {
        let parts = uiStr.split(' ');
        if (parts.length >= 2) {
            let mIndex = this.monthNamesShort.indexOf(parts[0]);
            if (mIndex !== -1) {
                let y = parts[parts.length - 1];
                if (y.length === 2) y = "20" + y;
                let m = String(mIndex + 1).padStart(2, '0');
                return `${y}-${m}-01`;
            }
        }
        return uiStr;
    }
};