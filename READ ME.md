# nunofontoura.com

Personal website of Nuno Fontoura, Founder, NabiaEdge. It brings in leads from founders of creative and production agencies: discovery call bookings, newsletter signups and free resource downloads.

- **Hosting:** Cloudflare Pages serves `publish/` (static HTML/CSS/JS). Server code lives in `functions/` (Pages Functions) and data in the D1 database `newsletter-db`. Every push to `main` goes live; every other branch gets a preview link.
- **Newsletter and free resources:** see `NEWSLETTER-SETUP.md`.
- **Discovery call booking:** see `BOOKING-SETUP.md`.
- **Design:** `publish/premium.css`. Menu, language flags and footer on every page come from `python3 tools/premium-chrome.py`; run it after changing them or any CSS/JS file.
- **Automated emails:** React Email templates in `newsletter-sender/transactional/`, built with `npm run build:emails`.
- **Free resource PDFs:** `tools/pdf` (`npm run build`).
- **Photos and share images:** originals in `photos/` (not committed), built with `tools/media` (`npm run build`).
