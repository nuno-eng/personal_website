#!/usr/bin/env python3
"""Convert design-tool exports (<x-dc> pages rendered by support.js + React)
into plain static HTML.

The exported pages build themselves in the browser: React is downloaded from
unpkg, then support.js turns the <x-dc> template into the page. On a phone
that meant ~9 s of blank screen. The pages only use a few runtime features,
which this script replaces with plain HTML/CSS and a few lines of JS:

  <helmet>...</helmet>             moved into <head>
  inline design-system CSS         replaced by <link href="/ds/styles.css">
  <sc-if value="{{ mobileOpen }}"> <div data-mobile-menu hidden>
  onClick="{{ toggleMenu }}"       data-menu-toggle
  onClick="{{ closeMenu }}"        data-menu-close
  style-hover / style-focus        generated :hover / :focus-visible classes
  single testimonial (home)        inlined from the component state

Usage:  python3 tools/dc-to-static.py publish/some-page/index.html [...]
It refuses to write a page that still contains runtime syntax ({{ }}, <sc-).
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DS_CSS = (ROOT / 'publish/ds/styles.css').read_text()

MENU_JS = """<script>
(function () {
  var menu = document.querySelector('[data-mobile-menu]');
  var toggles = document.querySelectorAll('[data-menu-toggle]');
  if (!menu) return;
  function set(open) {
    menu.hidden = !open;
    toggles.forEach(function (t) { t.setAttribute('aria-expanded', String(open)); });
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-menu-toggle]')) set(menu.hidden);
    else if (e.target.closest('[data-menu-close]')) set(false);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) set(false); });
})();
</script>"""


def norm(css):
    return re.sub(r'\s+', '', css)


def important(decls):
    parts = [d.strip() for d in decls.split(';') if d.strip()]
    return ';'.join(p if '!important' in p else p + ' !important' for p in parts)


def convert(path):
    src = path.read_text()
    if '<x-dc>' not in src:
        print(f'skip (already static): {path}')
        return

    head = src[src.index('<head>') + len('<head>'):src.index('</head>')]
    xdc = src[src.index('<x-dc>') + len('<x-dc>'):src.index('</x-dc>')]
    after = src[src.index('</x-dc>') + len('</x-dc>'):src.index('</body>')]
    html_tag = re.search(r'<html[^>]*>', src).group(0)

    logic = re.search(r'<script type="text/x-dc" data-dc-script>(.*?)</script>', after, re.S)
    logic = logic.group(1) if logic else ''
    after = re.sub(r'<script type="text/x-dc" data-dc-script>.*?</script>', '', after, flags=re.S)

    thumb = re.compile(r'<template id="__bundler_thumbnail".*?</template>\s*', re.S)
    head = thumb.sub('', head)
    xdc = thumb.sub('', xdc)

    helmet = ''
    m = re.search(r'<helmet>(.*?)</helmet>', xdc, re.S)
    if m:
        helmet = m.group(1)
        xdc = xdc[:m.start()] + xdc[m.end():]

    drop_script = re.compile(
        r'<script[^>]*src="[^"]*(unpkg\.com/react|support\.js|image-slot\.js|_ds_bundle\.js)[^"]*"[^>]*></script>\s*'
    )
    head = drop_script.sub('', head)
    helmet = drop_script.sub('', helmet)
    after = drop_script.sub('', after)

    def swap_ds(m):
        return '<link rel="stylesheet" href="/ds/styles.css">\n' if norm(m.group(1)) == norm(DS_CSS) else m.group(0)

    helmet = re.sub(r'<style>(.*?)</style>', swap_ds, helmet, flags=re.S)

    body = xdc

    # Home testimonial carousel with a single item: inline it.
    if '{{ isQuote }}' in body:
        items = re.findall(r"quote:\s*(\"(?:[^\"\\]|\\.)*\"),\s*name:\s*(\"(?:[^\"\\]|\\.)*\")", logic)
        if len(items) != 1:
            sys.exit(f'{path}: expected exactly one testimonial, found {len(items)}')
        quote, name = (json.loads(x) for x in items[0])
        body = re.sub(r'<sc-if value="\{\{ isQuote \}\}"[^>]*>(.*?)</sc-if>', lambda m: m.group(1), body, flags=re.S)
        body = body.replace('{{ quote }}', quote).replace('{{ name }}', name)
        body = re.sub(r'<div style="display:none">\s*<sc-for list="\{\{ dots \}\}".*?</sc-for>\s*</div>', '', body, flags=re.S)

    body = re.sub(
        r'<sc-if value="\{\{ mobileOpen \}\}"[^>]*>(.*?)</sc-if>',
        lambda m: f'<div data-mobile-menu hidden>{m.group(1)}</div>',
        body, flags=re.S,
    )
    body = body.replace('onClick="{{ toggleMenu }}"', 'data-menu-toggle aria-expanded="false"')
    body = body.replace('onClick="{{ closeMenu }}"', 'data-menu-close')

    rules = {}

    def pseudo_class(decls, pseudo):
        key = (pseudo, decls)
        if key not in rules:
            rules[key] = f"{'hv' if pseudo == 'hover' else 'fc'}{len(rules) + 1}"
        return rules[key]

    def rewrite_tag(m):
        tag = m.group(0)
        classes = []
        for attr, pseudo in (('style-hover', 'hover'), ('style-focus', 'focus-visible')):
            am = re.search(rf'\s{attr}="([^"]*)"', tag)
            if am:
                classes.append(pseudo_class(am.group(1), pseudo))
                tag = tag[:am.start()] + tag[am.end():]
        if not classes:
            return tag
        cm = re.search(r'\sclass="([^"]*)"', tag)
        if cm:
            return tag[:cm.start()] + f' class="{cm.group(1)} {" ".join(classes)}"' + tag[cm.end():]
        return re.sub(r'^<([a-zA-Z0-9-]+)', lambda t: f'<{t.group(1)} class="{" ".join(classes)}"', tag)

    body = re.sub(r'<[a-zA-Z][^>]*\sstyle-(?:hover|focus)="[^"]*"[^>]*>', rewrite_tag, body)
    body = re.sub(r'\shint-[a-z-]+="[^"]*"', '', body)

    pseudo_css = '\n'.join(
        f'.{cls}:{pseudo}{{{important(decls)}}}' for (pseudo, decls), cls in rules.items()
    )

    for leftover in ('{{', '<sc-', 'onClick=', 'style-hover', 'x-dc'):
        if leftover in body or leftover in after:
            sys.exit(f'{path}: unconverted runtime syntax "{leftover}" left, not writing')

    out = (
        '<!DOCTYPE html>\n'
        f'{html_tag}\n<head>\n{head.strip()}\n{helmet.strip()}\n'
        + (f'<style>\n{pseudo_css}\n</style>\n' if pseudo_css else '')
        + '</head>\n<body>\n'
        + body.strip() + '\n'
        + after.strip() + '\n'
        + MENU_JS + '\n</body>\n</html>\n'
    )
    path.write_text(out)
    support = path.parent / 'support.js'
    if support.exists():
        support.unlink()
    print(f'converted: {path}')


if __name__ == '__main__':
    for arg in sys.argv[1:]:
        convert(Path(arg))
