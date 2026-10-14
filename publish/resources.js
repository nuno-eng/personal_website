// Free resource forms on /free-resources/ and /pt/free-resources/: POST to
// /api/resource, then show a confirmation in place of the form.
(function () {
  var LANG = document.documentElement.lang === 'pt' ? 'pt' : 'en';
  var T = {
    en: { sending: 'Sending\u2026', failed: 'Something went wrong. Try again.', network: 'Network error. Check your connection and try again.',
          doneTitle: 'Sent. Check your inbox.', doneBody: 'It should arrive within a minute. If not, look in spam or promotions.' },
    pt: { sending: 'A enviar\u2026', failed: 'Algo correu mal. Tente novamente.', network: 'Erro de rede. Verifique a liga\u00e7\u00e3o e tente novamente.',
          doneTitle: 'Enviado. Verifique a caixa de entrada.', doneBody: 'Deve chegar dentro de um minuto. Se n\u00e3o chegar, veja no spam ou nas promo\u00e7\u00f5es.' },
  }[LANG];
  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.matches || !form.matches('form[data-resource-form]')) return;
    event.preventDefault();

    var email = form.querySelector('[name="email"]');
    if (!email.checkValidity()) {
      email.reportValidity();
      return;
    }
    var status = form.querySelector('[data-status]');
    var button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.removeAttribute('data-state');
    status.textContent = T.sending;

    fetch('/api/resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        resource: form.getAttribute('data-resource'),
        newsletter: form.querySelector('[name="newsletter"]').checked,
        honeypot: form.querySelector('[name="company_website"]').value,
        source: window.location.pathname,
        lang: LANG,
      }),
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          status.setAttribute('data-state', 'error');
          status.textContent = result.data.error || T.failed;
          button.disabled = false;
          return;
        }
        var done = document.createElement('div');
        done.className = 'res-done';
        done.setAttribute('role', 'status');
        done.innerHTML = '<strong>' + T.doneTitle + '</strong><span>' + T.doneBody + '</span>';
        form.replaceWith(done);
      })
      .catch(function () {
        status.setAttribute('data-state', 'error');
        status.textContent = T.network;
        button.disabled = false;
      });
  });
})();
