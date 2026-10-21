"""Turn a whisper.cpp full JSON transcript (-ojf) into readable WebVTT captions.

    python3 tools/video/captions.py <whisper.json> <out.vtt> [corrections.json] [layout.txt] [side ranges]

- Every cue starts at the same height (line:83%), so one- and two-line captions don't jump around.
- corrections.json: [heard, said] phrase pairs for words Whisper got wrong (whole words, any case).
- layout.txt: "seconds leftBrightness rightBrightness" rows from tools/video/layout.swift. While the
  left half is a bright slide, captions move to the right half (over Nuno) with shorter lines.
- side ranges: extra "from-to" second ranges that also need the right half, e.g. "4.3-10.5" for the
  name label in the bottom-left corner.

The .vtt is plain text: each cue is a time range, its placement settings, and one or two lines of
text. Edit the text freely; keep the timing line as it is.
"""
import bisect, json, re, sys

FACE = {'chars': 42, 'settings': 'line:83% position:50% size:86% align:center'}
SIDE = {'chars': 26, 'settings': 'line:83% position:75% size:46% align:center'}
MAX_SECONDS = 7.0


def words_from(transcript):
    words = []
    for seg in transcript['transcription']:
        seg_words = []
        for tok in seg['tokens']:
            text = tok['text']
            if text.startswith('[_') or not text.strip():
                continue
            t0, t1 = tok['offsets']['from'] / 1000, tok['offsets']['to'] / 1000
            if text.startswith(' ') or not seg_words:
                seg_words.append([text.strip(), t0, t1])
            else:  # sub-word piece or punctuation: glue onto the previous word
                seg_words[-1][0] += text
                seg_words[-1][2] = t1
        seg_words = [w for w in seg_words if w[0]]
        if not seg_words:
            continue
        s0, s1 = seg['offsets']['from'] / 1000, seg['offsets']['to'] / 1000
        spread = seg_words[-1][2] - seg_words[0][1]
        collapsed = sum(1 for w in seg_words if w[2] - w[1] < 0.02)
        if s1 - s0 > 1 and (spread < 0.4 * (s1 - s0) or collapsed > len(seg_words) / 2):
            # Whisper sometimes returns collapsed word times; spread the words over the segment by length.
            total = sum(len(w[0]) + 1 for w in seg_words)
            t = s0
            for w in seg_words:
                d = (s1 - s0) * (len(w[0]) + 1) / total
                w[1], w[2] = t, t + d
                t += d
        words += seg_words
    return words


def norm(w):
    return re.sub(r'[^\w%£\'-]', '', w.lower())


def correct(words, pairs):
    for heard, said in pairs:
        old, new = heard.split(), said.split()
        i = 0
        while i <= len(words) - len(old):
            if [norm(w[0]) for w in words[i:i + len(old)]] == [norm(o) for o in old]:
                t0, t1 = words[i][1], words[i + len(old) - 1][2]
                tail = re.sub(r'^.*?([.,!?;:]*)$', r'\1', words[i + len(old) - 1][0])
                step = (t1 - t0) / len(new)
                repl = [[n, t0 + k * step, t0 + (k + 1) * step] for k, n in enumerate(new)]
                if tail and not re.search(r'[.,!?;:]$', repl[-1][0]):
                    repl[-1][0] += tail
                words[i:i + len(old)] = repl
                i += len(new)
            else:
                i += 1
    return words


def side_lookup(layout_path, ranges):
    """Returns side(t) -> True when captions should sit on the right half at time t."""
    times, flags = [], []
    if layout_path:
        for line in open(layout_path):
            t, left, right = map(float, line.split())
            times.append(t)
            flags.append(left > 220 and right <= 220)  # bright slide on the left, Nuno on the right
    extra = [tuple(map(float, r.split('-'))) for r in ranges]

    def side(t):
        if any(a <= t < b for a, b in extra):
            return True
        if not times:
            return False
        i = bisect.bisect_right(times, t) - 1
        return flags[max(i, 0)]
    return side


def wrap(text, width):
    if len(text) <= width:
        return text
    best = None
    for m in re.finditer(' ', text):  # most even split that keeps both lines short
        a, b = text[:m.start()], text[m.end():]
        if len(a) <= width and len(b) <= width:
            score = abs(len(a) - len(b))
            if best is None or score < best[0]:
                best = (score, a, b)
    return f'{best[1]}\n{best[2]}' if best else None


