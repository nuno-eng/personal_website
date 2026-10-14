// Content for the free-resource PDFs. Each page is an HTML string that must fit one
// A4 page (the build fails if a page overflows). Field names must be unique per document.

const VOS = 'https://vos.nabiaedge.com/trial';
const BOOK = 'https://www.nunofontoura.com/book/';

const field = (name, label, { size = '', hint = '', calc = '', expr = '' } = {}) =>
  `${label ? `<span class="label">${label}${hint ? ` <span class="hint">${hint}</span>` : ''}</span>` : ''}<div class="fld ${size}" data-field="${name}"${size ? ' data-ml' : ''}${calc ? ` data-calc="${calc}"` : ''}${expr ? ` data-calc-expr="${expr}"` : ''}></div>`;
const check = (name) => `<span class="chk" data-check="${name}"></span>`;

const cta = (lead, withVos = false) => `
<div class="cta">
  <h2>Want to install this properly?</h2>
  <p>${lead}</p>
  <div class="btns">${withVos ? `<a class="primary" href="${VOS}">Take the free VOS assessment</a><a class="secondary" href="${BOOK}">Book a discovery call</a>` : `<a class="primary" href="${BOOK}">Book a discovery call</a>`}</div>
</div>`;
const sig = `<div class="sig"><div><b>Nuno Fontoura</b>Founder, NabiaEdge</div><div class="muted">info@nabiaedge.com &middot; nunofontoura.com</div></div>`;

// ---------------------------------------------------------------- Founder Bottleneck Audit
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const trackerRows = days
  .flatMap((d, i) => [1, 2].map((n) => `
<tr class="${i % 2 ? 'shade' : ''}">
  <td style="width:11%;font-weight:800">${n === 1 ? d : ''}</td>
  <td style="width:38%">${`<div class="fld" data-field="track_${d.toLowerCase()}_${n}_what"></div>`}</td>
  <td style="width:22%"><div class="fld" data-field="track_${d.toLowerCase()}_${n}_wait"></div></td>
  <td class="c" style="width:29%"><span class="yn">${check(`track_${d.toLowerCase()}_${n}_yes`)} Yes</span><span class="yn">${check(`track_${d.toLowerCase()}_${n}_no`)} No</span></td>
</tr>`))
  .join('');

const ruleBlock = (prefix, n, compact = false) =>
  compact
    ? `
<div class="rule"><span class="num">Decision rule #${n}</span>
  ${field(`${prefix}${n}_approval`, 'Recurring approval', { hint: 'what keeps landing on your desk?' })}
  <div class="grid2">
    <div>${field(`${prefix}${n}_trigger`, 'Trigger', { hint: 'when does it apply?' })}</div>
    <div>${field(`${prefix}${n}_threshold`, 'Threshold or criteria')}</div>
  </div>
  <div class="grid2">
    <div>${field(`${prefix}${n}_owner`, 'Who decides without you')}</div>
    <div>${field(`${prefix}${n}_good`, 'What &ldquo;good enough&rdquo; looks like')}</div>
  </div>
</div>`
    : `
<div class="rule"><span class="num">Decision rule #${n}</span>
  ${field(`${prefix}${n}_approval`, 'Recurring approval', { hint: 'what keeps landing on your desk?' })}
  <div class="grid2">
    <div>${field(`${prefix}${n}_trigger`, 'Trigger', { hint: 'when does this rule apply?' })}</div>
    <div>${field(`${prefix}${n}_threshold`, 'Threshold or criteria', { hint: 'the number that decides it' })}</div>
  </div>
  <div class="grid2">
    <div>${field(`${prefix}${n}_owner`, 'Who decides without you')}</div>
    <div>${field(`${prefix}${n}_review`, 'Review date', { hint: 'when it gets checked' })}</div>
  </div>
  ${field(`${prefix}${n}_good`, 'What &ldquo;good enough&rdquo; looks like', { size: 'ml' })}
</div>`;

const audit = {
  file: 'founder-bottleneck-audit.pdf',
  type: 'Worksheet',
  title: 'The Founder Bottleneck Audit',
  subtitle: 'Every decision that runs through you is a tax on your business. Find them, cost them, and cut them in one working week.',
  meta: ['Fillable PDF', '5 pages', '5 days + 1 hour'],
  pages: [
    `
<section class="block">
  <p class="kicker">The problem</p>
  <h2>The queue you can&rsquo;t see</h2>
  <p class="lead">You built the business and you know it best, so people ask you, and you answer. That pattern made sense when the team was small. As the business grows, it quietly becomes the constraint.</p>
  <p>The constraint isn&rsquo;t your team, and it isn&rsquo;t the market. It&rsquo;s the invisible queue of decisions, approvals and sign-offs waiting for your attention every day. The gap isn&rsquo;t that you are the bottleneck personally: it&rsquo;s that the operating infrastructure hasn&rsquo;t kept pace with the business.</p>
</section>
<section class="block">
  <p class="kicker">What it looks like</p>
  <div class="cards c3">
    <div class="card"><div class="big">Waiting</div><p>Work stops until you reply. Your team learns that the fastest route is to ask you.</p></div>
    <div class="card"><div class="big">Reacting</div><p>Your day fills with issues as they arrive, and planned work is pushed back.</p></div>
    <div class="card"><div class="big">Repeating</div><p>The same question reaches you again and again, because the answer was never written down.</p></div>
  </div>
</section>
<div class="callout"><p><b>Many of those decisions and approvals should never reach your desk.</b> This audit finds them in three steps: track, question, then write the rule.</p></div>
<section class="block">
  <p class="kicker">How to use this worksheet</p>
  <ol class="steps">
    <li><b>Track</b> every approval that reaches you for five working days (page 2).</li>
    <li><b>Audit</b> the list with three questions (page 3).</li>
    <li><b>Write a decision rule</b> for your top three recurring approvals, then act on it this week (pages 4&ndash;5).</li>
  </ol>
  <p class="small muted">Type straight into the grey fields on screen and save the file, or print it and write by hand.</p>
</section>`,
    `
<section class="block">
  <p class="kicker">Step 1</p>
  <h2>Track every approval for five days</h2>
  <p>Log it as it happens, not from memory at the end of the day. Be honest: the point is to see the pattern.</p>
  <table class="t">
    <thead><tr><th>Day</th><th>What was it?</th><th>How long did it wait on you?</th><th>Did it need to be you?</th></tr></thead>
    <tbody>${trackerRows}</tbody>
  </table>
</section>
<section class="block">
  <div class="grid2">
    <div>${field('track_total', 'Total approvals this week')}</div>
    <div>${field('track_hours', 'Time spent waiting on you', { hint: 'rough estimate' })}</div>
  </div>
  ${field('track_pattern', 'The pattern you notice', { size: 'xl', hint: 'which approvals keep coming back?' })}
  ${field('track_first', 'The one approval to hand off first', { size: 'ml' })}
</section>`,
    `
<section class="block">
  <p class="kicker">Step 2</p>
  <h2>The three-question audit</h2>
  <p>Go through your five-day log with these questions. If you answer yes to any of them, you&rsquo;ve found a bottleneck.</p>
</section>
<section class="block">
  <h3>1. What got delayed because it waited for you?</h3>
  <p class="small muted">Projects or decisions that sat in limbo, not because the team couldn&rsquo;t act, but because they were waiting on you.</p>
  ${field('q1', '', { size: 'xl' })}
</section>
<section class="block">
  <h3>2. What did you approve that you didn&rsquo;t need to see?</h3>
  <p class="small muted">Invoices under a threshold, supplier responses. If the outcome was the same whether you saw it or not, that&rsquo;s a bottleneck.</p>
  ${field('q2', '', { size: 'xl' })}
</section>
<section class="block">
  <h3>3. What do people ask you that they already know the answer to?</h3>
  <p class="small muted">The most expensive category: the team doesn&rsquo;t trust its own judgement, usually because it has never been given the framework to use it.</p>
  ${field('q3', '', { size: 'xl' })}
</section>
<div class="callout"><p class="kicker">The insight</p><p>The real issue isn&rsquo;t delegation, it&rsquo;s doctrine. Your team isn&rsquo;t asking because they&rsquo;re unconfident; they don&rsquo;t know what &ldquo;good&rdquo; looks like without you in the room. The fix is codifying the judgement you carry in your head.</p></div>`,
    `
<section class="block">
  <p class="kicker">Step 3</p>
  <h2>Write the rule</h2>
  <p>Take your top three recurring approvals from Step 1 and write a decision rule for each. A rule with no number in it isn&rsquo;t a rule, it&rsquo;s a suggestion.</p>
</section>
${ruleBlock('rule', 1, true)}
${ruleBlock('rule', 2, true)}
${ruleBlock('rule', 3, true)}`,
    `
<section class="block">
  <p class="kicker">This week</p>
  <h2>Three actions</h2>
  <div class="chkrow">${check('week_track')}<div><b>Track every approval for five days.</b> What it was, how long it waited, and whether it needed to be you.</div></div>
  <div class="chkrow">${check('week_rules')}<div><b>Write a one-page decision rule for your top three approvals.</b> When to do it, when not to, and what &ldquo;good enough&rdquo; looks like.</div></div>
  <div class="chkrow">${check('week_threshold')}<div><b>Set a financial threshold your team can act within without asking.</b> The number matters less than having one.</div></div>
  <div class="grid2">
    <div>${field('week_threshold_amount', 'Our threshold', { hint: 'e.g. up to 500 per decision' })}</div>
    <div>${field('week_threshold_who', 'Applies to')}</div>
  </div>
</section>
<section class="block">
  <p class="kicker">The closing question</p>
  <h2>If you were unavailable for 48 hours, what would grind to a halt?</h2>
  <p>That list is your audit.</p>
  ${field('closing_list', '', { size: 'xl' })}
</section>
${cta('The audit covers one area. A discovery call looks at how the rest of your agency runs, so you can see where the next bottleneck is before it costs you.')}
${sig}`,
  ],
};

