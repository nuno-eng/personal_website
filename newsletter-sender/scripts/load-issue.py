# Loads an issue file (issues/week-NN.txt) into emails/newsletter.tsx.
# usage: python3 scripts/load-issue.py emails/newsletter.tsx issues/week-51.txt
# An issue file is the constants block, a line "=====", then the ISSUE object body.
import sys
tpl, src = sys.argv[1], open(sys.argv[2]).read()
consts, body = src.split("\n=====\n")
t = open(tpl).read()
a = t.index("export const READY")
b = t.index("// Paragraphs can hold")
t = t[:a] + consts.strip() + "\n\n" + t[b:]
c = t.index("} = {", t.index("const ISSUE")) + len("} = {")
d = t.index("};\n// ───", c)
t = t[:c] + "\n" + body.strip("\n") + "\n" + t[d:]
open(tpl, "w").write(t)
