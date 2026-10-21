"""Turn a whisper.cpp full JSON transcript (-ojf) into readable WebVTT captions.

    python3 tools/video/captions.py <whisper.json> <out.vtt> [corrections.json]

Cues are at most two lines of 42 characters, break at sentence ends where possible, and run
for 1-7 seconds. corrections.json is a list of [heard, said] phrase pairs (whole words,
case-insensitive) for words Whisper got wrong; the replacement keeps the timing of the span.
"""
import json, re, sys

MAX_LINE, MAX_CUE, MAX_SECONDS = 42, 84, 7.0


def words_from(transcript):
    words = []
    for seg in transcript['transcription']:
        for tok in seg['tokens']:
            text = tok['text']
            if text.startswith('[_') or not text.strip():
                continue
            t0, t1 = tok['offsets']['from'] / 1000, tok['offsets']['to'] / 1000
            if text.startswith(' ') or not words:
                words.append([text.strip(), t0, t1])
            else:  # sub-word piece or punctuation: glue onto the previous word
                words[-1][0] += text
                words[-1][2] = t1
    return [w for w in words if w[0]]


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


def cues(words):
    out, cur = [], []
    for w in words:
        text = ' '.join(x[0] for x in cur + [w])
        if cur and (len(text) > MAX_CUE or '\n' not in wrap(text) and len(text) > MAX_LINE or w[2] - cur[0][1] > MAX_SECONDS):
            out.append(cur); cur = []
        cur.append(w)
        joined = ' '.join(x[0] for x in cur)
        if re.search(r'[.?!]$', w[0]) and len(joined) > 30:
            out.append(cur); cur = []
    if cur:
        out.append(cur)
    return out


def wrap(text):
    if len(text) <= MAX_LINE:
        return text
    best = None
    for m in re.finditer(' ', text):  # most even split that keeps both lines short
        a, b = text[:m.start()], text[m.end():]
        if len(a) <= MAX_LINE and len(b) <= MAX_LINE:
            score = abs(len(a) - len(b))
            if best is None or score < best[0]:
                best = (score, a, b)
    return f'{best[1]}\n{best[2]}' if best else text


def ts(t):
    h, rem = divmod(t, 3600); m, s = divmod(rem, 60)
    return f'{int(h):02}:{int(m):02}:{s:06.3f}'


def main(src, dst, corrections=None):
    words = words_from(json.load(open(src)))
    if corrections:
        words = correct(words, json.load(open(corrections)))
    lines = ['WEBVTT', '']
    groups = cues(words)
    for i, g in enumerate(groups):
        start = g[0][1]
        end = max(g[-1][2] + 0.25, start + 1.0)
        if i + 1 < len(groups):
            end = min(end, groups[i + 1][0][1])
        lines += [f'{ts(start)} --> {ts(end)}', wrap(' '.join(x[0] for x in g)), '']
    open(dst, 'w').write('\n'.join(lines))
    print(f'{dst}: {len(groups)} cues')


if __name__ == '__main__':
    main(*sys.argv[1:])
