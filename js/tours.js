'use strict';

(() => {
  const form = document.getElementById('tour-form');
  const fields = document.getElementById('tour-fields');
  const errors = document.getElementById('tour-errors');

  if (!window.bootstrap?.Modal) {
    document.getElementById('tour-unavailable').hidden = false;
    return;
  }

  const tours = {
    overview: {
      name: 'От счётов до компьютера',
      duration: 60,
      description: 'Обзорная экскурсия: ручные вычисления, механические машины и персональные компьютеры.'
    },
    pocket: {
      name: 'Вычисления на ладони',
      duration: 45,
      description: 'История карманной техники: от электронного калькулятора до цифрового помощника.'
    },
    storage: {
      name: 'Как сохранить информацию',
      duration: 45,
      description: 'Путь от перфокарты к магнитным и оптическим носителям информации.'
    }
  };

  const tour = form.elements.namedItem('tour');
  const date = form.elements.namedItem('date');
  const name = form.elements.namedItem('name');
  const email = form.elements.namedItem('email');
  const phone = form.elements.namedItem('phone');
  const controls = [...form.querySelectorAll('input, select, textarea')];
  const modalElement = document.getElementById('tour-result');
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);

  for (const [id, entry] of Object.entries(tours)) {
    tour.add(new Option(`${entry.name} · ${entry.duration} мин`, id));
  }

  // Дата записи определяется по времени музея, а не по часовому поясу браузера.
  const todayParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const parts = Object.fromEntries(todayParts.map(part => [part.type, part.value]));
  const tomorrow = new Date(`${parts.year}-${parts.month}-${parts.day}T12:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  date.min = tomorrow.toISOString().slice(0, 10);

  const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
  document.getElementById('date-help').textContent =
    `Запись минимум за день, начиная с ${dateFormatter.format(tomorrow)}. По понедельникам музей закрыт.`;

  const updateTour = () => {
    const selected = tours[tour.value];
    document.getElementById('tour-help').textContent = selected
      ? `${selected.description} Продолжительность — ${selected.duration} мин.`
      : 'Выберите тему, чтобы увидеть описание и продолжительность.';
  };

  const validate = () => {
    name.setCustomValidity('');
    if (name.value && name.value.trim().length < 2) {
      name.setCustomValidity('Укажите имя: минимум два символа, кроме пробелов.');
    }

    phone.setCustomValidity('');
    const digits = phone.value.replace(/\D/g, '');
    if (phone.value && (!/^\+?[\d\s().-]+$/.test(phone.value.trim()) || digits.length < 10 || digits.length > 15)) {
      phone.setCustomValidity('Телефон должен содержать от 10 до 15 цифр.');
    }

    date.setCustomValidity('');
    if (date.value && date.value < date.min) {
      date.setCustomValidity('Выберите дату не раньше указанной в подсказке.');
    } else if (date.value && new Date(`${date.value}T12:00:00Z`).getUTCDay() === 1) {
      date.setCustomValidity('В понедельник музей закрыт. Выберите другой день.');
    }
    document.getElementById('date-error').textContent = date.validationMessage || 'Укажите дату экскурсии.';

    for (const control of controls) {
      if (control.willValidate) {
        control.setAttribute('aria-invalid', String(!control.validity.valid));
      }
    }
    return form.checkValidity();
  };

  tour.addEventListener('change', updateTour);
  for (const event of ['input', 'change']) {
    form.addEventListener(event, () => {
      if (form.classList.contains('was-validated')) errors.hidden = validate();
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    name.value = name.value.trim();
    email.value = email.value.trim();
    phone.value = phone.value.trim();
    form.classList.add('was-validated');

    if (!validate()) {
      errors.hidden = false;
      const invalid = form.querySelector('input:invalid, select:invalid, textarea:invalid');
      invalid.focus();
      invalid.scrollIntoView({ block: 'center' });
      return;
    }
    errors.hidden = true;

    const values = new FormData(form);
    const selected = tours[values.get('tour')];
    const summary = {
      tour: selected.name,
      duration: `${selected.duration} мин`,
      date: dateFormatter.format(new Date(`${values.get('date')}T12:00:00Z`)),
      time: values.get('time'),
      participants: values.get('participants'),
      name: values.get('name'),
      email: values.get('email'),
      phone: values.get('phone'),
      comment: values.get('comment').trim() || 'Не указан'
    };
    for (const [key, value] of Object.entries(summary)) {
      document.getElementById(`summary-${key}`).textContent = value;
    }
    modal.show();
  });

  modalElement.addEventListener('hidden.bs.modal', () => {
    document.getElementById('tour-submit').focus({ preventScroll: true });
  });

  form.addEventListener('reset', () => {
    form.classList.remove('was-validated');
    errors.hidden = true;
    for (const control of controls) {
      control.setCustomValidity('');
      control.removeAttribute('aria-invalid');
    }
    queueMicrotask(updateTour);
  });

  // До запуска JavaScript поля выключены, чтобы форма не отправила контакты случайным GET-запросом.
  form.noValidate = true;
  fields.disabled = false;
  updateTour();
})();
