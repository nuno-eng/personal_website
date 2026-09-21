// Content for the free-resource PDFs. Each page is an HTML string that must fit one
// A4 page (the build fails if a page overflows). Field names must be unique per document.

const VOS = 'https://vos.nabiaedge.com/trial';
const BOOK = 'https://www.nunofontoura.com/book/';

const field = (name, label, { size = '', hint = '' } = {}) =>
  `${label ? `<span class="label">${label}${hint ? ` <span class="hint">${hint}</span>` : ''}</span>` : ''}<div class="fld ${size}" data-field="${name}"${size ? ' data-ml' : ''}></div>`;
const check = (name) => `<span class="chk" data-check="${name}"></span>`;

const cta = (lead) => `
<div class="cta">
  <h2>Want to install this properly?</h2>
  <p>${lead}</p>
  <div class="btns"><a class="primary" href="${VOS}">Take the free VOS assessment</a><a class="secondary" href="${BOOK}">Book a discovery call</a></div>
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
  <p class="kicker">What the research says</p>
  <div class="cards c3">
    <div class="card"><div class="big">62.5 h</div><p>average working week for the CEOs studied, with 72% of their time in meetings.</p><div class="src">Harvard Business Review</div></div>
    <div class="card"><div class="big">36%</div><p>of CEO time spent in reactive mode, handling issues as they unfold.</p><div class="src">Harvard Business Review</div></div>
    <div class="card"><div class="big">61%</div><p>of executives say at least half the time spent on decisions is ineffective.</p><div class="src">McKinsey &amp; Company</div></div>
  </div>
</section>
<div class="callout"><p><b>A significant share of that time is decisions and approvals that should never reach your desk.</b> This audit finds them in three steps: track, question, then write the rule.</p></div>
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
${cta('The audit covers one area. The free VOS assessment scores all nine areas of a founder-led agency, so you can see where the next bottleneck is before it costs you.')}
<p class="small muted">Sources: Harvard Business Review (CEO time use research); McKinsey &amp; Company (decision-making survey). Statistics are cited as reported.</p>
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
<div class="callout"><p>This is the same discipline VOS tracks under <b>Operations &amp; Delivery</b>: whether someone new could run your core process from written instructions alone. A decision rule applies that discipline to judgement calls instead of tasks.</p></div>
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
<div class="callout"><p>This is the same governance cadence VOS installs and tracks as one of its core deliverables, with the first cycle actually run, not just scheduled.</p></div>
${cta('Build your cadence with support: the free VOS assessment shows which areas of your business most need a regular review.')}
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
${cta('This preview shows what VOS measures. The free assessment tells you where your business actually sits, with your Business Health score and band at the end.')}
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
  <h2>${name} &mdash; ${word}</h2>
  <p class="lead">${lead}</p>
  <table class="t">
    <thead><tr><th>#</th><th>Rate each 1 (not true at all) to 5 (completely true)</th><th>Score</th></tr></thead>
    <tbody>${rateRows(prefix, items)}</tbody>
  </table>
</section>
<section class="block">
  <div class="grid2">
    <div>${field(`${prefix}_total`, `${word.charAt(0).toUpperCase()}${word.slice(1)} subtotal`, { hint: 'out of 20' })}</div>
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
  <p class="lead">Most agency founders hire when the pressure gets too high. The relief lasts about a month. Then the same decisions queue up behind a bigger team, the same approvals wait on you, and the pressure comes back with a salary attached.</p>
  <p>Sometimes you genuinely need another pair of hands. Often you need the business to stop depending on you being in the room. This check tells you which one you are looking at, before you post the job.</p>
</section>
<section class="block">
  <p class="kicker">What this is built on</p>
  <h3>The Vessel Operating System</h3>
  <p>Every business floats on three pillars. VOS looks at each one separately, because a business can be strong in one and weak in another at the same time, and that gap is usually where the risk hides.</p>
  <div class="cards c3">
    <div class="card"><div class="big">Strategy</div><p><b>The Bridge.</b> Where the business is steered from: direction, ownership of decisions, and the plan people are actually rowing towards.</p></div>
    <div class="card"><div class="big">Systems</div><p><b>The Hull.</b> What keeps you watertight: margin, numbers you trust, and delivery that holds without you.</p></div>
    <div class="card"><div class="big">Product</div><p><b>The Cargo Hold.</b> What you carry to market: how work arrives, what you sell, and the clients who come back.</p></div>
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
    pillarPage(1, 'The Bridge', 'strategy', 'Direction, ownership and the plan. A weak Bridge means people work hard in different directions, and a new hire inherits the confusion.', 'bridge', [
      'My team knows which decisions they can make without me, and which have to come to me.',
      'If I were away for two weeks, work would keep moving to the same standard.',
      'We have a written plan for this quarter that we actually review.',
      'Anyone here could say in one sentence what we are best at and who we do it for.',
    ]),
    pillarPage(2, 'The Hull', 'systems', 'Margin, numbers and delivery. A weak Hull means a new salary lands on a business that cannot yet see what it earns or what it can take on.', 'hull', [
      'I know what we make on each service line, not just total revenue.',
      'The numbers I steer by come from one source everyone trusts.',
      'Delivery runs on a written process, not on me being in the room.',
      'I can see this week how much capacity the team actually has.',
    ]),
    pillarPage(3, 'The Cargo Hold', 'product', 'Demand, offer and retention. A weak Cargo Hold means you hire for work you hope will arrive, rather than work you can see coming.', 'cargo', [
      'New work comes from more than one predictable source, not only referrals.',
      'I know roughly what it costs to win a client and what one is worth to us.',
      'Our offer changes on purpose, not because a client asked.',
      'Something we do actively brings clients back. Retention is not luck.',
    ]),
    `
