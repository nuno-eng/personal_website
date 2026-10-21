# Site videos

Videos are too big for Cloudflare Pages (25 MB per file), so the MP4s live in the R2 bucket
**`nunofontoura-media`**, served from **https://media.nunofontoura.com/video/v2/**. Posters stay in
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

## Current versions (v2, 21 Oct 2026)
- **FAQ:** 8.5 s removed (3:12.1-3:20.6, the "around 60%" sentence; the correct figure is 30%) with
  `edit.swift cut`, at the slide change so the jump is hidden.
- **VSL:** "Psicodramatizar, run by my sister" burned into the clinic slide (2:56.8-3:05.1) with
  `edit.swift text`. Wherever the clinic appears, the family relationship must be disclosed.
- `v1/` in the bucket holds the unedited first upload; nothing links to it.

## Captions
```
afconvert -f WAVE -d LEI16@16000 -c 1 <video> /tmp/a.wav
whisper-cli -m ~/Library/Caches/whisper-models/ggml-small.en.bin -f /tmp/a.wav -l en -ojf -of /tmp/a
python3 tools/video/captions.py /tmp/a.json publish/assets/video/<name>.vtt tools/video/<name>-corrections.json
```
`brew install whisper-cpp`; the model is `ggml-small.en.bin` from huggingface.co/ggerganov/whisper.cpp.
The corrections files fix words Whisper mishears; check new captions against the script.

## Editing captions by hand
`publish/assets/video/faq.vtt` and `overview.vtt` are plain text. Each caption looks like:
```
00:02:38.140 --> 00:02:41.949 line:78% position:50% size:86% align:center
Depending on where you are at, I might
spend time on site early on, and I stay
```
- **Text:** change it freely. Keep it to one or two lines.
- **Timing:** the start `-->` end on the first line.
- **Placement:** `position:50% size:86%` means centred (just Nuno on screen). `position:75% size:46%`
  means the right half, used while a slide or the name label fills the left; keep those lines to about
  26 characters. `line:78%` keeps every caption at the same height.
- Regenerating with `captions.py` overwrites hand edits, so put recurring fixes in the corrections file.
