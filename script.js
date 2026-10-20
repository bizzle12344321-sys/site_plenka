(function () {
  // Адрес обработчика заявок (см. send.php)
  var ENDPOINT = 'send.php';

  document.getElementById('year').textContent = new Date().getFullYear();

  // Фото: если файл из data-img существует, показываем его вместо заглушки
  document.querySelectorAll('[data-img]').forEach(function (box) {
    var img = new Image();
    img.className = 'media__img';
    img.alt = '';
    img.onload = function () { box.appendChild(img); box.classList.add('has-img'); };
    img.src = box.getAttribute('data-img');
  });

  // Мобильное меню
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  // Плавающая кнопка прячется, когда на экране основная форма
  var fab = document.querySelector('.fab');
  var request = document.getElementById('request');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      fab.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.25 }).observe(request);
  }

  // Маска телефона
  function formatPhone(value) {
    var d = value.replace(/\D/g, '');
    if (!d) return '';
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d[0] !== '7') d = '7' + d;
    d = d.slice(0, 11);
    var out = '+7';
    if (d.length > 1) out += ' (' + d.slice(1, 4);
    if (d.length >= 4) out += ')';
    if (d.length > 4) out += ' ' + d.slice(4, 7);
    if (d.length > 7) out += '-' + d.slice(7, 9);
    if (d.length > 9) out += '-' + d.slice(9, 11);
    return out;
  }
  document.querySelectorAll('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function () { input.value = formatPhone(input.value); });
  });

  // Отправка заявок
  var DONE_HTML =
    '<div class="form__done">' +
      '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6"/></svg>' +
      '<p>Ваша заявка отправлена.<br>С вами свяжутся в течение дня.</p>' +
    '</div>';

  document.querySelectorAll('[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var status = form.querySelector('.form__status');
      var nameField = form.elements['name'].closest('.field');
      var phoneField = form.elements['phone'].closest('.field');
      var phoneDigits = form.elements['phone'].value.replace(/\D/g, '');

      nameField.classList.toggle('is-invalid', !form.elements['name'].value.trim());
      phoneField.classList.toggle('is-invalid', phoneDigits.length !== 11);
      status.classList.remove('is-error');
      status.textContent = '';

      if (!form.elements['name'].value.trim() || phoneDigits.length !== 11) {
        status.classList.add('is-error');
        status.textContent = 'Укажите имя и телефон.';
        return;
      }

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Отправляем…';

      fetch(ENDPOINT, { method: 'POST', body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.ok) throw new Error();
          form.hidden = true;
          form.insertAdjacentHTML('afterend', DONE_HTML);
          btn.disabled = false;
          btn.textContent = 'Отправить заявку';
        })
        .catch(function () {
          btn.disabled = false;
          btn.textContent = 'Отправить заявку';
          status.classList.add('is-error');
          status.textContent = 'Не удалось отправить. Позвоните нам: +7 (999) 000-00-00';
        });
    });
  });
})();
