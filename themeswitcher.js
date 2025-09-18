
document.getElementById('theme-select').addEventListener('change', function () {
    document.body.dataset.theme = this.value;
    localStorage.setItem('preferredTheme', this.value);
});

const savedTheme = localStorage.getItem('preferredTheme');
if (savedTheme) {
    document.body.dataset.theme = savedTheme;
    document.getElementById('theme-select').value = savedTheme;
}