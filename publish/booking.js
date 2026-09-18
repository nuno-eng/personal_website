// Discovery call booker. Mounts into every [data-booking] element.
//   data-lang="en|pt"          language
//   data-mode="manage"         reschedule/cancel an existing booking (id & t from the URL)
(function () {
  var S = {
    en: {
      prevWeek: 'Previous week', nextWeek: 'Next week', showAll: function (n) { return 'Show all ' + n + ' times'; }, showFewer: 'Show fewer times', noTimesDay: 'No times this day',
      tzNote: 'Times are in your time zone: ', suggestLink: 'None of these work? Suggest a time', suggestTitle: 'Suggest a time', suggestSub: 'Tell me when suits you and I\u2019ll confirm one of your times, or propose another, by the end of the next working day.',
      option: function (n) { return 'Option ' + n; }, date: 'Date', time: 'Time', note: 'Anything else? (optional)', sendSuggest: 'Send suggested times', timesRequired: 'Suggest at least one date and time.',
      suggested: 'Thanks. I\u2019ve got your suggested times and will confirm one by the end of the next working day. A copy is on its way to your inbox.', backToTimes: 'Back to available times',
      title: 'Book a 30-minute discovery call', sub: 'Pick a time. Shown in your time zone: ', loading: 'Loading available times…',
      none: 'No times are available in the next four weeks. Email support@nabiaedge.com and I’ll find one.', loadError: 'Could not load available times. Refresh the page or email support@nabiaedge.com.',
      change: 'Change time', name: 'Your name', email: 'Email', agency: 'Agency name', website: 'Website (optional)', agencyType: 'What kind of agency is it?', teamSize: 'How many people work in the business?',
      problem: 'What’s the one operational problem you most want to fix?', urgency: 'How soon do you want to fix it?', heardFrom: 'How did you hear about me? (optional)', choose: 'Choose…',
      confirm: 'Confirm booking', sending: 'Booking…', required: 'Please fill in all required fields.', network: 'Network error. Try again.',
      privacy: 'Your answers are only used to prepare for the call. <a href="/privacy/">Privacy policy</a>.',
      manageTitle: 'Your discovery call', current: 'Currently booked for', cancel: 'Cancel this call', cancelConfirm: 'Cancel the call? This can’t be undone.',
      cancelled: 'Your call is cancelled. A confirmation is on its way to your inbox.', rebook: 'Book a new time', reschedule: 'Or pick a new time', moveTo: 'Move my call to this time',
      moved: 'Done. Your call is moved and the calendar invitation is updated.', invalid: 'This link is invalid or has expired.', past: 'This call has already taken place.', wasCancelled: 'This call was cancelled.',
      agencyTypes: { 'brand-activation': 'Brand activation / signage', creative: 'Creative / design', marketing: 'Marketing / advertising', production: 'Production', other: 'Other' },
      teamSizes: { '1-5': '1–5', '6-15': '6–15', '16-50': '16–50', '50+': '50+' },
      urgencies: { asap: 'As soon as possible', '3-months': 'In the next 3 months', exploring: 'Just exploring' },
      heard: { linkedin: 'LinkedIn', google: 'Google', newsletter: 'Newsletter', referral: 'Referral', event: 'Event', other: 'Other' },
      booked: '/call-booked/', book: '/book/', locale: 'en-GB',
    },
    pt: {
      prevWeek: 'Semana anterior', nextWeek: 'Semana seguinte', showAll: function (n) { return 'Mostrar as ' + n + ' horas'; }, showFewer: 'Mostrar menos horas', noTimesDay: 'Sem horas neste dia',
      tzNote: 'As horas estão no seu fuso horário: ', suggestLink: 'Nenhuma serve? Sugira uma hora', suggestTitle: 'Sugerir uma hora', suggestSub: 'Diga-me quando lhe dá jeito e confirmo uma das suas horas, ou proponho outra, até ao fim do próximo dia útil.',
      option: function (n) { return 'Opção ' + n; }, date: 'Data', time: 'Hora', note: 'Mais alguma coisa? (opcional)', sendSuggest: 'Enviar sugestões', timesRequired: 'Sugira pelo menos uma data e hora.',
      suggested: 'Obrigado. Recebi as suas sugestões e confirmo uma até ao fim do próximo dia útil. Vai receber uma cópia por email.', backToTimes: 'Voltar às horas disponíveis',
      title: 'Marcar uma chamada exploratória de 30 minutos', sub: 'Escolha uma hora. No seu fuso horário: ', loading: 'A carregar horas disponíveis…',
      none: 'Não há horas disponíveis nas próximas quatro semanas. Escreva para support@nabiaedge.com e encontro uma.', loadError: 'Não foi possível carregar as horas. Atualize a página ou escreva para support@nabiaedge.com.',
      change: 'Mudar hora', name: 'O seu nome', email: 'Email', agency: 'Nome da agência', website: 'Website (opcional)', agencyType: 'Que tipo de agência é?', teamSize: 'Quantas pessoas trabalham no negócio?',
      problem: 'Qual é o problema operacional que mais quer resolver?', urgency: 'Quando quer resolvê-lo?', heardFrom: 'Como me conheceu? (opcional)', choose: 'Escolha…',
      confirm: 'Confirmar marcação', sending: 'A marcar…', required: 'Preencha todos os campos obrigatórios.', network: 'Erro de rede. Tente novamente.',
      privacy: 'As suas respostas só são usadas para preparar a chamada. <a href="/pt/privacy/">Política de privacidade</a>.',
      manageTitle: 'A sua chamada exploratória', current: 'Marcada para', cancel: 'Cancelar esta chamada', cancelConfirm: 'Cancelar a chamada? Não é possível desfazer.',
      cancelled: 'A chamada foi cancelada. Vai receber uma confirmação por email.', rebook: 'Marcar nova hora', reschedule: 'Ou escolha uma nova hora', moveTo: 'Mudar a chamada para esta hora',
      moved: 'Feito. A chamada foi mudada e o convite de calendário atualizado.', invalid: 'Este link é inválido ou expirou.', past: 'Esta chamada já decorreu.', wasCancelled: 'Esta chamada foi cancelada.',
      agencyTypes: { 'brand-activation': 'Brand activation / sinalética', creative: 'Criativa / design', marketing: 'Marketing / publicidade', production: 'Produção', other: 'Outra' },
      teamSizes: { '1-5': '1–5', '6-15': '6–15', '16-50': '16–50', '50+': '50+' },
      urgencies: { asap: 'O mais rápido possível', '3-months': 'Nos próximos 3 meses', exploring: 'Só a explorar' },
      heard: { linkedin: 'LinkedIn', google: 'Google', newsletter: 'Newsletter', referral: 'Recomendação', event: 'Evento', other: 'Outro' },
      booked: '/pt/call-booked/', book: '/pt/book/', locale: 'pt-PT',
    },
  };

  var tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'Europe/London';

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function fmtDay(d, t) { return new Intl.DateTimeFormat(t.locale, { weekday: 'short', timeZone: tz }).format(d); }
  function fmtDate(d, t) { return new Intl.DateTimeFormat(t.locale, { day: 'numeric', timeZone: tz }).format(d); }
  function fmtMonth(d, t) { return new Intl.DateTimeFormat(t.locale, { month: 'short', timeZone: tz }).format(d); }
  function fmtTime(d, t) { return new Intl.DateTimeFormat(t.locale, { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz }).format(d); }
  function fmtFull(d, t) { return new Intl.DateTimeFormat(t.locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz }).format(d) + ', ' + fmtTime(d, t); }
  function dayKey(d) { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d); }

  function api(method, url, body) {
    return fetch(url, { method: method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, data: d }; }); });
  }

  function weekStart(d) {
    // Monday of the week containing d, as a local date key
    var parts = dayKey(d).split('-').map(Number);
    var local = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    var dow = (local.getUTCDay() + 6) % 7;
    local.setUTCDate(local.getUTCDate() - dow);
    return local;
  }
  function addDays(date, n) { var x = new Date(date.getTime()); x.setUTCDate(x.getUTCDate() + n); return x; }
  function keyOfUtcDate(x) { return x.toISOString().slice(0, 10); }
  function labelOfUtcDate(x, t, opts) { return new Intl.DateTimeFormat(t.locale, Object.assign({ timeZone: 'UTC' }, opts)).format(x); }

  function picker(root, t, query, onPick, extra) {
    var wrap = el('div');
    var msg = el('p', { class: 'bk-msg', role: 'status' }, esc(t.loading));
    wrap.appendChild(msg);
    root.appendChild(wrap);
    api('GET', '/api/booking/slots' + (query || '')).then(function (res) {
      if (!res.ok) { msg.setAttribute('data-state', 'error'); msg.textContent = res.data.error || t.loadError; return; }
      var slots = (res.data.slots || []).map(function (s) { return new Date(s); });
      wrap.innerHTML = '';
      if (!slots.length) { wrap.appendChild(el('p', { class: 'bk-empty' }, esc(t.none))); if (extra) extra(wrap); return; }
      var byDay = {};
      slots.forEach(function (s) { var k = dayKey(s); (byDay[k] = byDay[k] || []).push(s); });
      var weeks = [];
      slots.forEach(function (s) { var w = keyOfUtcDate(weekStart(s)); if (weeks.indexOf(w) < 0) weeks.push(w); });
      var weekIndex = 0, selected = null, expanded = false;

      var nav = el('div', { class: 'bk-weeknav' });
      var prev = el('button', { type: 'button', class: 'bk-arrow', 'aria-label': t.prevWeek }, '&lsaquo;');
      var label = el('span', { class: 'bk-weeklabel', 'aria-live': 'polite' });
      var next = el('button', { type: 'button', class: 'bk-arrow', 'aria-label': t.nextWeek }, '&rsaquo;');
      nav.appendChild(prev); nav.appendChild(label); nav.appendChild(next);
      var days = el('div', { class: 'bk-week', role: 'group' });
      var times = el('div', { class: 'bk-times' });
      var more = el('button', { type: 'button', class: 'bk-link bk-more' });

      function renderTimes() {
        times.innerHTML = '';
        var list = byDay[selected] || [];
        var shown = list;
        if (!expanded && list.length > 8) {
          shown = list.filter(function (s) { return /:00$/.test(fmtTime(s, t)); });
          if (shown.length < 4) shown = list.filter(function (_, i) { return i % 2 === 0; });
        }
        shown.forEach(function (s) {
          var b = el('button', { type: 'button', class: 'bk-time' }, esc(fmtTime(s, t)));
          b.addEventListener('click', function () { onPick(s); });
          times.appendChild(b);
        });
        if (list.length > shown.length || expanded && list.length > 8) {
          more.hidden = false;
          more.textContent = expanded ? t.showFewer : t.showAll(list.length);
        } else more.hidden = true;
      }
      function renderWeek() {
        var monday = new Date(weeks[weekIndex] + 'T00:00:00Z');
        var cols = [0, 1, 2, 3, 4].concat([5, 6].filter(function (i) { return byDay[keyOfUtcDate(addDays(monday, i))]; }));
        days.style.gridTemplateColumns = 'repeat(' + cols.length + ', minmax(0, 1fr))';
        days.innerHTML = '';
        var last = addDays(monday, cols[cols.length - 1]);
        label.textContent = labelOfUtcDate(monday, t, { day: 'numeric', month: 'short' }) + ' – ' + labelOfUtcDate(last, t, { day: 'numeric', month: 'short' });
        var firstAvailable = null;
        cols.forEach(function (i) {
          var date = addDays(monday, i), k = keyOfUtcDate(date), has = !!byDay[k];
          if (has && !firstAvailable) firstAvailable = k;
          var b = el('button', { type: 'button', class: 'bk-day', 'data-key': k, 'aria-pressed': 'false' },
            '<span>' + esc(labelOfUtcDate(date, t, { weekday: 'short' })) + '</span><b>' + esc(labelOfUtcDate(date, t, { day: 'numeric' })) + '</b>');
          if (!has) { b.disabled = true; b.title = t.noTimesDay; }
          b.addEventListener('click', function () { select(k); });
          days.appendChild(b);
        });
        prev.disabled = weekIndex === 0;
        next.disabled = weekIndex === weeks.length - 1;
        select(byDay[selected] && keyOfUtcDate(weekStart(byDay[selected][0])) === weeks[weekIndex] ? selected : firstAvailable);
      }
      function select(k) {
        selected = k; expanded = false;
        [].forEach.call(days.children, function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-key') === k)); });
        renderTimes();
      }
      prev.addEventListener('click', function () { if (weekIndex > 0) { weekIndex--; renderWeek(); } });
      next.addEventListener('click', function () { if (weekIndex < weeks.length - 1) { weekIndex++; renderWeek(); } });
      more.addEventListener('click', function () { expanded = !expanded; renderTimes(); });

      wrap.appendChild(nav); wrap.appendChild(days); wrap.appendChild(times); wrap.appendChild(more);
      renderWeek();
      if (extra) extra(wrap);
    }).catch(function () { msg.setAttribute('data-state', 'error'); msg.textContent = t.loadError; });
  }

  function fieldsHtml(t, id) {
    return       '<div class="bk-row"><label><span>' + esc(t.name) + ' *</span><input class="input" id="' + id + '-name" name="name" autocomplete="name" required maxlength="100"></label>' +
      '<label><span>' + esc(t.email) + ' *</span><input class="input" id="' + id + '-email" name="email" type="email" autocomplete="email" required></label></div>' +
      '<div class="bk-row"><label><span>' + esc(t.agency) + ' *</span><input class="input" id="' + id + '-agency" name="agency" autocomplete="organization" required maxlength="200"></label>' +
      '<label><span>' + esc(t.website) + '</span><input class="input" id="' + id + '-website" name="website" type="text" inputmode="url" autocomplete="url" placeholder="agency.com" maxlength="200"></label></div>' +
      '<div class="bk-row"><label><span>' + esc(t.agencyType) + ' *</span><select class="input" id="' + id + '-type" name="agencyType" required>' + options(t.agencyTypes, t) + '</select></label>' +
      '<label><span>' + esc(t.teamSize) + ' *</span><select class="input" id="' + id + '-size" name="teamSize" required>' + options(t.teamSizes, t) + '</select></label></div>' +
      '<label><span>' + esc(t.problem) + ' *</span><textarea class="input" id="' + id + '-problem" name="problem" required maxlength="2000"></textarea></label>' +
      '<div class="bk-row"><label><span>' + esc(t.urgency) + ' *</span><select class="input" id="' + id + '-urgency" name="urgency" required>' + options(t.urgencies, t) + '</select></label>' +
      '<label><span>' + esc(t.heardFrom) + '</span><select class="input" id="' + id + '-heard" name="heardFrom">' + options(t.heard, t) + '</select></label></div>';
  }

  function options(map, t) {
    var h = '<option value="">' + esc(t.choose) + '</option>';
    for (var k in map) h += '<option value="' + esc(k) + '">' + esc(map[k]) + '</option>';
    return h;
  }

  function bookFlow(root, t, lang) {
    root.innerHTML = '';
    root.appendChild(el('h3', {}, esc(t.title)));
    root.appendChild(el('p', { class: 'bk-sub' }, esc(t.sub) + '<strong>' + esc(tz.replace(/_/g, ' ')) + '</strong>'));
    picker(root, t, '', function (start) { formStep(root, t, lang, start); }, function (wrap) {
      var link = el('button', { type: 'button', class: 'bk-link bk-suggest' }, esc(t.suggestLink));
      link.addEventListener('click', function () { suggestFlow(root, t, lang); });
      wrap.appendChild(el('p', { class: 'bk-suggest-row' })).appendChild(link);
    });
  }

  function suggestFlow(root, t, lang) {
    root.innerHTML = '';
    root.appendChild(el('h3', {}, esc(t.suggestTitle)));
    root.appendChild(el('p', { class: 'bk-sub' }, esc(t.suggestSub) + '<br>' + esc(t.tzNote) + '<strong>' + esc(tz.replace(/_/g, ' ')) + '</strong>'));
    var id = 'bs' + Math.random().toString(36).slice(2, 7);
    var today = dayKey(new Date());
    var rows = '';
    for (var i = 1; i <= 3; i++) {
      rows += '<div class="bk-row bk-option"><label><span>' + esc(t.option(i)) + ' · ' + esc(t.date) + (i === 1 ? ' *' : '') + '</span><input class="input" type="date" name="date' + i + '" min="' + today + '"' + (i === 1 ? ' required' : '') + '></label>' +
        '<label><span>' + esc(t.time) + (i === 1 ? ' *' : '') + '</span><input class="input" type="time" name="time' + i + '" step="1800"' + (i === 1 ? ' required' : '') + '></label></div>';
    }
    var form = el('form', { class: 'bk-form', novalidate: '' },
      rows + fieldsHtml(t, id) +
      '<label><span>' + esc(t.note) + '</span><textarea class="input" name="note" maxlength="1000"></textarea></label>' +
      '<div class="bk-hp" aria-hidden="true"><input name="company_website" tabindex="-1" autocomplete="off"></div>' +
      '<div class="bk-actions"><button class="btn btn-primary" type="submit">' + esc(t.sendSuggest) + '</button><button type="button" class="bk-link bk-back">' + esc(t.backToTimes) + '</button></div>' +
      '<p class="bk-msg" role="status" aria-live="polite"></p><p class="bk-sub" style="margin:0">' + t.privacy + '</p>');
    root.appendChild(form);
    form.querySelector('.bk-back').addEventListener('click', function () { bookFlow(root, t, lang); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.bk-msg');
      var f = form.elements;
      var opts = [];
      for (var i = 1; i <= 3; i++) {
        if (f['date' + i].value && f['time' + i].value) {
          var d = new Date(f['date' + i].value + 'T' + f['time' + i].value);
          if (!isNaN(d)) opts.push(d.toISOString());
        }
      }
      var invalid = [].filter.call(form.querySelectorAll('[required]'), function (x) { return !x.value.trim() || !x.checkValidity(); });
      if (!opts.length) { msg.setAttribute('data-state', 'error'); msg.textContent = t.timesRequired; f.date1.focus(); return; }
      if (invalid.length) { msg.setAttribute('data-state', 'error'); msg.textContent = t.required; invalid[0].focus(); return; }
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; msg.removeAttribute('data-state'); msg.textContent = t.sending;
      api('POST', '/api/booking/request', {
        options: opts, note: f.note.value, name: f.name.value, email: f.email.value, agency: f.agency.value, website: f.website.value,
        agencyType: f.agencyType.value, teamSize: f.teamSize.value, problem: f.problem.value, urgency: f.urgency.value, heardFrom: f.heardFrom.value,
        honeypot: f.company_website.value, lang: lang, tz: tz, source: location.pathname,
      }).then(function (res) {
        if (!res.ok) { msg.setAttribute('data-state', 'error'); msg.textContent = res.data.error || t.network; btn.disabled = false; return; }
        root.innerHTML = '';
        root.appendChild(el('h3', {}, esc(t.suggestTitle)));
        root.appendChild(el('p', {}, esc(t.suggested)));
      }).catch(function () { msg.setAttribute('data-state', 'error'); msg.textContent = t.network; btn.disabled = false; });
    });
  }

  function approveFlow(root) {
    var params = new URLSearchParams(location.search);
    var r = params.get('r'), token = params.get('t'), preferred = params.get('o');
    root.innerHTML = '<h3>Suggested times</h3><p class="bk-msg" role="status">Loading\u2026</p>';
    var msg = root.querySelector('.bk-msg');
    var ukTime = function (iso) { return new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso)); };
    api('GET', '/api/booking/request?r=' + encodeURIComponent(r || '') + '&t=' + encodeURIComponent(token || '')).then(function (res) {
      if (!res.ok) { msg.setAttribute('data-state', 'error'); msg.textContent = 'This link is invalid.'; return; }
      var q = res.data;
      msg.textContent = '';
      root.appendChild(el('div', { class: 'bk-chosen' }, '<strong>' + esc(q.name) + '</strong><span>' + esc(q.agency) + (q.website ? ' \u00b7 ' + esc(q.website) : '') + '</span><span>' + esc(q.email) + '</span>'));
      root.appendChild(el('p', { class: 'bk-sub' }, '<strong>Problem:</strong> ' + esc(q.problem) + (q.note ? '<br><strong>Note:</strong> ' + esc(q.note) : '')));
      if (q.status !== 'pending') {
        root.appendChild(el('p', {}, 'Already booked' + (q.acceptedOption != null ? ' for ' + esc(ukTime(q.options[q.acceptedOption].start)) + ' (UK time)' : '') + '.'));
        return;
      }
      var list = el('div', { class: 'bk-approve' });
      q.options.forEach(function (o, i) {
        var row = el('div', { class: 'bk-chosen' + (String(i) === preferred ? ' bk-preferred' : '') },
          '<strong>' + esc(ukTime(o.start)) + '</strong><span>UK time</span>' +
          (o.past ? '<span class="bk-flag">In the past</span>' : o.conflict ? '<span class="bk-flag">Clashes with your calendar</span>' : o.conflict === false ? '<span class="bk-ok">Free in your calendar</span>' : ''));
        if (!o.past) {
          var btn = el('button', { type: 'button', class: 'btn btn-primary' }, 'Book this time');
          btn.addEventListener('click', function () {
            [].forEach.call(list.querySelectorAll('button'), function (x) { x.disabled = true; });
            status.removeAttribute('data-state'); status.textContent = 'Booking\u2026';
            api('POST', '/api/booking/request', { r: r, t: token, action: 'accept', option: i }).then(function (x) {
              if (!x.ok) { status.setAttribute('data-state', 'error'); status.textContent = x.data.error || 'Something went wrong.'; [].forEach.call(list.querySelectorAll('button'), function (y) { y.disabled = false; }); return; }
              list.innerHTML = '';
              status.textContent = 'Booked for ' + ukTime(x.data.start) + ' (UK time). The calendar invitation, Meet link and confirmation have been sent to ' + q.email + '.';
            });
          });
          row.appendChild(btn);
        }
        list.appendChild(row);
      });
      root.appendChild(list);
      var status = el('p', { class: 'bk-msg', role: 'status', 'aria-live': 'polite' });
      root.appendChild(status);
      root.appendChild(el('p', { class: 'bk-sub' }, 'None of these work? Reply to the alert email to write to ' + esc(q.name.split(' ')[0]) + ' directly.'));
    });
  }

  function formStep(root, t, lang, start) {
    root.innerHTML = '';
    root.appendChild(el('h3', {}, esc(t.title)));
    var chosen = el('div', { class: 'bk-chosen' }, '<strong>' + esc(fmtFull(start, t)) + '</strong><span>' + esc(tz.replace(/_/g, ' ')) + '</span>');
    var back = el('button', { type: 'button', class: 'bk-link' }, esc(t.change));
    back.addEventListener('click', function () { bookFlow(root, t, lang); });
    chosen.appendChild(back);
    root.appendChild(chosen);
    var id = 'bk' + Math.random().toString(36).slice(2, 7);
    var form = el('form', { class: 'bk-form', novalidate: '' },
      fieldsHtml(t, id) +
      '<div class="bk-hp" aria-hidden="true"><input name="company_website" tabindex="-1" autocomplete="off"></div>' +
      '<div class="bk-actions"><button class="btn btn-primary" type="submit">' + esc(t.confirm) + '</button></div>' +
      '<p class="bk-msg" role="status" aria-live="polite"></p><p class="bk-sub" style="margin:0">' + t.privacy + '</p>');
    root.appendChild(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = form.querySelector('.bk-msg');
      var invalid = [].filter.call(form.querySelectorAll('[required]'), function (f) { return !f.value.trim() || !f.checkValidity(); });
      if (invalid.length) { msg.setAttribute('data-state', 'error'); msg.textContent = t.required; invalid[0].focus(); return; }
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true; msg.removeAttribute('data-state'); msg.textContent = t.sending;
      var f = form.elements;
      api('POST', '/api/booking', {
        start: start.toISOString(), name: f.name.value, email: f.email.value, agency: f.agency.value, website: f.website.value, agencyType: f.agencyType.value,
        teamSize: f.teamSize.value, problem: f.problem.value, urgency: f.urgency.value, heardFrom: f.heardFrom.value,
        honeypot: f.company_website.value, lang: lang, tz: tz, source: location.pathname,
      }).then(function (res) {
        if (!res.ok) {
          msg.setAttribute('data-state', 'error'); msg.textContent = res.data.error || t.network; btn.disabled = false;
          if (res.status === 409 || /taken|marcada/.test(res.data.error || '')) setTimeout(function () { bookFlow(root, t, lang); }, 2500);
          return;
        }
        window.location.href = t.booked;
      }).catch(function () { msg.setAttribute('data-state', 'error'); msg.textContent = t.network; btn.disabled = false; });
    });
  }

  function manageFlow(root, t) {
    var params = new URLSearchParams(location.search);
    var id = params.get('id'), token = params.get('t');
    root.innerHTML = '';
    root.appendChild(el('h3', {}, esc(t.manageTitle)));
    var msg = el('p', { class: 'bk-msg', role: 'status' }, esc(t.loading));
    root.appendChild(msg);
    api('GET', '/api/booking/manage?id=' + encodeURIComponent(id || '') + '&t=' + encodeURIComponent(token || '')).then(function (res) {
      if (!res.ok) { msg.setAttribute('data-state', 'error'); msg.textContent = t.invalid; return; }
      var b = res.data;
      msg.textContent = '';
      if (b.status !== 'confirmed') { msg.textContent = t.wasCancelled; root.appendChild(el('p', {}, '<a class="btn btn-primary" href="' + t.book + '">' + esc(t.rebook) + '</a>')); return; }
      if (b.past) { msg.textContent = t.past; return; }
      var current = new Date(b.start);
      root.appendChild(el('div', { class: 'bk-chosen' }, '<span>' + esc(t.current) + '</span><strong>' + esc(fmtFull(current, t)) + '</strong><span>' + esc(tz.replace(/_/g, ' ')) + '</span>'));
      var cancel = el('button', { type: 'button', class: 'btn btn-secondary' }, esc(t.cancel));
      var actions = el('div', { class: 'bk-actions' });
      actions.appendChild(cancel);
      root.appendChild(actions);
      var status = el('p', { class: 'bk-msg', role: 'status', 'aria-live': 'polite' });
      root.appendChild(status);
      cancel.addEventListener('click', function () {
        if (!window.confirm(t.cancelConfirm)) return;
        cancel.disabled = true;
        api('POST', '/api/booking/manage', { id: id, t: token, action: 'cancel' }).then(function (r) {
          if (!r.ok) { status.setAttribute('data-state', 'error'); status.textContent = r.data.error || t.network; cancel.disabled = false; return; }
          root.innerHTML = '';
          root.appendChild(el('h3', {}, esc(t.manageTitle)));
          root.appendChild(el('p', {}, esc(t.cancelled)));
          root.appendChild(el('p', {}, '<a class="btn btn-primary" href="' + t.book + '">' + esc(t.rebook) + '</a>'));
        });
      });
      root.appendChild(el('h3', { style: 'margin-top:24px' }, esc(t.reschedule)));
      root.appendChild(el('p', { class: 'bk-sub' }, esc(t.sub) + '<strong>' + esc(tz.replace(/_/g, ' ')) + '</strong>'));
      var pickArea = el('div');
      root.appendChild(pickArea);
      picker(pickArea, t, '?id=' + encodeURIComponent(id) + '&t=' + encodeURIComponent(token), function (start) {
        pickArea.innerHTML = '';
        pickArea.appendChild(el('div', { class: 'bk-chosen' }, '<strong>' + esc(fmtFull(start, t)) + '</strong>'));
        var go = el('button', { type: 'button', class: 'btn btn-primary' }, esc(t.moveTo));
        var row = el('div', { class: 'bk-actions' }); row.appendChild(go); pickArea.appendChild(row);
        go.addEventListener('click', function () {
          go.disabled = true;
          api('POST', '/api/booking/manage', { id: id, t: token, action: 'reschedule', start: start.toISOString() }).then(function (r) {
            if (!r.ok) { status.setAttribute('data-state', 'error'); status.textContent = r.data.error || t.network; go.disabled = false; return; }
            root.innerHTML = '';
            root.appendChild(el('h3', {}, esc(t.manageTitle)));
            root.appendChild(el('div', { class: 'bk-chosen' }, '<strong>' + esc(fmtFull(new Date(r.data.start), t)) + '</strong><span>' + esc(tz.replace(/_/g, ' ')) + '</span>'));
            root.appendChild(el('p', {}, esc(t.moved)));
          });
        });
      });
    });
  }

  function init() {
    [].forEach.call(document.querySelectorAll('[data-booking]'), function (root) {
      if (root.getAttribute('data-ready')) return;
      root.setAttribute('data-ready', '1');
      var lang = root.getAttribute('data-lang') === 'pt' ? 'pt' : 'en';
      var t = S[lang];
      if (root.getAttribute('data-mode') === 'manage') manageFlow(root, t);
      else if (root.getAttribute('data-mode') === 'approve') approveFlow(root);
      else bookFlow(root, t, lang);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
