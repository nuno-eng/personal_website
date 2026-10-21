# Site videos

Videos are too big for Cloudflare Pages (25 MB per file), so the MP4s live in the R2 bucket
**`nunofontoura-media`**, served from **https://media.nunofontoura.com/video/v1/**. Posters stay in
`publish/assets/video/`. The player is `publish/video.js` + the `.pm-video` styles in `publish/premium.css`.

| Video | Where it appears | Files |
|---|---|---|
| FAQ | Biz Ops Advisory (EN + PT, `#faq-video`); linked from /book/ and /pt/book/ | `faq-1080.mp4`, `faq-720.mp4`, `faq-poster.jpg` |
| VSL ("overview") | `/overview/` only: not in menus, sitemap or search (`noindex`); linked from the booking confirmation email | `overview-1080.mp4`, `overview-720.mp4`, `overview-poster.jpg` |

Desktops get the 1080p file (about 4.5 Mbps), screens up to 900px wide get 720p (about 2 Mbps).

## Replacing or adding a video
```
cd tools/video
swiftc -O transcode.swift -o /tmp/transcode && swiftc -O frame.swift -o /tmp/frame
/tmp/transcode "<original>.mp4" /tmp/faq-1080.mp4 1080 4500000
/tmp/transcode "<original>.mp4" /tmp/faq-720.mp4 720 2000000
/tmp/frame "<original>.mp4" <seconds> ../../publish/assets/video/faq-poster.jpg 1600
for f in faq-1080 faq-720; do
  npx wrangler@latest r2 object put nunofontoura-media/video/v1/$f.mp4 --file /tmp/$f.mp4 \
    --content-type video/mp4 --cache-control "public, max-age=31536000, immutable" --remote
done
```
Files are cached for a year, so a **changed** video needs a new folder (`video/v2/…`) and the page
links updated; a new video can use the current folder.
