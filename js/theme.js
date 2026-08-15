// theme.js — light/dark toggle. Persists the explicit choice; otherwise the page follows the
// viewer's system preference (the CSS handles the system default). Sets data-theme on <html>.

const KEY = 'atlas-theme';

export function initTheme(button) {
  const stored = localStorage.getItem(KEY);
  if (stored === 'light' || stored === 'dark') {
    document.documentElement.setAttribute('data-theme', stored);
  }
  update(button);
  button.addEventListener('click', () => {
    const current =
      document.documentElement.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem(KEY, next);
    update(button);
  });
}

function update(button) {
  const isDark =
    (document.documentElement.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark';
  button.setAttribute('aria-pressed', String(isDark));
  button.title = isDark ? 'Switch to light theme' : 'Switch to dark theme';
  button.textContent = isDark ? '☾' : '☀';
}
