#!/usr/bin/env python3
"""Apply the premium site chrome (nav, mobile menu, footer, head assets) to every page in publish/.

Re-runnable: it replaces everything between <body> and <main>, the <footer>, and the menu script.
Page content inside <main> is left alone; publish/premium.css restyles it.
"""
import os, re, sys

ROOT = os.path.join(os.path.dirname(__file__), '..', 'publish')

NAV = {
 'en': dict(home='/', skip='Skip to content', open='Open menu', close='Close menu', lang_label='Language: English', book='Book a call', book_href='/book/',
            links=[('About', '/about/'), ('Business Advisory', '/business-advisory/'), ('Free Resources', '/free-resources/'), ('Free VOS assessment', 'https://vos.nabiaedge.com/trial')],
            mobile_home='Home'),
 'pt': dict(home='/pt/', skip='Saltar para o conte&uacute;do', open='Abrir menu', close='Fechar menu', lang_label='Idioma: Portugu&ecirc;s', book='Marcar chamada', book_href='/pt/book/',
            links=[('Assessoria de Neg&oacute;cio', '/pt/business-advisory/'), ('Avalia&ccedil;&atilde;o VOS gratuita', 'https://vos.nabiaedge.com/trial')],
            mobile_home='In&iacute;cio'),
}
FOOT = {
 'en': dict(contact='Contact', support='Support', follow='Follow', pages='Pages', privacy=('Privacy', '/privacy/'), other='Portugu&ecirc;s',
            links=[('Business Advisory', '/business-advisory/'), ('About', '/about/'), ('Vessel Operating System', '/vessel-operating-system/'), ('Case studies', '/case-studies/'), ('Free Resources', '/free-resources/'), ('Newsletter', '/subscribe/'), ('Book a call', '/book/')]),
 'pt': dict(contact='Contacto', support='Suporte', follow='Redes', pages='P&aacute;ginas', privacy=('Privacidade', '/pt/privacy/'), other='English',
            links=[('In&iacute;cio', '/pt/'), ('Assessoria de Neg&oacute;cio', '/pt/business-advisory/'), ('Newsletter', '/pt/subscribe/'), ('Marcar chamada', '/pt/book/')]),
}
FLAG = {'en': '/assets/flags/gb.svg', 'pt': '/assets/flags/pt.svg'}
NAME = {'en': 'English', 'pt': 'Portugu&ecirc;s'}

MENU_JS = '''<script>
(function () {
  var menu = document.querySelector('[data-mobile-menu]');
  if (menu) {
    var toggles = document.querySelectorAll('[data-menu-toggle]');
    var set = function (open) {
      menu.hidden = !open;
      toggles.forEach(function (t) { t.setAttribute('aria-expanded', String(open)); });
      document.documentElement.style.overflow = open ? 'hidden' : '';
    };
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-menu-toggle]')) set(menu.hidden);
      else if (e.target.closest('[data-menu-close]')) set(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) set(false); });
  }
  var lang = document.querySelector('.pm-lang');
  if (lang) document.addEventListener('click', function (e) { if (lang.open && !lang.contains(e.target)) lang.open = false; });
})();
</script>
'''

def ext(href):
    return ' target="_blank" rel="noopener"' if href.startswith('http') else ''

def page_path(rel):
    p = '/' + rel.replace(os.sep, '/')
    if p.endswith('index.html'): p = p[:-len('index.html')]
    return p

def exists(path):
    if path == '/404.html': return True
    return os.path.exists(os.path.join(ROOT, path.lstrip('/'), 'index.html'))

def alternates(lang, path, src):
    alt = {}
    for l, href in re.findall(r'hreflang="(en|pt)" href="https://www\.nunofontoura\.com([^"]*)"', src):
        alt[l] = href
    alt.setdefault(lang, path)
    if 'en' not in alt:
        guess = path[3:] if path.startswith('/pt/') else '/'
        alt['en'] = guess if exists(guess) else '/'
    if 'pt' not in alt:
        guess = '/pt' + path
        alt['pt'] = guess if exists(guess) else '/pt/'
    return alt

def lang_links(lang, alt, cls_current, mobile=False):
    out = []
    for l in ('en', 'pt'):
        cur = l == lang
        attrs = ' aria-current="true"' if cur else f' lang="{l}" hreflang="{l}"'
        if mobile and cur: attrs += ' data-menu-close'
        out.append(f'<a href="{alt[l]}"{attrs}><img class="pm-flag" src="{FLAG[l]}" alt="" width="24" height="16">{NAME[l]}</a>')
    return out

