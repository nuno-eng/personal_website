# Bookings: discovery calls (/book/) and 1:1 with Nuno (/meet/)

Replaces Calendly. Visitors book on `/book/` (EN) or `/pt/book/` (PT), and on the home, Biz Ops Advisory and Free Resources pages.

| Piece | Where |
|---|---|
| Rules: hours, buffer, notice, daily limit, days ahead | `functions/_lib/booking-config.js` |
| Availability (Google free/busy + existing bookings) | `functions/_lib/availability.js` |
| Google Calendar API | `functions/_lib/google-calendar.js` |
| API | `functions/api/booking/` (`slots`, `index` = create, `manage` = reschedule/cancel) |
| Emails (confirmation, reminders, follow-up, reschedule, cancel, owner alert) | `functions/_lib/booking-emails.js` |
| Widget | `publish/booking.js`, `publish/booking.css` |
| Suggested times | `functions/api/booking/request.js`, approve page `/book/approve/` |
| Pages | `/book/`, `/pt/book/`, `/book/manage/`, `/pt/book/manage/`, `/book/approve/`, `/call-booked/`, `/pt/call-booked/` |

## Meeting types
Both types are 30 minutes and share one calendar, the same hours, buffers and the 3-a-day limit. They're set in `KINDS` in `functions/_lib/booking-config.js`.

| | Discovery call | 1:1 with Nuno (internal type `networking`) |
|---|---|---|
| Page | `/book/`, `/pt/book/` (public, in the menu and on pages) | `/meet/`, `/pt/meet/` (private link: not in menus, search engines or the sitemap) |
| Form | Agency questions (type, team size, problem, urgency) | Name, email, company, website/LinkedIn, topic |
| Emails | Confirmation, reminders, follow-up with the VOS assessment | Confirmation and reminders only |
| Calendar title | `Discovery call: Name (Agency)` | `1:1 with Nuno: Name (Company)` |

Reschedule/cancel links and "Suggest a time" work for both. The widget picks the type from `data-kind="networking"` on the page.

## Current rules
- **Hours:** Monday to Friday, 09:00–18:30, UK time (London). Visitors see times in their own time zone.
- **Lunch:** a free hour always stays open somewhere between 12:30 and 14:00. A 12:30 call moves lunch to 13:00–14:00; a 13:30 call moves it to 12:30–13:30.
- **Length:** 30-minute calls starting on the hour or half hour.
- **Spacing:** 10 minutes free before each call and 15 minutes free after it, since calls tend to run over. The same gaps apply around your other calendar events.
- **Booking window:** at least 16 hours' notice, up to 28 days ahead, at most 3 calls a day.

## How visitors see times
- **Week view:** one week at a time, with arrows to move between weeks.
- **Free days:** if a day has more than 8 open times, only the on-the-hour times show at first. **Show all times** reveals the rest.
- **Suggest a time:** below the times, **None of these work? Suggest a time** opens a form. The visitor answers the same questions and proposes up to three times (up to 90 days ahead). They get an acknowledgement email. You get an alert with a **Book this time** button per suggestion, which opens `/book/approve/` and shows whether each time clashes with your calendar. Booking from there works like a normal booking (event, Meet link, confirmation, reminders) and ignores the usual hours, so you can accept an evening call. Replying to the alert emails the visitor.

## What happens on a booking
1. **Slot check:** the slot is checked again against your Google Calendar and existing bookings, then saved in D1.
2. **Calendar event:** an event is created in nuno@nabiaedge.com's calendar with a Google Meet link. Google sends the invite to the visitor.
3. **Emails to the visitor:** a confirmation now, reminders 24 hours and 1 hour before, and a follow-up the day after with the VOS assessment link. Each email has a reschedule/cancel link.
4. **Alert to you:** info@nabiaedge.com gets their answers.

**Reschedule or cancel** through the link in the emails or in your alert. **Don't** move or delete the event in Google Calendar directly: the reminders wouldn't know about it.

## One-time setup (Google Calendar)
1. Go to https://console.cloud.google.com signed in as **nuno@nabiaedge.com**. Create a project called `nunofontoura-website`.
2. **APIs & Services → Library**: search **Google Calendar API** and click **Enable**.
3. **Google Auth Platform → Branding** (the "OAuth consent screen"): app name `nunofontoura.com booking`, and your email as the support email.
4. **Audience**: choose **Internal** if it's offered, which it is when nabiaedge.com is on Google Workspace. If only External is available, choose External and click **Publish app**. In "Testing" mode Google expires the connection every 7 days.
5. **Clients → Create client**: type **Desktop app**, name `booking`. Keep the Client ID and Client secret for the next step, and don't paste them anywhere else.
6. In the repo, run `node tools/google-calendar-setup.mjs`. Paste the ID and secret, then sign in and click **Allow** in the browser. The script checks the calendar connection and saves the three secrets to Cloudflare, for both production and preview.

## Seeing bookings
```bash
npx wrangler d1 execute newsletter-db --remote --command \
  "SELECT start_utc, status, name, email, agency, team_size, urgency FROM bookings ORDER BY start_utc DESC LIMIT 20"
```