// ---------------------------------------------------------------- Decision Rulebook
const rulebook = {
  file: 'decision-rulebook.pdf',
  type: 'Template',
  title: 'The Decision Rulebook',
  subtitle: 'Turn recurring approvals into standing rules your team can use without you.',
  meta: ['Fillable PDF', '4 pages', '20 minutes per rule'],
  pages: [
    `
<section class="block">
  <p class="kicker">Why this exists</p>
  <h2>Codify the judgement you already carry</h2>
  <p class="lead">Your team isn&rsquo;t asking for approval because they&rsquo;re unconfident. They&rsquo;re asking because they&rsquo;ve never been given the framework to decide without you.</p>
  <p>The fix isn&rsquo;t handing tasks off. It&rsquo;s writing down the judgement you use every time, so the same decision doesn&rsquo;t reach your desk twice.</p>
</section>
<section class="block">
  <p class="kicker">What a decision rule does</p>
  <div class="cards c3">
    <div class="card"><div class="big">1</div><p><b>Names when it applies.</b> The trigger that makes this rule the one to use.</p></div>
    <div class="card"><div class="big">2</div><p><b>States the threshold.</b> The number or condition that decides the outcome.</p></div>
    <div class="card"><div class="big">3</div><p><b>Says who decides.</b> A named owner, so nobody has to check with you.</p></div>
  </div>
</section>
<section class="block">
  <p class="kicker">How to use this</p>
  <ol class="steps">
    <li><b>Identify the approval.</b> Something that crossed your desk more than twice last month, where the outcome would have been the same whether you saw it or not.</li>
    <li><b>Write the rule.</b> Use one rule block per approval. Be specific: a rule with no numbers in it is a suggestion.</li>
    <li><b>Test it.</b> Hand the decision to its new owner and watch what they do with it once, before you let go completely.</li>
  </ol>
</section>
<div class="callout"><p><b>Tip:</b> type into the grey fields and save the file. Share the finished rulebook where your team already works, not in a folder nobody opens.</p></div>`,
    `
<p class="kicker">The template</p>
<h2 style="margin-bottom:6mm">Your decision rules</h2>
${ruleBlock('rule', 1)}
<div class="grid2"><div>${field('rule1_tested_with', 'Tested with')}</div><div>${field('rule1_tested_on', 'Tested on')}</div></div>
<div style="height:4mm"></div>
${ruleBlock('rule', 2)}
<div class="grid2"><div>${field('rule2_tested_with', 'Tested with')}</div><div>${field('rule2_tested_on', 'Tested on')}</div></div>`,
    `
${ruleBlock('rule', 3)}
<div class="grid2"><div>${field('rule3_tested_with', 'Tested with')}</div><div>${field('rule3_tested_on', 'Tested on')}</div></div>
<div style="height:4mm"></div>
${ruleBlock('rule', 4)}
<div class="grid2"><div>${field('rule4_tested_with', 'Tested with')}</div><div>${field('rule4_tested_on', 'Tested on')}</div></div>`,
    `
<section class="block">
  <p class="kicker">What good looks like</p>
  <h2>When a rule is working</h2>
  <p>A decision rule is working when the outcome stops being reported to you as a decision, only as a summary. If people still check with you after the rule exists, it&rsquo;s either too vague, or nobody told them it exists.</p>
  <div class="chkrow">${check('check_numbers')}<div>The rule has a number or a clear condition in it.</div></div>
  <div class="chkrow">${check('check_owner')}<div>It names one owner, not a team.</div></div>
  <div class="chkrow">${check('check_shared')}<div>The people it affects have seen it and know where it lives.</div></div>
  <div class="chkrow">${check('check_review')}<div>It has a review date in the calendar.</div></div>
</section>
<section class="block">
  <p class="kicker">Notes</p>
  ${field('notes', '', { size: 'xl' })}
</section>
<div class="callout"><p>This is the same discipline behind any reliable operation: whether someone new could run your core process from written instructions alone. A decision rule applies it to judgement calls instead of tasks.</p></div>
${cta('Install decision rules across every part of the business, not just the approvals you happened to notice.')}
${sig}`,
  ],
};

// ---------------------------------------------------------------- Governance Cadence Planner
const weeks = Array.from({ length: 13 }, (_, i) => i + 1)
  .map((w) => `
<tr class="${w % 2 ? '' : 'shade'}">
  <td style="width:7%;font-weight:800">${w}</td>
  <td style="width:15%"><div class="fld" data-field="wk${w}_date"></div></td>
  <td class="c" style="width:12%">${check(`wk${w}_daily`)}</td>
  <td class="c" style="width:12%">${check(`wk${w}_weekly`)}</td>
  <td style="width:42%"><div class="fld" data-field="wk${w}_fixed"></div></td>
  <td class="c" style="width:12%">${w % 4 === 0 || w === 13 ? check(`wk${w}_monthly`) : '<span class="muted small">&ndash;</span>'}</td>
</tr>`)
  .join('');

const layerSetup = (key, name, when, whenLabel, agendaLabel) => `
<div class="rule"><span class="num">${name}</span>
  <p class="small muted" style="margin:0 0 2.5mm">${when}</p>
  <div class="grid2"><div>${field(`${key}_when`, whenLabel)}</div><div>${field(`${key}_owner`, 'Owner')}</div></div>
  ${field(`${key}_agenda`, agendaLabel, { size: 'ml' })}
</div>`;

const planner = {
  file: 'governance-cadence-planner.pdf',
  type: 'Planner',
  title: 'The Governance Cadence Planner',
  subtitle: 'A 90-day rhythm you can actually run, not another meeting nobody prepares for.',
  meta: ['Fillable PDF', '4 pages', '13-week tracker'],
  pages: [
    `
<section class="block">
  <p class="kicker">Why a rhythm, not a fire</p>
  <h2>Operators run rhythms</h2>
  <p class="lead">Founders stuck in firefighting mode fix problems all day, hold everything together, and quietly know they&rsquo;re the constraint.</p>
  <p>Operators don&rsquo;t chase every fire, they run rhythms. Daily huddles, weekly reviews and monthly check-ins give the team structure, clarity, and a place to raise issues before they explode. The rhythm only works if it&rsquo;s short, focused and consistent, so it becomes how work happens rather than another meeting on top.</p>
</section>
<section class="block">
  <p class="kicker">The three layers</p>
  <div class="cards c3">
    <div class="card"><div class="big">15 min</div><p><b>Daily huddle.</b> Same time every day. Owner, today&rsquo;s priorities, what&rsquo;s blocked. Nothing gets solved in the huddle: blockers are named and taken offline.</p></div>
    <div class="card"><div class="big">30&ndash;60</div><p><b>Weekly review.</b> Same day every week. Two or three KPIs, what moved and why, and one thing to fix before next week.</p></div>
    <div class="card"><div class="big">60&ndash;90</div><p><b>Monthly check-in.</b> Same date every month. Numbers reviewed whether or not anything looks wrong, capacity checked, one process reviewed in depth.</p></div>
  </div>
</section>
<section class="block">
  <p class="kicker">How to use this planner</p>
  <ol class="steps">
    <li><b>Set up each layer</b>: owner, time and standing agenda (page 2).</li>
    <li><b>Run the 13-week tracker</b>: tick each cycle that actually ran, not just the ones that were scheduled (page 3).</li>
    <li><b>Review at week 13</b> and decide what to keep, change or drop (page 4).</li>
  </ol>
</section>
<div class="callout"><p><b>Start with one layer.</b> The daily huddle is usually the easiest. Add the next layer once the first runs without you chasing it.</p></div>`,
    `
<p class="kicker">Build your planner</p>
<h2 style="margin-bottom:6mm">Set up the three layers</h2>
${layerSetup('daily', 'Daily huddle', '15 minutes, same time every day.', 'Time', 'Standing agenda')}
${layerSetup('weekly', 'Weekly review', '30 to 60 minutes, same day every week.', 'Day and time', 'KPIs tracked (two or three)')}
${layerSetup('monthly', 'Monthly check-in', '60 to 90 minutes, same date every month.', 'Date each month', 'Standing agenda')}
${field('start_date', 'Planner start date', { hint: 'week 1 begins' })}`,
    `
<p class="kicker">13-week tracker</p>
<h2>Mark what actually ran</h2>
<p class="small muted">Tick the huddle and review only if they ran at least four days and once that week. The monthly check-in is due in weeks 4, 8, 12 and 13.</p>
<table class="t">
  <thead><tr><th>Week</th><th>Week of</th><th>Daily huddle ran</th><th>Weekly review ran</th><th>One thing fixed this week</th><th>Monthly check-in</th></tr></thead>
  <tbody>${weeks}</tbody>
</table>`,
    `
<section class="block">
  <p class="kicker">Week 13 review</p>
  <h2>Keep, change or drop</h2>
  <div class="grid2">
    <div>${field('review_keep', 'Keep', { size: 'ml' })}</div>
    <div>${field('review_change', 'Change', { size: 'ml' })}</div>
  </div>
  ${field('review_biggest', 'The biggest thing the rhythm fixed', { size: 'ml' })}
</section>
<section class="block">
  <p class="kicker">The common failure modes</p>
  <div class="cards c3">
    <div class="card"><p><b>Trying to fix everything at once.</b> Install one layer first. Add the next once the first runs without you chasing it.</p></div>
    <div class="card"><p><b>Keeping exceptions for yourself.</b> If you bypass the rhythm, everyone else will too. The rules apply to you first.</p></div>
    <div class="card"><p><b>Confusing visibility with micromanagement.</b> The rhythm lets you step back without losing sight, not interfere more often.</p></div>
  </div>
</section>
<div class="callout"><p>This is a governance cadence in its simplest form, with the first cycle actually run, not just scheduled.</p></div>
${cta('Build your cadence with support: a discovery call shows which areas of your business most need a regular review.')}
${sig}`,
  ],
};

