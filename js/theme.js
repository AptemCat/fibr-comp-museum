'use strict';

(() => {
  const key = 'bytemuseum-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const modes = ['system', 'dark', 'light'];
  const labels = { system: 'системная', dark: 'тёмная', light: 'светлая' };
  const nextLabels = { system: 'системную', dark: 'тёмную', light: 'светлую' };
  let preference = 'system';
  try {
    const stored = localStorage.getItem(key);
    if (modes.includes(stored)) preference = stored;
  } catch {
    // Если хранилище недоступно, переключатель продолжает работать на странице.
  }

  const apply = () => {
    root.dataset.bsTheme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
      toggle.hidden = false;
      const next = modes[(modes.indexOf(preference) + 1) % modes.length];
      const description = `Тема: ${labels[preference]}. Переключить на ${nextLabels[next]}`;
      toggle.dataset.themeMode = preference;
      toggle.setAttribute('aria-label', description);
      toggle.title = description;
      document.getElementById('theme-icon').setAttribute('href', `images/icons.svg#theme-${preference}`);
    }
  };

  // Скрипт в head применяет тему до загрузки стилей, чтобы избежать светлой вспышки.
  apply();

  document.addEventListener('DOMContentLoaded', () => {
    apply();
    document.getElementById('theme-toggle').addEventListener('click', () => {
      preference = modes[(modes.indexOf(preference) + 1) % modes.length];
      apply();
      try {
        localStorage.setItem(key, preference);
      } catch {
        // Смена темы не зависит от разрешения на сохранение настроек.
      }
    });
  });

  system.addEventListener('change', () => {
    if (preference === 'system') apply();
  });

  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = modes.includes(event.newValue) ? event.newValue : 'system';
    apply();
  });
})();
