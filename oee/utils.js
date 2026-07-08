const DateUtil = {
    monthNamesShort: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
    parse(val) {
        if (!val) return '';
        try {
            if (Array.isArray(val) && val[0] === 'd' && typeof val[1] === 'number') {
                return this._formatShort(new Date(val[1] * 1000));
            }
            if (typeof val === 'number') {
                return this._formatShort(new Date(val > 100000000000 ? val : val * 1000));
            }
            if (typeof val === 'string') {
                let d = new Date(val);
                if (!isNaN(d.getTime())) return this._formatShort(d);
            }
        } catch (e) { console.error(e); }
        return String(val);
    },
    _formatShort(dateObj) {
        return this.monthNamesShort[dateObj.getUTCMonth()] + ' ' + String(dateObj.getUTCFullYear()).slice(-2);
    },
    toGristString(uiStr) {
        if (!uiStr) return null;
        let str = String(uiStr).trim();

        // Jika user mengetik YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
        // Jika user mengetik YYYY-MM
        if (/^\d{4}-\d{2}$/.test(str)) return `${str}-01`;

        // Jika user mengetik format 'Jan 24'
        let parts = str.split(/[\s-]/);
        if (parts.length >= 2) {
            let mIndex = this.monthNamesShort.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
            if (mIndex !== -1) {
                let y = parts[parts.length - 1];
                if (y.length === 2) y = "20" + y;
                let m = String(mIndex + 1).padStart(2, '0');
                return `${y}-${m}-01`;
            }
        }

        // Fallback Date parser
        let d = new Date(str);
        if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];

        return str;
    }
};

const ValUtil = {
    getChoiceVal(val) {
        if (Array.isArray(val) && val.length > 1) return String(val[1]);
        return val;
    }
};