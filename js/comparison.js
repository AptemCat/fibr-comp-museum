'use strict';

(() => {
  const data = window.exhibitsData;
  const panel = document.getElementById('comparison');
  const cards = [...document.getElementById('exhibitions-list').children];
  const fields = [
    ['purpose', 'Назначение'],
    ['principle', 'Принцип работы'],
    ['input', 'Ввод данных'],
    ['storage', 'Хранение данных']
  ];

  // Без полных данных оставляем обычные карточки, не показывая нерабочие элементы.
  if (!data || cards.some(card => !Object.hasOwn(data, card.id)
    || fields.some(([key]) => !data[card.id].comparison?.[key]))) return;

  const selected = new Set();
  const choices = new Map();
  const selectedList = document.getElementById('comparison-selected');
  const status = document.getElementById('comparison-status');
  const show = document.getElementById('comparison-show');
  const clear = document.getElementById('comparison-clear');
  const result = document.getElementById('comparison-result');
  const title = document.getElementById('comparison-title');
  title.tabIndex = -1;

  const renderTable = () => {
    const exhibits = [...selected].map(id => data[id]);
    const header = document.createElement('tr');
    const heading = document.createElement('th');
    heading.scope = 'col';
    heading.textContent = 'Характеристика';
    header.append(heading);

    for (const exhibit of exhibits) {
      const cell = document.createElement('th');
      cell.scope = 'col';
      const link = document.createElement('a');
      link.href = `exhibit.html?id=${encodeURIComponent(exhibit.id)}`;
      link.textContent = exhibit.name;
      cell.append(link);
      header.append(cell);
    }
    document.getElementById('comparison-head').replaceChildren(header);

    const rows = fields.map(([key, label]) => {
      const row = document.createElement('tr');
      const heading = document.createElement('th');
      heading.scope = 'row';
      heading.textContent = label;
      row.append(heading);
      for (const exhibit of exhibits) {
        const cell = document.createElement('td');
        cell.textContent = exhibit.comparison[key];
        row.append(cell);
      }
      return row;
    });
    document.getElementById('comparison-body').replaceChildren(...rows);
    result.querySelector('table').classList.toggle('comparison-table--three', selected.size === 3);
  };

  const update = () => {
    for (const [id, { input, link }] of choices) {
      input.checked = selected.has(id);
      input.disabled = selected.size === 3 && !selected.has(id);
      link.hidden = !selected.has(id);
    }

    status.textContent = `Выбрано: ${selected.size} из 3. ` + (selected.size === 3
      ? 'Чтобы добавить другое устройство, уберите одно из выбранных.'
      : selected.size < 2 ? 'Для сравнения нужны минимум два экспоната.' : 'Можно сравнить или добавить ещё один экспонат.');
    show.disabled = selected.size < 2;
    clear.disabled = selected.size === 0;

    const items = [...selected].map(id => {
      const item = document.createElement('li');
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'btn btn-outline-secondary btn-sm';
      remove.textContent = `${data[id].name} ×`;
      remove.setAttribute('aria-label', `Убрать из сравнения: ${data[id].name}`);
      remove.addEventListener('click', () => {
        selected.delete(id);
        update();
        title.focus({ preventScroll: true });
      });
      item.append(remove);
      return item;
    });
    selectedList.replaceChildren(...items);

    if (selected.size < 2) {
      result.hidden = true;
      document.getElementById('comparison-head').replaceChildren();
      document.getElementById('comparison-body').replaceChildren();
    } else if (!result.hidden) {
      renderTable();
    }
  };

  for (const card of cards) {
    const wrapper = document.createElement('div');
    wrapper.className = 'comparison-choice d-flex flex-wrap align-items-center gap-3 mt-3';
    const check = document.createElement('div');
    check.className = 'form-check mb-0';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'form-check-input';
    input.id = `compare-${card.id}`;
    input.setAttribute('aria-label', `В сравнение: ${data[card.id].name}`);
    input.setAttribute('aria-describedby', 'comparison-help comparison-status');
    const label = document.createElement('label');
    label.className = 'form-check-label';
    label.htmlFor = input.id;
    label.textContent = 'В сравнение';
    check.append(input, label);
    const link = document.createElement('a');
    link.href = '#comparison';
    link.textContent = 'К сравнению';
    link.hidden = true;
    wrapper.append(check, link);
    card.querySelector('.card-body').append(wrapper);
    choices.set(card.id, { input, link });
    input.addEventListener('change', () => {
      if (input.checked && selected.size < 3) selected.add(card.id);
      else selected.delete(card.id);
      update();
    });
  }

  show.addEventListener('click', () => {
    if (selected.size < 2) return;
    renderTable();
    result.hidden = false;
    const heading = document.getElementById('comparison-result-title');
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: 'start' });
  });

  clear.addEventListener('click', () => {
    selected.clear();
    update();
    title.focus({ preventScroll: true });
  });

  panel.hidden = false;
  update();
})();