// ---------------------------------------------------------------- VOS Scorecard Preview
const areas = [
  ['The Bridge', 'Clarity &amp; Alignment', 'Whether the line between what only you can do, and what simply ended up with you, has ever been made explicit.'],
  ['The Bridge', 'Strategy &amp; Positioning', 'Whether the business is built around one clear route to market, or several at once with no stated lead.'],
  ['The Bridge', 'Planning &amp; Rhythm', 'Whether a real, current plan guides the next quarter, and whether revenue concentration risk is known.'],
  ['The Hull', 'Cash &amp; Margin', 'Whether you know what you actually make on what you sell, per product or service line.'],
  ['The Hull', 'Measurement &amp; Control', 'Whether there&rsquo;s one trusted source for the numbers that matter, or several conflicting ones.'],
  ['The Hull', 'Operations &amp; Delivery', 'Whether delivery runs on documented process, or on you personally being in the room.'],
  ['The Cargo Hold', 'Revenue Engine', 'Whether you know what a customer costs to win, and what one is worth.'],
  ['The Cargo Hold', 'Product &amp; Innovation', 'Whether your offer changes deliberately or drifts, and whether quality problems are tracked as a number.'],
  ['The Cargo Hold', 'Customer &amp; Retention', 'Whether anything actively brings customers back, or retention just happens.'],
];
const areaRows = areas
  .map(([pillar, name, desc], i) => `
<tr class="${i % 2 ? 'shade' : ''}">
  <td class="area"><span>${pillar}</span>${name}</td>
  <td style="font-size:8pt;line-height:1.4">${desc}</td>
  <td class="rate"><span class="rates">${[1, 2, 3, 4, 5].map((v) => `<span class="n">${v}</span><span class="rad" data-radio="area${i + 1}" data-value="${v}"></span>`).join('')}</span></td>
</tr>`)
  .join('');

const scorecard = {
  file: 'vos-scorecard-preview.pdf',
  type: 'Preview',
  title: 'The VOS Scorecard Preview',
  subtitle: 'What the Vessel Operating System measures, what your score means, and a quick gut check before you take the free assessment.',
  meta: ['Interactive PDF', '3 pages', '5-minute gut check'],
  pages: [
    `
<section class="block">
  <p class="kicker">What VOS is</p>
  <h2>A tracked system, not a one-off form</h2>
  <p class="lead">Most scorecards ask what you think about your business once, then send a PDF. VOS is the system used throughout an engagement: it scores the business, turns the weakest points into a 90-day plan, and tracks what was committed against what actually happened.</p>
  <p>This preview shows the shape of it, so you know what you&rsquo;re looking at before you take the free assessment.</p>
</section>
<section class="block">
  <p class="kicker">Three pillars, nine areas</p>
  <p>VOS scores three pillars separately, because a business can be strong in one and weak in another at the same time, and that gap is usually where the risk is hiding.</p>
  <div class="pillars">
    <div class="pillar"><h3>The Bridge</h3><div class="sub">Vision &amp; Strategy</div><p>Where the business is steered from: alignment, strategy, and the plan the whole team is actually rowing towards. A shaky Bridge means people work hard but pull in different directions.</p></div>
    <div class="pillar"><h3>The Hull</h3><div class="sub">Systems &amp; Cash</div><p>What keeps the business watertight and moving: the money, the numbers you steer by, and the processes that deliver what you sold. A brilliant Bridge can still take on water here.</p></div>
    <div class="pillar"><h3>The Cargo Hold</h3><div class="sub">Product &amp; Marketing</div><p>What you carry to market: the demand you create, what you sell, and the customers who come back. A strong Hull with an empty hold goes nowhere.</p></div>
  </div>
</section>
<div class="callout"><p><b>On the next page:</b> rate each of the nine areas from 1 (weak) to 5 (strong) on gut feel. It isn&rsquo;t your VOS score, but it shows where to look first.</p></div>`,
    `
<p class="kicker">Your gut check</p>
<h2>Rate the nine areas</h2>
<p class="small muted">1 = this is a real weakness &middot; 5 = this is genuinely strong. Click a circle to choose.</p>
<table class="t areas">
  <thead><tr><th>Area</th><th>What it looks at</th><th>Your rating</th></tr></thead>
  <tbody>${areaRows}</tbody>
</table>
<div style="height:5mm"></div>
<div class="grid2">
  <div>${field('lowest_area', 'Your lowest-rated area')}</div>
  <div>${field('lowest_why', 'Why it scored low')}</div>
</div>
<div class="grid2">
  <div>${field('highest_area', 'Your highest-rated area')}</div>
  <div>${field('gap', 'Biggest gap between two pillars')}</div>
</div>
${field('first_change', 'The first change you would make', { size: 'xl' })}
<div class="callout"><p>Your gut check shows where to look. The free VOS assessment turns it into a Business Health score and band, so you know where to act first.</p></div>`,
    `
<section class="block">
  <p class="kicker">What your score means</p>
  <h2>A Business Health score from 0 to 100</h2>
  <table class="t bands">
    <thead><tr><th style="width:30%">Score</th><th>Band</th></tr></thead>
    <tbody>
      <tr><td>0&ndash;39</td><td><b>Needs Attention</b></td></tr>
      <tr class="shade"><td>40&ndash;54</td><td><b>Developing</b></td></tr>
      <tr><td>55&ndash;69</td><td><b>Solid Foundation</b></td></tr>
      <tr class="shade"><td>70&ndash;84</td><td><b>Strong</b></td></tr>
      <tr><td>85&ndash;100</td><td><b>Excellent</b></td></tr>
    </tbody>
  </table>
</section>
<section class="block">
  <p class="kicker">Where the business sits</p>
  <p>Alongside the score, VOS describes the system around you. It&rsquo;s a description, not a judgement.</p>
  <div class="stages">
    <div class="stage"><b>Trapped</b>Cash is tight and you are the business. Everything waits on you.</div>
    <div class="stage"><b>Fragile</b>Profit exists but feels fragile, and the hours are punishing.</div>
    <div class="stage"><b>Stabilising</b>Processes are forming. You can step away occasionally.</div>
    <div class="stage"><b>Scaling</b>Strong systems and margin. You lead; others run the day-to-day.</div>
    <div class="stage"><b>Liberated</b>The business runs without you. You choose the work you do.</div>
  </div>
</section>
<section class="block">
  <p class="kicker">Backed by a guarantee</p>
  <p>If, by the end of month one, VOS hasn&rsquo;t produced a specific, named item you can point to and say &ldquo;that&rsquo;s now off my desk&rdquo;, you don&rsquo;t pay for months two and three.</p>
</section>
${cta('This preview shows what VOS measures. The free assessment tells you where your business actually sits, with your Business Health score and band at the end.', true)}
${sig}`,
  ],
};


// ---------------------------------------------------------------- Before You Hire
const rateRows = (prefix, items) =>
  items
    .map((t, i) => `
<tr class="${i % 2 ? 'shade' : ''}">
  <td class="c" style="width:7%;font-weight:800">${i + 1}</td>
  <td>${t}</td>
  <td style="width:15%"><div class="fld" data-field="${prefix}_${i + 1}"></div></td>
</tr>`)
    .join('');

const pillarPage = (n, name, word, lead, prefix, items) => `
<section class="block">
  <p class="kicker">Pillar ${n} of 3</p>
  <h2>${name}: ${word}</h2>
  <p class="lead">${lead}</p>
  <table class="t">
    <thead><tr><th>#</th><th>Rate each 1 (not true at all) to 5 (completely true)</th><th>Score</th></tr></thead>
    <tbody>${rateRows(prefix, items)}</tbody>
  </table>
</section>
<section class="block">
  <div class="grid2">
    <div>${field(`${prefix}_total`, `${word.charAt(0).toUpperCase()}${word.slice(1)} subtotal`, { hint: 'out of 20 &middot; adds up on its own in Acrobat', calc: [1, 2, 3, 4].map((i) => `${prefix}_${i}`).join(',') })}</div>
    <div>${field(`${prefix}_low`, 'The statement you scored lowest')}</div>
  </div>
</section>`;

