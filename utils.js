function parseGristDate(val) {
    if (val === null || val === undefined || val === '') return '';
    try {
        if (val instanceof Date) {
            return monthNamesShort[val.getUTCMonth()] + ' ' + String(val.getUTCFullYear()).slice(-2);
        }
        if (typeof val === 'string') {
            if (monthNamesShort.some(m => val.startsWith(m))) return val;
            const match = val.match(/^(\d{4})-(\d{2})-\d{2}/);
            if (match) {
                let y = match[1].slice(-2);
                let m = parseInt(match[2], 10) - 1;
                if (m >= 0 && m <= 11) {
                    return monthNamesShort[m] + ' ' + y;
                }
            }
            let d = new Date(val);
            if (!isNaN(d.getTime())) {
                return monthNamesShort[d.getUTCMonth()] + ' ' + String(d.getUTCFullYear()).slice(-2);
            }
        }
        if (typeof val === 'number') {
            let d = new Date(val > 100000000000 ? val : val * 1000);
            return monthNamesShort[d.getUTCMonth()] + ' ' + String(d.getUTCFullYear()).slice(-2);
        }
        if (Array.isArray(val) && val.length >= 2 && typeof val[1] === 'number') {
            let d = new Date(val[1] * 1000);
            return monthNamesShort[d.getUTCMonth()] + ' ' + String(d.getUTCFullYear()).slice(-2);
        }
    } catch (e) {
        console.error("Gagal parsing tanggal:", e);
    }
    return String(val);
}

function toGristDateString(formattedDateStr) {
    let parts = formattedDateStr.split(' ');
    if (parts.length >= 2) {
        let mIndex = monthNamesShort.indexOf(parts[0]);
        if (mIndex !== -1) {
            let y = parts[parts.length - 1];
            if (y.length === 2) y = "20" + y; // Asumsi tahun 2000-an
            let m = String(mIndex + 1).padStart(2, '0');
            return `${y}-${m}-01`;
        }
    }
    return formattedDateStr;
}

function resetBtn(btn, content) {
    btn.innerHTML = content;
    btn.disabled = false;
    btn.className = "bg-[#16b378] hover:bg-[#139a67] text-white font-medium py-1.5 px-3 rounded text-[13px] transition duration-150 flex items-center gap-1.5 shadow-sm";
}