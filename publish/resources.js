// Free resource forms on /free-resources/: POST to /api/resource, then show
// a confirmation in place of the form.
(function () {
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
    status.textContent = 'Sending\u2026';

    fetch('/api/resource', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value.trim(),
        resource: form.getAttribute('data-resource'),
        newsletter: form.querySelector('[name="newsletter"]').checked,
        honeypot: form.querySelector('[name="company_website"]').value,
        source: window.location.pathname,
      }),
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; });
      })
      .then(function (result) {
        if (!result.ok) {
          status.setAttribute('data-state', 'error');
          status.textContent = result.data.error || 'Something went wrong. Try again.';
          button.disabled = false;
          return;
        }
        var done = document.createElement('div');
        done.className = 'res-done';
        done.setAttribute('role', 'status');
        done.innerHTML = '<strong>Sent. Check your inbox.</strong><span>It should arrive within a minute. If not, look in spam or promotions.</span>';
        form.replaceWith(done);
      })
      .catch(function () {
        status.setAttribute('data-state', 'error');
        status.textContent = 'Network error. Check your connection and try again.';
        button.disabled = false;
      });
  });
})();