def smooth(words, side, min_run=1.5):
    """Side for each word, with short runs (a word or two either side of a slide change) folded into their neighbours."""
    flags = [side((w[1] + w[2]) / 2) for w in words]
    runs, i = [], 0
    while i < len(flags):
        j = i
        while j + 1 < len(flags) and flags[j + 1] == flags[i]:
            j += 1
        runs.append([i, j])
        i = j + 1
    for k, (i, j) in enumerate(runs):
        if words[j][2] - words[i][1] < min_run and len(runs) > 1:
            # Join the caption the words belong to: the next one unless the fragment ends a sentence.
            ends = re.search(r'[.?!]$', words[j][0])
            other = runs[k + 1] if (k + 1 < len(runs) and not ends) or k == 0 else runs[k - 1]
            for n in range(i, j + 1):
                flags[n] = flags[other[0]]
    return flags


def cues(words, side):
    out, cur, cur_side = [], [], None
    flags = smooth(words, side)
    for w, w_side in zip(words, flags):
        style = SIDE if w_side else FACE
        text = ' '.join(x[0] for x in cur + [w])
        if cur and (w_side != cur_side or wrap(text, style['chars']) is None or w[2] - cur[0][1] > MAX_SECONDS):
            carry = []
            if w_side != cur_side:
                # A slide change one or two words into a sentence: start the new caption at the sentence.
                for k in range(len(cur) - 1, max(len(cur) - 4, -1), -1):
                    before = cur[k - 1] if k else (out[-1][0][-1] if out else None)
                    if before and re.search(r'[.?!]$', before[0]):
                        carry = cur[k:]; cur = cur[:k]
                        break
            if cur:
                out.append((cur, cur_side))
            cur = carry
        if not cur or cur_side != w_side:
            cur_side = w_side
        cur.append(w)
        joined = ' '.join(x[0] for x in cur)
        if re.search(r'[.?!]$', w[0]) and len(joined) > 30:
            out.append((cur, cur_side)); cur = []
    if cur:
        out.append((cur, cur_side))
    return out


def merge_short(groups, min_seconds=1.0):
    """Fold a caption shorter than a second into the one it belongs to, if the result still fits."""
    out = [list(g) for g in groups]
    i = 0
    while i < len(out):
        g, on_side = out[i]
        if g[-1][2] - g[0][1] < min_seconds and len(out) > 1:
            ends = re.search(r'[.?!]$', g[-1][0])
            for k in ([i + 1, i - 1] if not ends else [i - 1, i + 1]):
                if 0 <= k < len(out):
                    other, other_side = out[k]
                    merged = g + other if k > i else other + g
                    if wrap(' '.join(x[0] for x in merged), (SIDE if other_side else FACE)['chars']):
                        out[k] = [merged, other_side]
                        del out[i]
                        i = max(i - 1, 0)
                        break
            else:
                i += 1
            continue
        i += 1
    return [tuple(g) for g in out]


def ts(t):
    h, rem = divmod(t, 3600); m, s = divmod(rem, 60)
    return f'{int(h):02}:{int(m):02}:{s:06.3f}'


def main(src, dst, corrections=None, layout=None, *ranges):
    words = words_from(json.load(open(src)))
    if corrections:
        words = correct(words, json.load(open(corrections)))
    groups = merge_short(cues(words, side_lookup(layout, ranges)))
    lines = ['WEBVTT', '']
    for i, (g, on_side) in enumerate(groups):
        style = SIDE if on_side else FACE
        start = g[0][1]
        end = max(g[-1][2] + 0.25, start + 1.0)
        if i + 1 < len(groups):
            end = min(end, groups[i + 1][0][0][1])
        text = ' '.join(x[0] for x in g)
        lines += [f'{ts(start)} --> {ts(end)} {style["settings"]}', wrap(text, style['chars']) or text, '']
    open(dst, 'w').write('\n'.join(lines))
    print(f'{dst}: {len(groups)} cues, {sum(1 for _, s in groups if s)} on the right half')


if __name__ == '__main__':
    main(*sys.argv[1:])
