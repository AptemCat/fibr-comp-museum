'use strict';

(() => {
  const key = 'bytemuseum-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let transitionTimer;
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

  const apply = (animate = false) => {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    if (animate && theme !== root.dataset.bsTheme && !motion.matches) {
      clearTimeout(transitionTimer);
      root.classList.add('theme-transition');
      // Сначала применяем правила перехода к текущим цветам, затем меняем палитру.
      void root.offsetWidth;
      transitionTimer = setTimeout(() => root.classList.remove('theme-transition'), 350);
    }
    root.dataset.bsTheme = theme;
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
      apply(true);
      try {
        localStorage.setItem(key, preference);
      } catch {
        // Смена темы не зависит от разрешения на сохранение настроек.
      }
    });
  });

  system.addEventListener('change', () => {
    if (preference === 'system') apply(true);
  });

  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = modes.includes(event.newValue) ? event.newValue : 'system';
    apply(true);
  });

  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    clearTimeout(transitionTimer);
    root.classList.remove('theme-transition');
  });
})();
