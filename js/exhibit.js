'use strict';

(() => {
  const id = new URLSearchParams(window.location.search).get('id');
  const data = window.exhibitsData;
  const message = document.getElementById('exhibit-message');
  const content = document.getElementById('exhibit-content');

  const setText = (elementId, text) => {
    document.getElementById(elementId).textContent = text;
  };

  if (!id || !data || !Object.hasOwn(data, id)) {
    const title = !id ? 'Экспонат не выбран' : 'Экспонат не найден';
    const description = !id
      ? 'Выберите устройство на странице экспозиций, чтобы открыть его описание.'
      : 'Такого экспоната нет в коллекции. Вернитесь к экспозициям и выберите другое устройство.';

    document.title = `${title} — ByteMuseum`;
    document.querySelector('meta[name="description"]').content = description;
    setText('exhibit-breadcrumb', title);
    setText('exhibit-message-title', title);
    setText('exhibit-message-text', description);
    return;
  }

  const exhibit = data[id];
  document.title = `${exhibit.name} — ByteMuseum`;
  document.querySelector('meta[name="description"]').content = `${exhibit.name} в ByteMuseum: ${exhibit.summary}`;

  setText('exhibit-breadcrumb', exhibit.name);
  setText('exhibit-title', exhibit.name);
  setText('exhibit-category', exhibit.category);
  setText('exhibit-summary', exhibit.summary);
  setText('exhibit-description', exhibit.description);
  setText('exhibit-exhibition', `Экспозиция «${exhibit.exhibition}». ${exhibit.era}.`);
  setText('exhibit-badge', exhibit.temporary ? 'Временная экспозиция' : 'Постоянная экспозиция');
  document.getElementById('exhibit-badge').classList.toggle('museum-badge--temporary', exhibit.temporary);

  const image = document.getElementById('exhibit-image');
  image.src = exhibit.image;
  image.alt = exhibit.imageAlt;
  document.getElementById('exhibit-back').href = `exhibitions.html#${encodeURIComponent(exhibit.id)}`;

  const history = exhibit.history.map((text, index) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    if (index === exhibit.history.length - 1) paragraph.classList.add('mb-0');
    return paragraph;
  });
  document.getElementById('exhibit-history').replaceChildren(...history);

  const rows = exhibit.specifications.map(({ label, value }) => {
    const row = document.createElement('tr');
    const heading = document.createElement('th');
    heading.scope = 'row';
    heading.textContent = label;
    const cell = document.createElement('td');
    cell.textContent = value;
    row.append(heading, cell);
    return row;
  });
  document.getElementById('exhibit-specifications').replaceChildren(...rows);

  message.hidden = true;
  content.hidden = false;

  // При открытии прямой ссылки с якорем раздел появляется только после заполнения.
  const anchor = window.location.hash.slice(1);
  if (['description', 'history', 'specifications'].includes(anchor)) {
    document.getElementById(anchor).scrollIntoView();
  }
})();
