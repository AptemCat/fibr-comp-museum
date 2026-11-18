'use strict';

(() => {
  const data = window.exhibitsData;
  const form = document.getElementById('exhibition-filters');
  const list = document.getElementById('exhibitions-list');
  const cards = [...list.children];

  // Если данные не загрузились, сохраняем обычный список и якорную навигацию.
  if (!data || cards.some(card => !Object.hasOwn(data, card.id))) return;

  const search = form.elements.namedItem('search');
  const category = form.elements.namedItem('category');
  const type = form.elements.namedItem('type');
  const count = document.getElementById('exhibition-count');
  const empty = document.getElementById('exhibition-empty');

  const normalize = value => value
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .trim()
    .replace(/\s+/g, ' ');

  const entries = cards.map(card => ({
    card,
    exhibit: data[card.id],
    name: normalize(data[card.id].name)
  }));

  const categories = [...new Set(entries.map(entry => entry.exhibit.category))]
    .sort((left, right) => left.localeCompare(right, 'ru'));
  for (const name of categories) category.add(new Option(name, name));

  const applyFilters = () => {
    const query = normalize(search.value);
    let visible = 0;

    for (const entry of entries) {
      const exhibitionType = entry.exhibit.temporary ? 'temporary' : 'permanent';
      const matches = entry.name.includes(query)
        && (!category.value || entry.exhibit.category === category.value)
        && (!type.value || exhibitionType === type.value);

      entry.card.hidden = !matches;
      if (matches) visible += 1;
    }

    count.textContent = `Показано экспонатов: ${visible} из ${entries.length}.`;
    empty.hidden = visible !== 0;
  };

  form.addEventListener('input', applyFilters);
  form.addEventListener('change', applyFilters);
  form.addEventListener('submit', event => {
    event.preventDefault();
    applyFilters();
  });
  form.addEventListener('reset', () => {
    // Значения полей возвращаются к исходным после события reset.
    setTimeout(() => {
      applyFilters();
      search.focus({ preventScroll: true });
    }, 0);
  });

  const revealLinkedExhibit = () => {
    const entry = entries.find(entry => `#${entry.card.id}` === window.location.hash);
    if (!entry) return;

    // Ссылки со страниц экспонатов и «О музее» должны открывать видимую карточку.
    if (entry.card.hidden) {
      search.value = '';
      category.value = '';
      type.value = '';
      applyFilters();
    }
    entry.card.scrollIntoView({ block: 'start' });
  };

  document.getElementById('exhibition-directions').hidden = true;
  form.hidden = false;
  applyFilters();
  revealLinkedExhibit();
  window.addEventListener('hashchange', revealLinkedExhibit);
})();
