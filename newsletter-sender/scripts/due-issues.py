# Prints "<file> <send_date>" for each issue in issues/schedule.json whose
# booking window is open today (UTC): from book_from for 4 days, so a missed
# or failed run is retried. Resend only accepts send dates within 30 days.
import datetime as dt, json, sys

today = dt.date.fromisoformat(sys.argv[1]) if len(sys.argv) > 1 else dt.datetime.now(dt.timezone.utc).date()
for item in json.load(open("issues/schedule.json")):
    start = dt.date.fromisoformat(item["book_from"])
    if start <= today <= start + dt.timedelta(days=3):
        print(item["file"], item["send_date"])
