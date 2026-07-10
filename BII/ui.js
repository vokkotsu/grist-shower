// ui.js
const UIManager = {
    els: {
        picSelect: document.getElementById('pic-select'),
        cpSelect: document.getElementById('cp-select'),
        dateInput: document.getElementById('date-input'),
        detailInput: document.getElementById('detail-input'),
        submitBtn: document.getElementById('submit-btn'),
        toast: document.getElementById('toast-notification'),
        toastMsg: document.getElementById('toast-msg')
    },

    initEvents() {
        // Saat PIC diganti, filter dan perbarui dropdown Customer & Product
        this.els.picSelect.addEventListener('change', (e) => {
            const selectedPIC = e.target.value;
            this.updateCustProdDropdown(selectedPIC);
        });

        // Event Tombol Simpan
        this.els.submitBtn.addEventListener('click', () => {
            BusinessLogic.submitForm();
        });
    },

    renderPICDropdown() {
        this.els.picSelect.innerHTML = '<option value="" disabled selected>- Pilih Nama Sales -</option>';

        // Ambil semua PIC yang ada di Map dan urutkan abjad
        const pics = Array.from(AppState.picMap.keys()).sort();

        pics.forEach(pic => {
            let opt = document.createElement('option');
            opt.value = pic;
            opt.innerText = pic;
            this.els.picSelect.appendChild(opt);
        });

        // Reset dropdown anak
        this.updateCustProdDropdown('');
    },

    updateCustProdDropdown(selectedPIC) {
        this.els.cpSelect.innerHTML = '<option value="" disabled selected>- Pilih Customer & Product -</option>';

        if (!selectedPIC) {
            this.els.cpSelect.disabled = true;
            return;
        }

        this.els.cpSelect.disabled = false;

        // Ambil himpunan gabungan Customer & Product khusus untuk PIC yang dipilih
        const cpSet = AppState.picMap.get(selectedPIC);
        if (cpSet && cpSet.size > 0) {
            const cpArray = Array.from(cpSet).sort();
            cpArray.forEach(cp => {
                let opt = document.createElement('option');
                opt.value = cp;
                opt.innerText = cp;
                this.els.cpSelect.appendChild(opt);
            });
        } else {
            let opt = document.createElement('option');
            opt.value = "";
            opt.disabled = true;
            opt.innerText = "(Belum ada riwayat Customer untuk sales ini)";
            this.els.cpSelect.appendChild(opt);
        }
    },

    getFormData() {
        return {
            pic: this.els.picSelect.value,
            custProd: this.els.cpSelect.value,
            date: this.els.dateInput.value,
            detail: this.els.detailInput.value.trim()
        };
    },

    resetForm() {
        this.els.picSelect.value = '';
        this.els.cpSelect.innerHTML = '<option value="" disabled selected>- Pilih Customer & Product -</option>';
        this.els.cpSelect.disabled = true;
        this.els.dateInput.value = '';
        this.els.detailInput.value = '';
    },

    setLoading(isLoading) {
        AppState.isSubmitting = isLoading;
        if (isLoading) {
            this.els.submitBtn.disabled = true;
            this.els.submitBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Menyimpan...`;
            this.els.submitBtn.classList.add('opacity-70', 'cursor-not-allowed');
        } else {
            this.els.submitBtn.disabled = false;
            this.els.submitBtn.innerHTML = `Kirim / Simpan Data`;
            this.els.submitBtn.classList.remove('opacity-70', 'cursor-not-allowed');
        }
    },

    showToast(message, isError = false) {
        this.els.toastMsg.innerText = message;
        this.els.toast.classList.remove('hidden', 'translate-y-10', 'opacity-0', 'bg-red-500', 'bg-green-500');

        if (isError) {
            this.els.toast.classList.add('bg-red-600');
        } else {
            this.els.toast.classList.add('bg-green-600');
        }

        setTimeout(() => {
            this.els.toast.classList.remove('translate-y-10', 'opacity-0');
        }, 10);

        setTimeout(() => {
            this.els.toast.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => this.els.toast.classList.add('hidden'), 300);
        }, 3000);
    }
};