// Newsletter signup behaviour for every page. Any
// <form data-newsletter data-lang="en|pt"> posts to /api/subscribe.
//
// The home pages are rendered by the dc-runtime (React) after load, so the
// handlers are delegated from document instead of bound to the form.
//
// Markup it looks for inside the closest [data-newsletter-root]:
//   form[data-newsletter]          email, optional name, honeypot inputs
//   [data-newsletter-status]       progress / error text
//   [data-newsletter-success]      shown (hidden attribute removed) on success
//   [data-newsletter-link]         filled with the subscriber's referral link
//   [data-newsletter-share]        hidden when there is no referral link
//   [data-newsletter-copy]         copies the referral link
//   a[data-share="linkedin|email"] share targets
(function () {
  var REF_KEY = 'nf_ref';
  var STRINGS = {
    en: {
      sending: 'Subscribing…',
      error: 'Something went wrong. Try again.',
      network: 'Network error. Check your connection and try again.',
      copied: 'Copied',
      shareSubject: 'Worth subscribing: Operating Notes',
      shareBody: 'Nuno Fontoura writes one practical operations idea per issue for founders. Worth a look: ',
    },
    pt: {
      sending: 'A subscrever…',
      error: 'Algo correu mal. Tente novamente.',
      network: 'Erro de rede. Verifique a ligação e tente novamente.',
      copied: 'Copiado',
      shareSubject: 'Vale a pena subscrever: Notas Operacionais',
      shareBody: 'O Nuno Fontoura escreve uma ideia operacional prática por edição para fundadores. Vale a pena: ',
    },
  };

  // Remember a referral code from any page, so credit isn't lost if the
  // visitor browses around before subscribing.
  try {
    var ref = new URLSearchParams(window.location.search).get('ref');
    if (ref && /^[a-f0-9]{8,32}$/.test(ref)) window.localStorage.setItem(REF_KEY, ref);
  } catch (e) {}

  function storedRef() {
    try {
      return window.localStorage.getItem(REF_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function source() {
    var params = new URLSearchParams(window.location.search);
    var utm = params.get('utm_source');
    return window.location.pathname + (utm ? '?utm_source=' + utm : '');
  }

  function setStatus(root, text, state) {
    var el = root.querySelector('[data-newsletter-status]');
    if (!el) return;
    el.textContent = text;
    if (state) el.setAttribute('data-state', state);
    else el.removeAttribute('data-state');
  }

  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.matches || !form.matches('form[data-newsletter]')) return;
    event.preventDefault();

    var root = form.closest('[data-newsletter-root]') || form;
    var lang = form.getAttribute('data-lang') === 'pt' ? 'pt' : 'en';
    var t = STRINGS[lang];
    var field = function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      return input ? input.value.trim() : '';
    };
    var emailInput = form.querySelector('[name="email"]');
    if (emailInput && !emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }

    var button = form.querySelector('button[type="submit"]');
    if (button) button.disabled = true;
    setStatus(root, t.sending);

    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: field('email'),
        name: field('name'),
        honeypot: field('company_website'),
        lang: lang,
        ref: storedRef(),
        source: source(),
      }),
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (data) {
            return { ok: res.ok, data: data };
          });
      })
      .then(function (result) {
        if (!result.ok) {
          setStatus(root, result.data.error || t.error, 'error');
          if (button) button.disabled = false;
          return;
        }
        setStatus(root, '');
        form.hidden = true;
        showSuccess(root, result.data.referralLink, t);
      })
      .catch(function () {
        setStatus(root, t.network, 'error');
        if (button) button.disabled = false;
      });
  });

  function showSuccess(root, link, t) {
    var success = root.querySelector('[data-newsletter-success]');
    if (!success) return;
    success.hidden = false;

    var share = success.querySelector('[data-newsletter-share]');
    if (!link) {
      if (share) share.hidden = true;
      return;
    }
    var linkEl = success.querySelector('[data-newsletter-link]');
    if (linkEl) {
      linkEl.textContent = link;
      if (linkEl.tagName === 'A') linkEl.href = link;
    }
    var copyBtn = success.querySelector('[data-newsletter-copy]');
    if (copyBtn) copyBtn.setAttribute('data-link', link);
    var linkedin = success.querySelector('a[data-share="linkedin"]');
    if (linkedin) linkedin.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(link);
    var mail = success.querySelector('a[data-share="email"]');
    if (mail) {
      mail.href =
        'mailto:?subject=' + encodeURIComponent(t.shareSubject) + '&body=' + encodeURIComponent(t.shareBody + link);
    }
  }

  document.addEventListener('click', function (event) {
    var btn = event.target.closest && event.target.closest('[data-newsletter-copy]');
    if (!btn || !navigator.clipboard) return;
    var root = btn.closest('[data-newsletter-root]');
    var form = root && root.querySelector('form[data-newsletter]');
    var t = STRINGS[form && form.getAttribute('data-lang') === 'pt' ? 'pt' : 'en'];
    navigator.clipboard.writeText(btn.getAttribute('data-link') || '').then(function () {
      var original = btn.textContent;
      btn.textContent = t.copied;
      setTimeout(function () {
        btn.textContent = original;
      }, 1500);
    });
  });
})();
