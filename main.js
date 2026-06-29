// main.js
document.addEventListener('DOMContentLoaded', () => {
    ThemeManager.init();
    UIManager.els.addMonthBtn.addEventListener('click', () => BusinessLogic.addFullYear());
    UIManager.els.saveBtn.addEventListener('click', () => GristAPI.saveChanges());
    GristAPI.init();
});