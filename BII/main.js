// main.js
document.addEventListener('DOMContentLoaded', () => {
    // Inisialisasi Dark Mode Tema
    const btn = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');

    if (localStorage.getItem('color-theme') === 'dark' || (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    if (document.documentElement.classList.contains('dark')) lightIcon.classList.remove('hidden');
    else darkIcon.classList.remove('hidden');

    btn.addEventListener('click', () => {
        darkIcon.classList.toggle('hidden');
        lightIcon.classList.toggle('hidden');
        document.documentElement.classList.toggle('dark');
        localStorage.setItem('color-theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    });

    // Inisialisasi Event Listener pada Form
    UIManager.initEvents();

    // Hubungkan ke Grist API
    grist.ready({ requiredAccess: 'full' });

    // Grist onRecords dipanggil pertama kali widget dimuat, atau setiap kali ada data baru di Grist
    grist.onRecords((records) => {
        // Matikan indikator loading skeleton
        document.getElementById('skeleton-loading').classList.add('hidden');
        document.getElementById('form-content').classList.remove('hidden');

        BusinessLogic.processRecords(records);
    });
});