const hire = {
  file: 'before-you-hire.pdf',
  type: 'Readiness check',
  title: 'Before You Hire',
  subtitle: 'A 20-minute check on whether your agency is ready to grow, before you add headcount.',
  meta: ['Fillable PDF', '8 pages', '20 minutes'],
  pages: [
    `
<section class="block">
  <p class="kicker">The premise</p>
  <h2>Another pair of hands, or a better structure?</h2>
  <p class="lead">Most agency founders hire when the pressure gets too high: another project manager, another pair of hands in delivery, another account lead. The relief lasts about a month. Then the same decisions queue up behind a bigger team, the same quotes and sign-offs wait on you, and the pressure comes back with a salary attached.</p>
  <p>Sometimes the work really has outgrown the team. More often, the jobs, teams and suppliers still run through you, and a new person inherits that. This tells you which one you are looking at, before you post the job.</p>
</section>
<section class="block">
  <p class="kicker">What this looks at</p>
  <h3>Three parts of the business</h3>
  <p>Every agency floats on three pillars. Each is checked separately, because you can be strong in one and weak in another at the same time, and that gap is where the risk hides.</p>
  <div class="cards c3">
    <div class="card"><div class="big">Strategy</div><p><b>The Bridge.</b> Where the business is steered from: direction, ownership of decisions, and the plan people are actually rowing towards.</p></div>
    <div class="card"><div class="big">Systems</div><p><b>The Hull.</b> What keeps you watertight: margin per job, numbers you trust, and production that holds without you on site.</p></div>
    <div class="card"><div class="big">Product</div><p><b>The Cargo Hold.</b> What you carry to market: how jobs arrive, what you sell, and the clients who come back next season.</p></div>
  </div>
</section>
<section class="block">
  <p class="kicker">How to use it</p>
  <ol class="steps">
    <li><b>Answer twelve statements</b>, four per pillar, from 1 to 5 (pages 2&ndash;4).</li>
    <li><b>Total your score</b> out of 60 and read the verdict (page 5).</li>
    <li><b>Price the hire</b> you are considering, then write the three things you will change first (pages 6&ndash;7).</li>
  </ol>
  <p class="small muted">Answer honestly, not aspirationally. Type into the grey fields and save the file, or print it and write by hand.</p>
</section>`,
    pillarPage(1, 'The Bridge', 'strategy', 'Direction, ownership and the plan. A weak Bridge means delivery teams and account leads work hard in different directions, and a new hire inherits the confusion.', 'bridge', [
      'My team knows which decisions they can make on a job without me, and which have to come to me.',
      'If I were away for two weeks, live jobs would keep moving to the same standard.',
      'We have a written plan for this quarter that we actually review.',
      'Anyone here could say in one sentence what we are best at building, and who we build it for.',
    ]),
    pillarPage(2, 'The Hull', 'systems', 'Margin, numbers and delivery. A weak Hull means a new salary lands on a business that cannot yet see what it makes per job, or how much work the team can take.', 'hull', [
      'I know what we make on each job type, not just total revenue.',
      'The numbers I steer by come from one source everyone trusts.',
      'Quoting, delivery and handover run on a written process, not on me being in the room.',
      'I can see this week how much delivery capacity we actually have, across crew, studio and freelancers.',
    ]),
    pillarPage(3, 'The Cargo Hold', 'product', 'Demand, offer and retention. A weak Cargo Hold means you hire for jobs you hope will land, rather than work you can already see in the pipeline.', 'cargo', [
      'New jobs come from more than one predictable source, not only repeat clients and referrals.',
      'I know roughly what it costs to win a client and what one is worth across a year.',
      'Our offer changes on purpose, not because a client asked.',
      'Something we do actively brings clients back for the next campaign. Retention is not luck.',
    ]),
    `
<section class="block">
  <p class="kicker">Your score</p>
  <h2>What the number means</h2>
  <div class="grid2">
    <div>${field('score_total', 'Total score', { hint: 'out of 60 &middot; the three subtotals added up', calc: 'bridge_total,hull_total,cargo_total' })}</div>
    <div>${field('score_weakest', 'Weakest pillar', { hint: 'strategy, systems or product' })}</div>
  </div>
</section>
<section class="block">
  <div class="stages">
    <div class="stage"><b>12&ndash;29 &middot; Hiring now will multiply the problem</b>Whatever is unclear today gets copied onto the new person, and you end up managing the confusion as well as doing the work. Fix your two lowest-scoring statements first.</div>
    <div class="stage"><b>30&ndash;44 &middot; Hire, but not yet</b>You have enough structure to absorb someone, but not enough for them to work without you. Put two things in place before the offer goes out.</div>
    <div class="stage"><b>45&ndash;60 &middot; You are ready</b>The risk now is losing what works as you grow. Write down what currently holds it together, before a new person changes it.</div>
  </div>
</section>
<div class="callout"><p><b>Read the pillars, not just the total.</b> A business strong in two pillars and weak in one usually fails at the weak one, whatever the total says. If your lowest subtotal is strategy, a hire will not fix it. If it is systems, a hire will expose it.</p></div>`,
    `
<section class="block">
  <p class="kicker">The other side of the decision</p>
  <h2>What hiring anyway will cost you</h2>
  <p>Before you post the job, fill this in with your own numbers. Not the day rate or salary you have in your head: the whole cost of the first year, including the time it takes off you.</p>
  <table class="t">
    <thead><tr><th>Cost</th><th>Your figure</th></tr></thead>
    <tbody>
      <tr><td>Salary</td><td style="width:34%"><div class="fld" data-field="cost_salary"></div></td></tr>
      <tr class="shade"><td>Employer National Insurance and pension</td><td><div class="fld" data-field="cost_oncost"></div></td></tr>
      <tr><td>Recruitment fee, or your time to hire</td><td><div class="fld" data-field="cost_recruit"></div></td></tr>
      <tr class="shade"><td>Laptop, software, desk, tools or equipment</td><td><div class="fld" data-field="cost_kit"></div></td></tr>
      <tr><td>Your hours onboarding them, at what your hour is worth</td><td><div class="fld" data-field="cost_onboard"></div></td></tr>
      <tr class="shade"><td>Your hours managing them each week, for the first six months</td><td><div class="fld" data-field="cost_manage"></div></td></tr>
      <tr><td><b>First-year total</b></td><td><div class="fld" data-field="cost_total" data-calc="cost_salary,cost_oncost,cost_recruit,cost_kit,cost_onboard,cost_manage"></div></td></tr>
    </tbody>
  </table>
</section>
<div class="callout"><p>Now put that number next to your score. Under 30, it is the price of hiring into a structure that is not ready for the person.</p></div>`,
    `
<section class="block">
  <p class="kicker">Before you hire, or before they start</p>
  <h2>Your three next steps</h2>
  <p class="lead">Take them straight from your answers: the two statements you scored lowest, and the pillar with the weakest subtotal. Those are the gaps a new person would inherit.</p>
  <p>Three things, not ten. Each one needs a name and a date, or it will not happen. If a step is really a project, write the first week of it instead.</p>
  <div class="grid2">
    <div>${field('steps_weakest', 'Weakest pillar (from page 5)')}</div>
    <div>${field('steps_lowest', 'Your two lowest-scoring statements')}</div>
  </div>
</section>
<section class="block">
  <div class="rule"><span class="num">Step 1</span>
    ${field('step1_what', 'What changes', { size: 'ml' })}
    <div class="grid2"><div>${field('step1_owner', 'Who owns it')}</div><div>${field('step1_when', 'By when')}</div></div>
  </div>
  <div class="rule"><span class="num">Step 2</span>
    ${field('step2_what', 'What changes', { size: 'ml' })}
    <div class="grid2"><div>${field('step2_owner', 'Who owns it')}</div><div>${field('step2_when', 'By when')}</div></div>
  </div>
  <div class="rule"><span class="num">Step 3</span>
    ${field('step3_what', 'What changes', { size: 'ml' })}
    <div class="grid2"><div>${field('step3_owner', 'Who owns it')}</div><div>${field('step3_when', 'By when')}</div></div>
  </div>
</section>`,
    `
<section class="block">
  <p class="kicker">Where this stops</p>
  <h2>What this check does not cover</h2>
  <p class="lead">This tells you whether you are ready to hire, and what it is likely to cost if you are not. It does not tell you where the agency is actually stuck, or in what order to fix things.</p>
  <p>That is a different piece of work: finding the one constraint holding everything else back, and sequencing the fixes so they hold under pressure. Twelve statements cannot do that, and any tool that claims to is selling you something.</p>
</section>
<section class="block">
  <p class="kicker">The fuller picture</p>
  <div class="cards c2">
    <div class="card"><p><b>A 30-minute discovery call</b> reads your answers with you. I will tell you honestly whether hiring is the right next move, whether or not we work together.</p></div>
  </div>
</section>
${cta('You have the symptoms. A discovery call turns them into a short list of what to fix before you add anyone.')}
${sig}`,
  ],
};


