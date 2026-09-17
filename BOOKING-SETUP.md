# Discovery call booking (/book/)

Replaces Calendly. Visitors book on `/book/` (EN) or `/pt/book/` (PT), and on the home, Business Advisory, Micro Consulting and Free Resources pages.

| Piece | Where |
|---|---|
| Rules: hours, buffer, notice, daily limit, days ahead | `functions/_lib/booking-config.js` |
| Availability (Google free/busy + existing bookings) | `functions/_lib/availability.js` |
| Google Calendar API | `functions/_lib/google-calendar.js` |
| API | `functions/api/booking/` (`slots`, `index` = create, `manage` = reschedule/cancel) |
| Emails (confirmation, reminders, follow-up, reschedule, cancel, owner alert) | `functions/_lib/booking-emails.js` |
| Widget | `publish/booking.js`, `publish/booking.css` |
| Pages | `/book/`, `/pt/book/`, `/book/manage/`, `/pt/book/manage/`, `/call-booked/`, `/pt/call-booked/` |

## Current rules
- **Hours:** Monday to Friday, 09:00–13:00 and 13:30–18:30, Lisbon time. Visitors see times in their own time zone.
- **Length:** 30-minute calls starting on the hour or half hour.
- **Spacing:** 10 minutes free before each call and 15 minutes free after it, since calls tend to run over. The same gaps apply around your other calendar events.
- **Booking window:** at least 12 hours' notice, up to 28 days ahead, at most 3 calls a day.

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
