// ─── THEME TOGGLE ──────────────────────────────
const themeBtn = document.getElementById('themeToggle');
const html = document.documentElement;

themeBtn.addEventListener('click', () => {
  const isDark = html.getAttribute('data-theme') === 'dark';
  html.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeBtn.textContent = isDark ? '🌙' : '☀️';
});