// ---------------------------------------------------------------- shared helpers for the two newer tools
// Table row with a field on the right. opts.expr = arithmetic on other field names (auto-calculates in Acrobat);
// opts.calc = SUM of listed fields; opts.strong = bold result row.
const mrow = (i, name, label, { hint = '', expr = '', calc = '', strong = false } = {}) => `
<tr class="${i % 2 ? 'shade' : ''}"><td>${strong ? '<b>' : ''}${label}${strong ? '</b>' : ''}${hint ? ` <span class="hint">${hint}</span>` : ''}</td><td style="width:30%"><div class="fld" data-field="${name}"${calc ? ` data-calc="${calc}"` : ''}${expr ? ` data-calc-expr="${expr}"` : ''}></div></td></tr>`;
const mtable = (head, rows) => `<table class="t"><thead><tr><th>${head}</th><th>Your figure</th></tr></thead><tbody>${rows.map((r, i) => mrow(i, ...r)).join('')}</tbody></table>`;
const planRow = (p, kpi = 'a number') => `
<div class="grid3">
  <div>${field(`${p}_owner`, 'Who owns the install')}</div>
  <div>${field(`${p}_start`, 'Start date')}</div>
  <div>${field(`${p}_target`, 'Your 30-day target', { hint: kpi })}</div>
</div>`;
const chkLine = (name, text) => `<div class="chkrow">${check(name)}<span>${text}</span></div>`;

// ---------------------------------------------------------------- Agency Margin Leak Map
const leakHead = (n, name, lead, tag = '') => `
<section class="block">
  <p class="kicker">Leak ${n} of 7${tag}</p>
  <h2>${name}</h2>
  <p class="lead">${lead}</p>
</section>`;