def chrome(lang, path, alt):
    n = NAV[lang]
    cur = lambda href: ' aria-current="page"' if href == path else ''
    links = '\n'.join(f'      <a href="{h}"{ext(h)}{cur(h)}>{t}</a>' for t, h in n['links'])
    ll = '\n'.join('          ' + a for a in lang_links(lang, alt, True))
    ml = '\n'.join('      ' + a for a in lang_links(lang, alt, True, mobile=True))
    mlinks = '\n'.join(f'    <a class="pm-mlink" href="{h}"{ext(h)} data-menu-close>{t}</a>' for t, h in [(n['mobile_home'], n['home'])] + n['links'])
    return f'''<a class="pm-skip" href="#main-content">{n['skip']}</a>

<nav class="pm-nav" aria-label="Main">
  <div class="pm-wrap">
    <a href="{n['home']}" class="pm-brand"><img src="/assets/images/logo.png" alt="" width="26" height="26">Nuno Fontoura</a>
    <div class="pm-links">
{links}
      <details class="pm-lang">
        <summary aria-label="{n['lang_label']}"><img class="pm-flag" src="{FLAG[lang]}" alt="" width="24" height="16"></summary>
        <div class="pm-lang-menu">
{ll}
        </div>
      </details>
      <a href="{n['book_href']}" class="btn btn-primary">{n['book']}</a>
    </div>
    <button type="button" class="pm-menu-btn" data-menu-toggle aria-expanded="false" aria-label="{n['open']}">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>
  </div>
</nav>

<div data-mobile-menu hidden>
  <div class="pm-mobile">
    <div class="pm-mobile-top">
      <a href="{n['home']}" class="pm-brand"><img src="/assets/images/logo.png" alt="" width="26" height="26">Nuno Fontoura</a>
      <button type="button" data-menu-close aria-label="{n['close']}"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
    </div>
{mlinks}
    <div class="pm-lang-mobile">
{ml}
    </div>
    <a href="{n['book_href']}" class="btn btn-primary" data-menu-close>{n['book']}</a>
  </div>
</div>

'''

def footer(lang, alt):
    f = FOOT[lang]
    other = 'pt' if lang == 'en' else 'en'
    links = '\n'.join(f'      <a href="{h}">{t}</a>' for t, h in f['links'])
    return f'''<footer class="pm-footer">
  <div class="pm-wrap pm-grid">
    <div>
      <h2>{f['contact']}</h2>
      <a href="mailto:info@nabiaedge.com">info@nabiaedge.com</a>
      <a href="mailto:support@nabiaedge.com">{f['support']}: support@nabiaedge.com</a>
    </div>
    <div>
      <h2>{f['follow']}</h2>
      <a href="https://www.linkedin.com/in/nfontoura" target="_blank" rel="noopener">LinkedIn</a>
      <a href="https://www.instagram.com/nuno.fontoura/" target="_blank" rel="noopener">Instagram</a>
    </div>
    <div>
      <h2>{f['pages']}</h2>
{links}
    </div>
  </div>
  <div class="pm-wrap">
    <div class="pm-legal">
      <span>&copy; 2026 Nuno Fontoura &middot; NabiaEdge &middot; <a href="{f['privacy'][1]}">{f['privacy'][0]}</a></span>
      <a href="{alt[other]}" lang="{other}" hreflang="{other}">{f['other']}</a>
    </div>
  </div>
</footer>'''

def process(fp):
    rel = os.path.relpath(fp, ROOT)
    src = open(fp, encoding='utf-8').read()
    lang = re.search(r'<html lang="(\w+)', src).group(1)[:2]
    path = page_path(rel)
    alt = alternates(lang, path, src)
    s = src
    # head
    s = re.sub(r'<meta name="theme-color" content="[^"]*">', '<meta name="theme-color" content="#0F1D3D">', s)
    s = re.sub(r'family=Archivo:wght@[0-9;]+', 'family=Archivo:wght@300;400;500;600;800', s)
    if '/premium.css' not in s:
        s = s.replace('</head>', '<link rel="stylesheet" href="/premium.css">\n</head>', 1)
    else:  # keep premium.css last so it wins over page styles
        s = s.replace('<link rel="stylesheet" href="/premium.css">\n', '', 1).replace('</head>', '<link rel="stylesheet" href="/premium.css">\n</head>', 1)
    # body + chrome
    s = re.sub(r'<body[^>]*>', '<body class="pm">', s, count=1)
    b = s.index('<body class="pm">') + len('<body class="pm">')
    m = s.index('<main')
    s = s[:b] + '\n' + chrome(lang, path, alt) + s[m:]
    s = re.sub(r'<main id="main-content"([^>]*)>', lambda mo: '<main id="main-content"' + (mo.group(1) if 'pm-main' in mo.group(1) else re.sub(r'class="', 'class="pm-main ', mo.group(1)) if 'class="' in mo.group(1) else mo.group(1) + ' class="pm-main"') + '>', s, count=1)
    # footer
    s = re.sub(r'<footer.*?</footer>', lambda _: footer(lang, alt), s, count=1, flags=re.S)
    # menu script
    s = re.sub(r'<script>\s*\(function \(\) \{\s*var menu = document.*?\}\)\(\);\s*</script>\n?', '', s, flags=re.S)
    s = s.replace('</body>', MENU_JS + '</body>', 1)
    if s != src:
        open(fp, 'w', encoding='utf-8').write(s)
    return rel, lang, alt

if __name__ == '__main__':
    for dp, dn, fn in os.walk(ROOT):
        if os.path.relpath(dp, ROOT).startswith(('ds', 'assets')): continue
        for f in fn:
            if f.endswith('.html'):
                print(*process(os.path.join(dp, f)))