<section class="block">
  <p class="kicker">Your score</p>
  <h2>What the number means</h2>
  <div class="grid2">
    <div>${field('score_total', 'Total score', { hint: 'out of 60' })}</div>
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
  <p>Before you post the job, fill this in with your own numbers. Not the salary you have in your head: the whole cost of the first year.</p>
  <table class="t">
    <thead><tr><th>Cost</th><th>Your figure</th></tr></thead>
    <tbody>
      <tr><td>Salary</td><td style="width:34%"><div class="fld" data-field="cost_salary"></div></td></tr>
      <tr class="shade"><td>Employer National Insurance and pension</td><td><div class="fld" data-field="cost_oncost"></div></td></tr>
      <tr><td>Recruitment fee, or your time to hire</td><td><div class="fld" data-field="cost_recruit"></div></td></tr>
      <tr class="shade"><td>Laptop, software, desk</td><td><div class="fld" data-field="cost_kit"></div></td></tr>
      <tr><td>Your hours onboarding them, at what your hour is worth</td><td><div class="fld" data-field="cost_onboard"></div></td></tr>
      <tr class="shade"><td>Your hours managing them each week, for the first six months</td><td><div class="fld" data-field="cost_manage"></div></td></tr>
      <tr><td><b>First-year total</b></td><td><div class="fld" data-field="cost_total"></div></td></tr>
    </tbody>
  </table>
</section>
<div class="callout"><p>Now put that number next to your score. Under 30, it is the price of hiring into a structure that is not ready for the person.</p></div>`,
    `
<section class="block">
  <p class="kicker">Before you hire, or before they start</p>
  <h2>Your three next steps</h2>
  <p>Three things, not ten. Each one needs a name and a date, or it will not happen.</p>
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
  <p class="lead">This tells you whether you are ready to hire, and what it is likely to cost if you are not. It does not tell you where the business is actually stuck, or in what order to fix things.</p>
  <p>That is a different piece of work: finding the one constraint holding everything else back, and sequencing the fixes so they hold under pressure. Twelve statements cannot do that, and any tool that claims to is selling you something.</p>
</section>
<section class="block">
  <p class="kicker">The fuller picture</p>
  <div class="cards c2">
    <div class="card"><p><b>The free VOS assessment</b> scores nine areas across the three pillars, from 0 to 100, and names the area to look at first.</p></div>
    <div class="card"><p><b>A 30-minute discovery call</b> reads your answers with you. I will tell you honestly whether hiring is the right next move, whether or not we work together.</p></div>
  </div>
</section>
${cta('You have the symptoms. The free VOS assessment turns them into a Business Health score across all nine areas, so you know what to fix before you add anyone.')}
${sig}`,
  ],
};

export const DOCS = [audit, rulebook, planner, scorecard, hire];