const leakmap = {
  file: 'agency-margin-leak-map.pdf',
  type: 'Margin diagnostic',
  title: 'The Agency Margin Leak Map',
  subtitle: 'Seven places margin leaks between brief and cash. Estimate each one in five minutes, then install the system that closes it.',
  meta: ['Fillable PDF', '11 pages', '50 minutes'],
  pages: [
    `
<section class="block">
  <p class="kicker">The premise</p>
  <h2>Margin rarely disappears in one place</h2>
  <p class="lead">An agency can win good work, deliver it well and still keep less than it should. The money goes quietly: in pitches that never convert, in extras nobody priced, in a quote that was wrong before the job began.</p>
  <p>This map covers seven leaks, plus the outside pressures that widen them: late payment and a shifting economy. Measure each from your last twelve months of data, then install the system on your side that closes it. Leak 3 applies only to agencies that make physical product.</p>
  <p class="small muted"><b>In this map, &ldquo;margin leak&rdquo; means avoidable profit, contribution or cash-flow impact.</b> Figures are estimates.</p>
</section>
<section class="block">
  <p class="kicker">How to use it</p>
  <ol class="steps">
    <li><b>Measure.</b> Type figures into the grey fields. In Acrobat or Edge, totals work themselves out.</li>
    <li><b>Install.</b> Each leak page has a ready-made system: a checklist, template or rule. Fill it in.</li>
    <li><b>Choose three.</b> Page 10 collects your figures. Pick the three most material and re-measure in 30 days.</li>
  </ol>
  <p class="small muted">Type into the fields and save, or print and write by hand.</p>
</section>
<section class="block">
  <p class="kicker">The seven leaks</p>
  <div class="cards c3">
    <div class="card"><div class="big">Win</div><p><b>1. Pitching</b><br>Free work spent chasing business that does not convert.<br><b>2. Scope creep</b><br>Delivered work that was never priced.</p></div>
    <div class="card"><div class="big">Make</div><p><b>3. Unit cost</b><br>Product quoted below what it truly costs. <i>Production only.</i><br><b>6. Capacity-bound revenue</b><br>Income that grows only as delivery hours do.</p></div>
    <div class="card"><div class="big">Keep</div><p><b>4. Cash tied up</b><br>Your cash committed before you can bill.<br><b>5. Late invoices</b><br>Overdue cash that is earned but not yet yours.<br><b>7. Informal systems</b><br>Work that stops when one person is away.</p></div>
  </div>
</section>`,

    leakHead(1, 'Pitching', 'Pitching is a cost of sale. Most agencies never total it, so it never gets a budget, and every pitch gets full effort whatever the odds.') + `
<section class="block">
  <p class="kicker">Measure it</p>
  ${mtable('Last 12 months', [
    ['l1_n', 'Pitches you put together'],
    ['l1_hrs', 'Average hours of team time per pitch'],
    ['l1_rate', 'Blended internal cost per team hour', { hint: '&pound; &middot; fully loaded, not your billing rate' }],
    ['l1_won', 'Pitches won'],
    ['l1_cost', 'Total cost of pitching (cost of sale)', { hint: '&pound; &middot; works itself out', expr: 'l1_n*l1_hrs*l1_rate', strong: true }],
    ['l1_perwin', 'Cost of each win', { hint: '&pound; &middot; works itself out', expr: 'l1_cost/l1_won', strong: true }],
  ])}
</section>
<section class="block">
  <p class="kicker">Install it</p>
  <h3>A pitch budget and a go or no-go checklist</h3>
  <p>Decide before you start, not after you have spent the week. Pitch only when the first two are true, and at least two of the other three.</p>
  ${chkLine('l1_c1', '<b>Must:</b> We know the budget, or the budget range, before we start.')}
  ${chkLine('l1_c2', '<b>Must:</b> We have the capacity to deliver it if we win.')}
  ${chkLine('l1_c3', 'The client fits the work we already do well.')}
  ${chkLine('l1_c4', 'We have spoken to the person who decides, not only the person who briefed us.')}
  ${chkLine('l1_c5', 'The pitch is paid, or the free part is capped.')}
  <div class="grid3">
    <div>${field('l1_cap_hrs', 'Maximum hours per pitch')}</div>
    <div>${field('l1_cap_gbp', 'Maximum spend per pitch', { hint: '&pound;' })}</div>
    <div>${field('l1_decider', 'Who says go or no-go')}</div>
  </div>
</section>
<section class="block">
  <p class="kicker">Your install plan</p>
  ${planRow('l1', 'cost per win, or maximum pitch hours')}
</section>`,

    leakHead(2, 'Scope creep', 'Every small extra feels reasonable at the time. Added together they are a project you delivered and never invoiced.') + `
<section class="block">
  <p class="kicker">Measure it</p>
  <p class="small">Last four projects: hours delivered outside the signed scope.</p>
  <table class="t">
    <thead><tr><th>Project</th><th style="width:30%">Hours outside scope</th></tr></thead>
    <tbody>
      ${[1, 2, 3, 4].map((i) => `<tr class="${i % 2 ? '' : 'shade'}"><td><div class="fld" data-field="l2_p${i}_name"></div></td><td><div class="fld" data-field="l2_p${i}_hrs"></div></td></tr>`).join('')}
      <tr class="shade"><td><b>Total hours given away</b></td><td><div class="fld" data-field="l2_hours" data-calc="l2_p1_hrs,l2_p2_hrs,l2_p3_hrs,l2_p4_hrs"></div></td></tr>
      <tr><td>Your hourly rate to clients <span class="hint">&pound;</span></td><td><div class="fld" data-field="l2_rate"></div></td></tr>
      <tr class="shade"><td><b>Value of work given away</b> <span class="hint">&pound; &middot; works itself out</span></td><td><div class="fld" data-field="l2_cost" data-calc-expr="l2_hours*l2_rate"></div></td></tr>
    </tbody>
  </table>
</section>
<section class="block">
  <p class="kicker">Install it</p>
  <h3>Scope that says what is out, and a one-page change request</h3>
  ${chkLine('l2_c1', 'Every proposal lists what is <b>not</b> included.')}
  ${chkLine('l2_c2', 'Every contract attaches a one-page change request.')}
  ${chkLine('l2_c3', 'No material extra work starts without written approval. Minor ones are logged.')}
  <div class="rule" style="margin-top:3mm"><span class="num">Change request template</span>
    ${field('l2_t_what', 'What is being asked for')}
    <div class="grid3">
      <div>${field('l2_t_hrs', 'Extra hours')}</div>
      <div>${field('l2_t_price', 'Extra price', { hint: '&pound;' })}</div>
      <div>${field('l2_t_date', 'Impact on delivery date')}</div>
    </div>
  </div>
</section>
<section class="block">
  <p class="kicker">Your install plan</p>
  ${planRow('l2', 'hours outside scope')}
</section>`,

    leakHead(3, 'Unit cost', 'A quote built on a rough cost per unit can be wrong before the first piece is made. Setup, wastage and overhead are the lines most often left out.', ' &middot; physical production only') + `
<section class="block">
  <p class="kicker">Measure it</p>
  <p class="small">Last product run. Enter costs as totals for the whole run.</p>
  ${mtable('Cost per unit, last run', [
    ['l3_quoted', 'Cost per unit you quoted', { hint: '&pound;' }],
    ['l3_rununits', 'Saleable units in the run'],
    ['l3_mat', 'Materials actually used, run total', { hint: '&pound;' }],
    ['l3_lab', 'Labour actually spent, run total', { hint: '&pound;' }],
    ['l3_setup', 'Setup and changeover, run total', { hint: '&pound;' }],
    ['l3_waste', 'Wastage and rejects, run total', { hint: '&pound;' }],
    ['l3_over', 'Fair share of overhead, run total', { hint: '&pound;' }],
    ['l3_actual', 'Actual cost per unit', { hint: '&pound; &middot; run total divided by saleable units', expr: '(l3_mat+l3_lab+l3_setup+l3_waste+l3_over)/l3_rununits', strong: true }],
    ['l3_gap', 'Gap against your quote', { hint: '&pound; per unit &middot; actual cost minus quoted cost', expr: 'l3_actual-l3_quoted', strong: true }],
    ['l3_units', 'Units you make in a year'],
    ['l3_annual', 'Under-recovered cost each year', { hint: '&pound; &middot; works itself out', expr: 'l3_gap*l3_units', strong: true }],
  ])}
</section>
<section class="block">
  <p class="kicker">Install it</p>
  <h3>One cost sheet, used for every quote</h3>
  <p>Use these lines as a template. Share overhead out on what causes it, not a flat percentage.</p>
  ${chkLine('l3_c1', 'No quote goes out without every cost line filled in.')}
  ${chkLine('l3_c2', 'After each run, actual cost is entered next to the quote.')}
</section>
<section class="block">
  <p class="kicker">Your install plan</p>
  ${planRow('l3', 'gap per unit, in pounds')}
</section>`,

    leakHead(4, 'Cash tied up', 'Margin on paper is not cash in hand. Every day stock sits on a shelf, or a client sits on an invoice, you are lending your own money.') + `
<section class="block">
  <p class="kicker">Measure it</p>
  <p class="small">Cash you have committed to delivery before you are entitled to bill. Money owed after the invoice is Leak 5. Include materials and stock where you hold them.</p>
  ${mtable('Last 12 months', [
    ['l4_cos', 'Annual delivery cost', { hint: '&pound; &middot; materials, bought-in costs and delivery labour' }],
    ['l4_stock', 'Days from committing delivery cost to issuing the invoice'],
    ['l4_recv', 'Work done and not yet invoiced today', { hint: '&pound; &middot; for reference' }],
    ['l4_pay', 'Days you take to pay your own suppliers'],
    ['l4_cycle', 'Days your own cash is committed before you can bill', { hint: 'days to invoice &minus; days you take to pay suppliers', expr: 'l4_stock-l4_pay', strong: true }],
    ['l4_cash', 'Estimated cash exposure', { hint: '&pound; &middot; works itself out', expr: 'l4_cos/365*l4_cycle', strong: true }],
  ])}
</section>
<section class="block">
  <p class="kicker">Install it</p>
  <h3>A monthly cash-cycle sheet</h3>
  <p>Fill in the three figures on the same day each month. Choose one to shorten and set a number of days.</p>
  <table class="t">
    <thead><tr><th style="width:22%">Month</th><th>Days to invoice</th><th>Unbilled work, &pound;</th><th>Days you pay suppliers</th></tr></thead>
    <tbody>
      ${[1, 2, 3].map((i) => `<tr class="${i % 2 ? '' : 'shade'}"><td><div class="fld" data-field="l4_m${i}_m"></div></td><td><div class="fld" data-field="l4_m${i}_s"></div></td><td><div class="fld" data-field="l4_m${i}_r"></div></td><td><div class="fld" data-field="l4_m${i}_p"></div></td></tr>`).join('')}
    </tbody>
  </table>
  <div class="chkrow" style="margin-top:3mm"><span>Lever I will pull first:</span> ${check('l4_lv1')}<span>Invoicing speed</span> ${check('l4_lv2')}<span>Deposits</span> ${check('l4_lv3')}<span>Payables, agreed in writing</span></div>
</section>
<section class="block">
  <p class="kicker">Your install plan</p>
  ${planRow('l4', 'days from cost to invoice')}
</section>`,

    leakHead(5, 'Late invoices', 'Work done and invoiced is still not yours until it is paid. Agreed terms and a fixed routine decide how long that takes.') + `
<section class="block">
  <p class="kicker">Measure it</p>
  ${mtable('Right now', [
    ['l5_billed', 'Total invoiced in the last 12 months', { hint: '&pound;' }],
    ['l5_over', 'Value of invoices past their terms', { hint: '&pound;' }],
    ['l5_n', 'Number of invoices past terms'],
    ['l5_days', 'Average days past terms'],
    ['l5_pct', 'Share of a year&rsquo;s billing that is overdue', { hint: '% &middot; a collection indicator, not a margin figure', expr: 'l5_over/l5_billed*100', strong: true }],
  ])}
</section>
<section class="block">
  <p class="kicker">Install it</p>
  <h3>Terms on every quote, and one chase routine</h3>
  <div class="grid3">
    <div>${field('l5_dep', 'Deposit on acceptance', { hint: '%' })}</div>
    <div>${field('l5_terms', 'Payment terms', { hint: 'days' })}</div>
    <div>${field('l5_chase', 'Fixed weekly chase day')}</div>
  </div>
  ${chkLine('l5_c1', 'Deposit or milestone payments are written on every quote. For production, the deposit covers materials.')}
  ${chkLine('l5_c2', 'Payment terms are on the quote and the invoice, in the same words.')}
  ${chkLine('l5_c3', 'One named person chases on the fixed day, using the ladder below.')}
  <p class="small">Example ladder: day 1, reminder with statement. Day 7, direct email to the client contact. Day 14, call and escalate to the commercial owner. Day 30, pause discretionary work and escalate formally. Adapt it to your contract and the client relationship.</p>
  <table class="t">
    <thead><tr><th style="width:22%">Days past terms</th><th>What happens, and who does it</th></tr></thead>
    <tbody>
      <tr><td><div class="fld" data-field="l5_s1_d"></div></td><td><div class="fld" data-field="l5_s1_a"></div></td></tr>
      <tr class="shade"><td><div class="fld" data-field="l5_s2_d"></div></td><td><div class="fld" data-field="l5_s2_a"></div></td></tr>
      <tr><td><div class="fld" data-field="l5_s3_d"></div></td><td><div class="fld" data-field="l5_s3_a"></div></td></tr>
    </tbody>
  </table>
</section>
<section class="block">
  <p class="kicker">Your install plan</p>
  ${planRow('l5', 'overdue value, or average days past terms')}
</section>`,

    leakHead(6, 'Revenue constrained by delivery capacity', 'If growth needs a matching rise in delivery hours or headcount, you scale revenue without improving leverage. Packaging one service breaks that link.') + `
<section class="block">
  <p class="kicker">Measure it</p>
  ${mtable('Last 12 months', [
    ['l6_rev', 'Revenue', { hint: '&pound;' }],
    ['l6_heads', 'People on payroll, full-time equivalent'],
    ['l6_perhead', 'Revenue per person', { hint: '&pound; &middot; works itself out', expr: 'l6_rev/l6_heads', strong: true }],
    ['l6_hourly', 'Of your last 10 jobs, how many were priced by the hour'],
    ['l6_share', 'Share of work priced by time', { hint: '% &middot; works itself out', expr: 'l6_hourly*10', strong: true }],
  ])}
</section>
<section class="block">
  <p class="kicker">Install it</p>
  <h3>One packaged service, priced per output</h3>
  ${field('l6_name', 'The service')}
  ${field('l6_scope', 'Fixed scope, in one sentence', { size: 'ml' })}
  <div class="grid3">
    <div>${field('l6_price', 'Price per output', { hint: '&pound;' })}</div>
    <div>${field('l6_hrs', 'Hours to deliver it')}</div>
    <div>${field('l6_hcost', 'Fully loaded delivery cost per hour', { hint: '&pound;' })}</div>
  </div>
  <div class="grid3">
    <div>${field('l6_bought', 'Bought-in costs per output', { hint: '&pound;' })}</div>
    <div>${field('l6_margin', 'Contribution per package', { hint: '&pound; &middot; price minus direct cost', expr: 'l6_price-l6_hrs*l6_hcost-l6_bought' })}</div>
    <div>${field('l6_mpct', 'Contribution', { hint: '% &middot; works itself out', expr: '(l6_price-l6_hrs*l6_hcost-l6_bought)/l6_price*100' })}</div>
  </div>
  ${chkLine('l6_c1', 'The steps are written down, so anyone trained can deliver it the same way.')}
</section>
<section class="block">
  <p class="kicker">Your install plan</p>
  ${planRow('l6', 'share of work sold as fixed-scope packages')}
</section>`,

    leakHead(7, 'Informal systems', 'What lives in one person&rsquo;s head works until that person is away, busy or gone. A written checklist and a named backup turn it into a system.') + `
<section class="block">
  <p class="kicker">Measure it</p>
  <p class="small">List the processes that would stop delivery if the person running them were away for two weeks.</p>
  <table class="t">
    <thead><tr><th>Process</th><th style="width:24%">Who runs it</th><th style="width:12%">Written?</th><th style="width:24%">Backup</th></tr></thead>
    <tbody>
      ${[1, 2, 3, 4].map((i) => `<tr class="${i % 2 ? '' : 'shade'}"><td><div class="fld" data-field="l7_p${i}_name"></div></td><td><div class="fld" data-field="l7_p${i}_who"></div></td><td class="c">${check(`l7_p${i}_w`)}</td><td><div class="fld" data-field="l7_p${i}_bk"></div></td></tr>`).join('')}
    </tbody>
  </table>
  <div class="grid3" style="margin-top:3mm">
    <div>${field('l7_missing', 'No written checklist')}</div>
    <div>${field('l7_nobackup', 'No named backup')}</div>
    <div>${field('l7_fail', 'Hurts most if it fails')}</div>
  </div>
</section>
<section class="block">
  <p class="kicker">Install it</p>
  <h3>A one-page checklist for each critical process</h3>
  <div class="rule"><span class="num">Checklist template</span>
    <div class="grid2">
      <div>${field('l7_t_proc', 'Process')}</div>
      <div>${field('l7_t_trig', 'Starts when')}</div>
    </div>
    ${field('l7_t_steps', 'Steps, in order', { size: 'ml' })}
    <div class="grid3">
      <div>${field('l7_t_done', 'Done when')}</div>
      <div>${field('l7_t_owner', 'Owner')}</div>
      <div>${field('l7_t_backup', 'Backup owner')}</div>
    </div>
    ${chkLine('l7_t_used', 'The backup has performed it at least once, from this checklist.')}
  </div>
</section>
<section class="block">
  <p class="kicker">Your install plan</p>
  ${planRow('l7', 'critical processes with a trained backup')}
</section>`,

    `
<section class="block">
  <p class="kicker">Beyond the seven</p>
  <h2>Outside pressure, inside systems</h2>
  <p class="lead">You cannot stop late payment or a shifting economy. You can set the rules and buffers that decide the cost.</p>
</section>
<section class="block">
  <p class="kicker">Late payment: put your rights in your terms</p>
  ${chkLine('x_c1', 'Our terms state our right to statutory interest and compensation on late payments, subject to contract, law and advice.')}
  ${chkLine('x_c2', 'The same wording is on every quote and invoice.')}
  ${chkLine('x_c3', 'We have decided the day we apply it, and who has the authority to waive it.')}
  <div class="grid3">
    <div>${field('x_apply', 'Apply it after', { hint: 'days past terms' })}</div>
    <div>${field('x_waive', 'Who can waive it')}</div>
    <div>${field('x_check', 'Date to check the current rules', { hint: 'with your accountant or solicitor' })}</div>
  </div>
</section>
<section class="block">
  <p class="kicker">Economic shifts: a buffer, a price review and a trigger plan</p>
  <table class="t">
    <thead><tr><th>Your buffers</th><th style="width:30%">Your figure</th></tr></thead>
    <tbody>
      ${mrow(0, 'x_cashbuf', 'Cash you could draw on today', { hint: '&pound;' })}
      ${mrow(1, 'x_fixed', 'Fixed costs each month', { hint: '&pound; &middot; payroll, rent, software, loans' })}
      ${mrow(2, 'x_weeks', 'Weeks of fixed costs covered', { hint: 'works itself out', expr: 'x_cashbuf/(x_fixed/4.33)', strong: true })}
      ${mrow(3, 'x_top', 'Revenue from your largest client', { hint: '&pound;' })}
      ${mrow(4, 'x_tot', 'Total revenue', { hint: '&pound;' })}
      ${mrow(5, 'x_share', 'Share of revenue from one client', { hint: '% &middot; works itself out', expr: 'x_top/x_tot*100', strong: true })}
    </tbody>
  </table>
  <div class="grid3" style="margin-top:3mm">
    <div>${field('x_buf_target', 'Buffer target', { hint: 'weeks' })}</div>
    <div>${field('x_share_cap', 'Cap on one client', { hint: '% &middot; by profit and payment record' })}</div>
    <div>${field('x_review', 'Price and cost review', { hint: 'how often, and who' })}</div>
  </div>
  ${chkLine('x_c4', 'Contracts longer than three months include a price-review clause.')}
  <div class="rule" style="margin-top:2mm"><span class="num">Trigger plan</span>
    <div class="grid2">
      <div>${field('x_t1_if', 'If this happens', { hint: 'e.g. a client cuts its budget' })}</div>
      <div>${field('x_t1_then', 'We do this', { hint: 'and who does it' })}</div>
    </div>
    <div class="grid2">
      <div>${field('x_t2_if', 'If this happens', { hint: 'e.g. supplier costs rise' })}</div>
      <div>${field('x_t2_then', 'We do this', { hint: 'and who does it' })}</div>
    </div>
  </div>
</section>`,

    `
<section class="block">
  <p class="kicker">Your map</p>
  <h2>All seven leaks in one place</h2>
  <p>Leaks 1 to 5 fill in from earlier pages in Acrobat or Edge. Elsewhere, copy the figure across.</p>
  <table class="t">
    <thead><tr><th>Leak</th><th style="width:30%">Your figure</th></tr></thead>
    <tbody>
      <tr><td><b>1. Pitching</b> <span class="hint">cost of sale, &pound; a year</span></td><td><div class="fld" data-field="s1" data-calc-expr="l1_cost"></div></td></tr>
      <tr class="shade"><td><b>2. Scope creep</b> <span class="hint">unbilled delivery, &pound;</span></td><td><div class="fld" data-field="s2" data-calc-expr="l2_cost"></div></td></tr>
      <tr><td><b>3. Unit cost</b> <span class="hint">under-recovered, &pound; a year</span></td><td><div class="fld" data-field="s3" data-calc-expr="l3_annual"></div></td></tr>
      <tr class="shade"><td><b>4. Cash tied up</b> <span class="hint">cash exposure, &pound;</span></td><td><div class="fld" data-field="s4" data-calc-expr="l4_cash"></div></td></tr>
      <tr><td><b>5. Late invoices</b> <span class="hint">overdue receivables, &pound;</span></td><td><div class="fld" data-field="s5" data-calc-expr="l5_over"></div></td></tr>
      <tr class="shade"><td><b>6. Capacity-bound revenue</b> <span class="hint">% priced by time</span></td><td><div class="fld" data-field="s6" data-calc-expr="l6_share"></div></td></tr>
      <tr><td><b>7. Informal systems</b> <span class="hint">processes with no checklist</span></td><td><div class="fld" data-field="s7" data-calc-expr="l7_missing"></div></td></tr>
      <tr class="shade"><td><b>Estimated annual profit impact</b> <span class="hint">leaks 1 to 3, indicative</span></td><td><div class="fld" data-field="s_margin" data-calc="s1,s2,s3"></div></td></tr>
    </tbody>
  </table>
  <p class="small muted">Indicative, not accounting measures. Review leaks 4 and 5 together: they can include the same invoices. Pounds, percentages and days cannot be ranked against each other.</p>
</section>
<section class="block">
  <p class="kicker">Choose three</p>
  <p>Pick the three most material: weigh impact, cash urgency and ease of fix. Install them in that order.</p>
  <div class="rule"><span class="num">Leak A</span><div class="grid3"><div>${field('top1_leak', 'Which leak')}</div><div>${field('top1_act', 'First action')}</div><div>${field('top1_date', 'Start date')}</div></div></div>
  <div class="rule"><span class="num">Leak B</span><div class="grid3"><div>${field('top2_leak', 'Which leak')}</div><div>${field('top2_act', 'First action')}</div><div>${field('top2_date', 'Start date')}</div></div></div>
  <div class="rule"><span class="num">Leak C</span><div class="grid3"><div>${field('top3_leak', 'Which leak')}</div><div>${field('top3_act', 'First action')}</div><div>${field('top3_date', 'Start date')}</div></div></div>
  ${field('recheck', 'Date to re-run these tests', { hint: '30 days from now' })}
</section>`,

    `
<section class="block">
  <p class="kicker">Where this stops</p>
  <h2>What this map does not do</h2>
  <p class="lead">It measures what you can change, and gives you a system for each, including the pressures that start outside your business. It does not tell you which fixes to do first for your team, or how to make them stick once the week gets busy.</p>
  <p>That part is sequencing: choosing the order, fitting the systems to the people who will run them, and checking they are still in use in three months. Seven leaks measured on one afternoon are a start. Closing them is the work.</p>
</section>
<section class="block">
  <p class="kicker">The fuller picture</p>
  <div class="cards c2">
    <div class="card"><p><b>A 30-minute discovery call</b> takes your three most material leaks and ranks the fixes by impact, whether or not we work together.</p></div>
  </div>
</section>
<p class="small muted">This is a management diagnostic, not accounting, tax or legal advice. Figures are indicative estimates for prioritisation. Reconcile them to your accounts and contracts before making financial or legal decisions.</p>
${cta('You have the leaks and your numbers. A discovery call puts them in the right order and fits each system to the people who will run it.')}
${sig}`,
  ],
};

