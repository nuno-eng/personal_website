# Newsletter: Operating Notes / Notas Operacionais

## What's in the repo

| Piece | Where |
|---|---|
| Signup pages (EN/PT) | `publish/subscribe/`, `publish/pt/subscribe/` |
| Signup block on the home pages + "Newsletter" footer link on every page | `publish/index.html`, `publish/pt/index.html`, other pages' footers |
| Form behaviour and styles, shared by every page | `publish/newsletter.js`, `publish/newsletter.css` |
| Referral leaderboard (EN/PT) | `publish/leaderboard/`, `publish/pt/leaderboard/` |
| API (Cloudflare Pages Functions) | `functions/api/` (subscribe, unsubscribe, leaderboard, my-referrals) |
| Welcome sequence copy (welcome, day 3, day 7, EN + PT) | `functions/_lib/email-templates.js` |
| Newsletter issues (React Email) and the send script | `newsletter-sender/` |
| Database schema | `d1-schema.sql` |

The Pages project serves `publish/` and runs functions from the repo-root `functions/` folder (checked on a preview deploy).

What happens when someone subscribes:

1. They're added to your Resend segment. Anyone who had unsubscribed is re-subscribed.
2. They get a referral code. If they came in through someone's `?ref=` link on any page, that person gets the credit.
3. The welcome email goes out straight away. Day 3 and day 7 are scheduled in Resend, and unsubscribing cancels them.
4. D1 records their language and the page they signed up on (plus `utm_source`), so you can see which pages bring in leads.
5. If `NOTIFY_EMAIL` is set, you get an email about the new subscriber.

Protection: a hidden honeypot field, at most 5 new signups per IP per hour, signed unsubscribe links, and one-click unsubscribe headers (Gmail and Yahoo require these for bulk senders). Opening an unsubscribe link shows a confirm button, so mail scanners that open every link can't unsubscribe people by accident.

## 1. Resend

1. Create a Resend account and go to **Domains > Add domain**. Use a subdomain such as `news.nunofontoura.com`, so newsletter sending can't hurt the reputation of your main domain. Your DNS is on Cloudflare, so use Resend's **Auto configure** with Cloudflare, or copy the records it shows into Cloudflare DNS.
2. **API Keys**: create a key with *Full access*. Contacts and broadcasts need more than a sending-only key.
3. **Audience > Segments**: create a segment called `Newsletter` and copy its ID.

## 2. Cloudflare D1

```bash
npx wrangler login
npx wrangler d1 create newsletter-db
npx wrangler d1 execute newsletter-db --remote --file=d1-schema.sql
```

Then go to **Workers & Pages > personal-website > Settings > Bindings > Add > D1 database**, set the variable name to `DB` and pick `newsletter-db`. Do this for both Production and Preview.

## 3. Cloudflare environment variables

Go to **personal-website > Settings > Variables and Secrets**, and add these for Production (and Preview if you want to test there):

| Name | Value | Type |
|---|---|---|
| `RESEND_API_KEY` | your Resend key | Secret |
| `RESEND_SEGMENT_ID` | the segment ID from step 1 | Text |
| `RESEND_FROM` | `Nuno Fontoura <nuno@news.nunofontoura.com>` | Text |
| `RESEND_REPLY_TO` | `info@nabiaedge.com` (replies to the welcome emails go here) | Text |
| `SITE_URL` | `https://www.nunofontoura.com` | Text |
| `UNSUB_SECRET` | output of `openssl rand -hex 32`. Don't change it later, or old unsubscribe links stop working | Secret |
| `NOTIFY_EMAIL` | where new-subscriber alerts go (optional) | Text |

Redeploy after adding them: **Deployments > ... > Retry deployment**.

## 4. Test before going live

On the PR's preview URL (Cloudflare posts it on the PR):

1. Subscribe on `/subscribe/` with your own email. You should see the referral link, get the welcome email, and see the contact in Resend. Check the email's **Unsubscribe** link as well.
2. In another browser, open your referral link and subscribe with a second address. `/leaderboard/` should show 1 referral.
3. Repeat on `/pt/subscribe/` to check the Portuguese emails.
4. Clean up test data: in Resend, delete the test contacts. In D1, run
   `npx wrangler d1 execute newsletter-db --remote --command "DELETE FROM subscribers WHERE email LIKE '%your-test-address%'"`.
   Cancel the test subscribers' scheduled day 3/day 7 emails from their pages under Emails in Resend.

## 5. Sending an issue

```bash
cd newsletter-sender
npm install
cp .env.example .env    # fill it in
npm run preview         # live preview at http://localhost:3001
```

For each issue:

1. Edit the block at the top of `emails/newsletter.tsx`: `ISSUE_NUMBER`, `SUBJECT`, `PREVIEW_TEXT` and the content. The file ships with an example issue.
2. Run `npm run send:test` to send it to `TEST_EMAIL` only, then read it on your phone.
3. Set `READY = true` and run `npm run send` to broadcast to every subscriber. The script refuses to broadcast while `READY` is false. Set it back to `false` when you start the next issue.

You can also send without a terminal: add `RESEND_API_KEY`, `RESEND_SEGMENT_ID`, `RESEND_FROM`, `RESEND_REPLY_TO` and `TEST_EMAIL` as repo secrets (**Settings > Secrets and variables > Actions**), push your edited issue, then go to **Actions > Send Newsletter > Run workflow** and pick `test` or `broadcast`.

Broadcasts use Resend's own unsubscribe link, and people who unsubscribe are skipped automatically.

## Seeing your leads

```bash
# newest subscribers, with language and the page they signed up on
npx wrangler d1 execute newsletter-db --remote --command \
  "SELECT created_at, email, display_name, lang, source FROM subscribers WHERE unsubscribed_at IS NULL ORDER BY created_at DESC LIMIT 50"

# which pages convert
npx wrangler d1 execute newsletter-db --remote --command \
  "SELECT source, COUNT(*) AS n FROM subscribers GROUP BY source ORDER BY n DESC"
```

## Editing copy

- **Welcome emails**: edit `COPY` in `functions/_lib/email-templates.js`. The newsletter name is in `NEWSLETTER_NAME` in the same file. If you rename it, also search the `publish/` pages and `functions/api/` for "Operating Notes" / "Notas Operacionais".
- **Signup pages**: edit the HTML directly.
- **Rewards**: the leaderboard only tracks referrals. Any reward (a shout-out, a call) you give out by hand.

## Known limits

- Newsletter issues are English only. The subscriber's language is stored in D1. To send Portuguese issues, create a second Resend segment and add PT subscribers to it.
- The rate limit is per IP. Many signups from one office network or event Wi-Fi in the same hour will hit it (5 per hour). Raise `MAX_NEW_PER_IP_PER_HOUR` in `functions/api/subscribe.js` if that becomes a problem.
