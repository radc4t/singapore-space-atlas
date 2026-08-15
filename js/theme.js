// theme.js — light/dark toggle. Persists the explicit choice; otherwise the page follows the
// viewer's system preference (the CSS handles the system default). Sets data-theme on <html>.

import { icon } from './icons.js';

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
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
  button.setAttribute('aria-pressed', String(isDark));
  // Accessible name is the action, not a symbol (previously the button's name was the glyph "☾").
  button.setAttribute('aria-label', label);
  button.title = label;
  // Show the current mode's mark; the icon is decorative (aria-hidden), the label carries meaning.
  button.replaceChildren(icon(isDark ? 'moon' : 'sun'));
}