// ---------------------------------------------------------------- Service-to-Product Readiness Scorecard
const scoreRows = (prefix, items) =>
  items
    .map((t, i) => `
<tr class="${i % 2 ? 'shade' : ''}">
  <td class="c" style="width:7%;font-weight:800">${i + 1}</td>
  <td>${t}</td>
  <td style="width:13%"><div class="fld" data-field="${prefix}_${i + 1}"></div></td>
</tr>`)
    .join('');

const readyPage = (n, name, lead, prefix, items, firstMove) => `
<section class="block">
  <p class="kicker">Pillar ${n} of 3</p>
  <h2>${name}</h2>
  <p class="lead">${lead}</p>
  <table class="t">
    <thead><tr><th>#</th><th>Score 0 (not true), 1 (partly true) or 2 (fully true)</th><th>Score</th></tr></thead>
    <tbody>${scoreRows(prefix, items)}</tbody>
  </table>
</section>
<section class="block">
  <div class="grid2">
    <div>${field(`${prefix}_total`, `${name} subtotal`, { hint: 'out of 8 &middot; adds up on its own in Acrobat', calc: [1, 2, 3, 4].map((i) => `${prefix}_${i}`).join(',') })}</div>
    <div>${field(`${prefix}_low`, 'The statement you scored lowest')}</div>
  </div>
</section>
<section class="block">
  ${field(`${prefix}_note`, 'What would move your lowest statement up by one point?', { size: 'xl' })}
</section>
<section class="block">
  <div class="callout"><p><b>If this pillar is your lowest, start here.</b> ${firstMove}</p></div>
</section>`;

