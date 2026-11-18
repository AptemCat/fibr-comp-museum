'use strict';

(() => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;

  // До запуска скрипта и без JavaScript весь контент остаётся видимым.
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      // Не анимируем раздел, к которому пользователь уже перешёл с клавиатуры или по якорю.
      if (target.matches(':focus-within') || target.contains(document.querySelector(':target'))) continue;
      target.classList.add('museum-reveal');
      target.addEventListener('animationend', () => target.classList.remove('museum-reveal'), { once: true });
    }
  }, { rootMargin: '0px 0px 48px 0px', threshold: 0 });

  for (const section of document.querySelectorAll('[data-reveal]')) {
    observer.observe(section);
    section.addEventListener('focusin', () => {
      observer.unobserve(section);
      section.classList.remove('museum-reveal');
    });
  }

  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    observer.disconnect();
    document.querySelectorAll('.museum-reveal').forEach(section => section.classList.remove('museum-reveal'));
  });
})();