const readiness = {
  file: 'service-to-product-readiness-scorecard.pdf',
  type: 'Readiness check',
  title: 'Service-to-Product Readiness Scorecard',
  subtitle: 'A 15-minute check on whether your business is ready to sell something you make, and not only something you do.',
  meta: ['Fillable PDF', '7 pages', '15 minutes'],
  pages: [
    `
<section class="block">
  <p class="kicker">The premise</p>
  <h2>Selling a product is a different business</h2>
  <p class="lead">A service business sells time and skill, paid as the work happens. A product business sells units you made before anyone paid for them. The costs arrive first, the cash arrives later, and the decisions come every week instead of every project.</p>
  <p>Agencies and founder-led businesses with their own production are well placed to make the move, because they already make things. What usually decides how it goes is whether the basics behind each unit are in place before the first batch is ordered. This scorecard checks twelve of them.</p>
</section>
<section class="block">
  <p class="kicker">Three pillars</p>
  <div class="cards c3">
    <div class="card"><div class="big">Production</div><p>Can you make the same unit, to the same standard, every time, and know what it took?</p></div>
    <div class="card"><div class="big">Cash and margin</div><p>Do you know what a unit really costs, and how long your money is tied up before it comes back?</p></div>
    <div class="card"><div class="big">Decision rights</div><p>Who decides on price, stock and stopping, and are those rules written down?</p></div>
  </div>
</section>
<section class="block">
  <p class="kicker">How to use it</p>
  <ol class="steps">
    <li><b>Score twelve statements</b>, four per pillar, 0, 1 or 2 (pages 2&ndash;4).</li>
    <li><b>Total your score</b> out of 24 and read where you sit (page 5).</li>
    <li><b>Plan your first 30 days</b> from the lowest pillar (page 6).</li>
  </ol>
  <p class="small muted">Answer for how the business runs today, not how you intend it to run. Type into the grey fields and save the file, or print it and write by hand.</p>
</section>`,
    readyPage(1, 'Production', 'Whether you can repeat a build and know what it took. Without this, every batch is a new experiment and every cost is a guess.', 'prod', [
      'We have a written build process that someone other than the person who designed it could follow.',
      'For each batch, we record the material, labour and wastage that actually went in.',
      'We have a pass or fail quality standard, written down, that is checked before anything ships.',
      'Production time is planned separately from client service time, so one does not eat the other.',
    ], 'Write the build process for the one product you would make first, as a checklist a new person could follow, and record real material, labour and wastage on the next three batches.'),
    readyPage(2, 'Cash and margin', 'Whether you know what a unit costs and how long your money is tied up. A product that sells well can still drain the business if the cost and the cash cycle are not known.', 'cash', [
      'We know the full cost per unit, including a fair share of overhead, not only materials.',
      'We know how many days pass between paying for materials and being paid for the finished product.',
      'Product work has its own budget, separate from the payroll funded by service fees.',
      'We take a deposit or have written payment terms on product orders, and chase on a fixed day each week.',
    ], 'Build a one-page cost sheet for one product: materials, labour, setup, wastage and overhead. Then count the days between paying suppliers and receiving payment.'),
    readyPage(3, 'Decision rights', 'Whether the rules that govern the product are written down and owned. When they are not, every price, order and stop decision waits for one person.', 'dec', [
      'We have a written pricing rule: cost plus a target margin, with a floor nobody goes below.',
      'Someone other than the owner can approve a production change or minimum order, up to a stated limit.',
      'One named person owns the product, with a monthly review of how it is performing.',
      'We have a written trigger for when we stop making a product, such as a margin or sales level.',
    ], 'Write the pricing rule and the approval limit on one page, name the product owner, and book the first monthly review in the diary.'),
    `
<section class="block">
  <p class="kicker">Your score</p>
  <h2>Where you sit</h2>
  <div class="grid2">
    <div>${field('score_total', 'Total score', { hint: 'out of 24 &middot; the three subtotals added up', calc: 'prod_total,cash_total,dec_total' })}</div>
    <div>${field('score_lowest', 'Lowest pillar', { hint: 'production, cash and margin, or decision rights' })}</div>
  </div>
</section>
<section class="block">
  <div class="stages" style="grid-template-columns:repeat(3,1fr)">
    <div class="stage"><b>0&ndash;8 &middot; Build the basics</b>Too much is still informal to sell a product safely. Fix your lowest pillar before you commit to stock, tooling or a launch.</div>
    <div class="stage"><b>9&ndash;16 &middot; Test small</b>You have part of the foundation. Run a small, controlled batch with a cost sheet and a deposit, and learn before you scale.</div>
    <div class="stage"><b>17&ndash;24 &middot; Ready to test at scale</b>The basics are in place. The risk now is growing faster than your systems, so keep the rules written as volume rises.</div>
  </div>
  <p class="small muted" style="margin-top:3mm">These bands are a working guide built from the twelve statements, not a measure against other businesses.</p>
</section>
<section class="block">
  <p class="kicker">Your first move, by pillar</p>
  <table class="t">
    <thead><tr><th style="width:26%">Lowest pillar</th><th>The first thing to put in place</th></tr></thead>
    <tbody>
      <tr><td><b>Production</b></td><td>A written build process and a batch record for one product.</td></tr>
      <tr class="shade"><td><b>Cash and margin</b></td><td>A cost sheet per unit, and the count of days your cash is tied up.</td></tr>
      <tr><td><b>Decision rights</b></td><td>A one-page pricing rule, an approval limit and a named product owner.</td></tr>
    </tbody>
  </table>
</section>
<div class="callout"><p><b>Read the pillars, not just the total.</b> A strong score in two pillars and a weak one usually fails at the weak one. Cash and margin is the one that tends to show up last, and cost the most.</p></div>`,
    `
<section class="block">
  <p class="kicker">Your next 30 days</p>
  <h2>Three steps, with names and dates</h2>
  <p class="lead">Take them from your lowest pillar and the statement you scored lowest. Three steps, not ten. If a step is really a project, write its first week instead.</p>
  <div class="grid2">
    <div>${field('plan_pillar', 'Lowest pillar')}</div>
    <div>${field('plan_statement', 'Lowest-scoring statement')}</div>
  </div>
</section>
<section class="block">
  <div class="rule"><span class="num">Step 1</span>
    ${field('step1_what', 'What changes', { size: 'ml' })}
    <div class="grid2"><div>${field('step1_owner', 'Who owns it')}</div><div>${field('step1_when', 'By when')}</div></div>
  </div>
  <div class="rule"><span class="num">Step 2</span>
    ${field('step2_what', 'What changes', { size: 'ml' })}
    <div class="grid2"><div>${field('step2_owner', 'Who owns it')}</div><div>${field('step2_when', 'By when')}</div></div>
  </div>
  <div class="rule"><span class="num">Step 3</span>
    ${field('step3_what', 'What changes', { size: 'ml' })}
    <div class="grid2"><div>${field('step3_owner', 'Who owns it')}</div><div>${field('step3_when', 'By when')}</div></div>
  </div>
</section>
`,
    `
<section class="block">
  <p class="kicker">Where this stops</p>
  <h2>What this scorecard does not do</h2>
  <p class="lead">This tells you how ready the basics are. It does not tell you which product to make, what to charge, or how to fit production around live client work. That is the next piece of work, and I do it remotely with founders making this move.</p>
</section>
<section class="block">
  <p class="kicker">The fuller picture</p>
  <div class="cards c2">
    <div class="card"><p><b>A 30-minute discovery call</b> reads your scorecard with you. I will tell you honestly what to put in place before the first batch, whether or not we work together.</p></div>
  </div>
</section>
${cta('You know where the gaps are. A discovery call shows how the move to product sits alongside the rest of the business.')}
${sig}`,
  ],
};

export const DOCS = [audit, rulebook, planner, scorecard, hire, readiness, leakmap];
