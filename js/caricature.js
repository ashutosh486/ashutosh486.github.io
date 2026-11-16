// Caricature: a plus-size developer at a laptop, as inline SVG so any theme can recolour it (--cc-* variables).
// It reads the screen (pupils scan line by line, blinks) and its expression changes as it works: focused and muttering,
// thinking, puzzled, then a small "got it" smile. Animations live in styles.css under .cc
// Behaviour (bottom of this file): eyes follow the pointer; it sips coffee, blows a bug off the lid, falls asleep when
// the visitor goes idle, gets dizzy if the pointer whips around, says hi on hover or tap, cheers a résumé download, and
// yawns under a desk lamp at night. A winch-and-basket lift on the right edge shows scroll position, and once the
// visitor scrolls past the caricature (or in themes without one) its "soul" rides in the basket.

// Round, full-cheeked face (also clips the screen glow)
const FACE = 'M120 28c28 0 42 20 42 44 0 14-4 24-12 30-8 7-19 10-30 10s-22-3-30-10c-8-6-12-16-12-30 0-24 14-44 42-44Z';
// Spiral for dizzy eyes, centred on 0,0
// Ease in and out for each leg of the coffee sip (SMIL keySplines)
const EASE = Array(7).fill('0.45 0 0.3 1').join(';');
const SPIRAL = 'M0 0a.8.8 0 0 1 1.6 0 1.6 1.6 0 0 1-3.2 0 2.4 2.4 0 0 1 4.8 0 3.2 3.2 0 0 1-6.4 0';
// Confetti for a résumé download: [x, y, spin, colour var], fixed so every copy throws the same burst
const CONFETTI = [[-46, -64, 220, 'code'], [-30, -86, -160, 'sticker'], [-12, -70, 300, 'mug'], [4, -94, -240, 'glow'],
    [18, -76, 180, 'code'], [34, -88, -320, 'sticker'], [50, -60, 260, 'mug'], [-58, -40, -200, 'glow'],
    [62, -36, 140, 'code'], [-22, -100, 360, 'mug'], [26, -104, -120, 'glow'], [-40, -92, 90, 'sticker']];
let caricatureCount = 0;

const isNight = () => {
    const hour = new Date().getHours();
    return hour >= 21 || hour < 6;
};

// head: just the head and shoulders (the lift's "soul")
function caricatureSVG(label = '', { head = false } = {}) {
    const id = `cc-${++caricatureCount}`; // clip-path ids must be unique per copy on the page
    const eye = x => `<ellipse cx="${x}" cy="75" rx="5.2" ry="4.4"/>`;
    const lid = x => `M${x - 6} 73.4C${x - 5} 69 ${x + 5} 69 ${x + 6} 73.4C${x + 2} 72.2 ${x - 2} 72.2 ${x - 6} 73.4Z`;
    const lash = x => `M${x - 6} 73.4C${x - 2} 72.2 ${x + 2} 72.2 ${x + 6} 73.4`;
    const classes = ['cc', isNight() && 'cc--night', head && 'cc--soul'].filter(Boolean).join(' ');
    return `
<svg class="${classes}" viewBox="${head ? '64 0 112 124' : '0 0 240 200'}" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>
    <defs>
        <clipPath id="${id}-eyes">${eye(106)}${eye(134)}</clipPath>
    </defs>
    <g class="cc-chair">
        <path class="cc-chair-back" d="M60 182V72C60 54 55 40 57 26 59 11 70 3 85 3h70c15 0 26 8 28 23 2 14-3 28-3 46v110Z"/>
        <path class="cc-chair-panel" d="M72 182V74c0-16-3-28-2-42 1-12 9-19 21-19h58c12 0 20 7 21 19 1 14-2 26-2 42v108Z"/>
        <path class="cc-chair-stripe" d="M94 13v169M146 13v169" fill="none" stroke-width="5"/>
        <path class="cc-chair-wing" d="M57 26c-4 18 3 36 3 50l12-2c0-16-3-28-2-42Zm126 0c4 18-3 36-3 50l-12-2c0-16 3-28 2-42Z"/>
    </g>
    <g class="cc-lamp">
        <path class="cc-lamp-light" d="M44 132 62 136 104 178H36Z"/>
        <ellipse class="cc-lamp-metal" cx="24" cy="177" rx="12" ry="3"/>
        <path class="cc-lamp-arm" d="M24 176 30 140 46 126" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="cc-lamp-metal" d="M41 118 57 121 62 137 39 130Z"/>
        <circle class="cc-lamp-bulb" cx="52" cy="132" r="3.4"/>
    </g>
    <g class="cc-code" font-family="ui-monospace, monospace" font-size="11" font-weight="700">
        <text x="20" y="124">&lt;/&gt;</text>
        <text x="190" y="106">{ }</text>
        <text x="38" y="106">01</text>
    </g>
    <g class="cc-upper-arm">
        <path class="cc-arm-shade" d="M176.0 124.0L188.8 153.3" fill="none" stroke-width="16" stroke-linecap="round"><animate class="cc-sip-anim" attributeName="d" begin="indefinite" dur="2.8s" calcMode="spline" keyTimes="0;0.2;0.3;0.42;0.66;0.76;0.86;1" keySplines="${EASE}" values="M176.0 124.0L188.8 153.3;M176.0 124.0L180.8 155.6;M176.0 124.0L181.3 155.6;M176.0 124.0L144.0 123.9;M176.0 124.0L144.0 123.9;M176.0 124.0L186.5 154.2;M176.0 124.0L182.9 155.2;M176.0 124.0L188.8 153.3"/></path>
        <path class="cc-arm" d="M176.0 124.0L188.8 153.3" fill="none" stroke-width="13" stroke-linecap="round"><animate class="cc-sip-anim" attributeName="d" begin="indefinite" dur="2.8s" calcMode="spline" keyTimes="0;0.2;0.3;0.42;0.66;0.76;0.86;1" keySplines="${EASE}" values="M176.0 124.0L188.8 153.3;M176.0 124.0L180.8 155.6;M176.0 124.0L181.3 155.6;M176.0 124.0L144.0 123.9;M176.0 124.0L144.0 123.9;M176.0 124.0L186.5 154.2;M176.0 124.0L182.9 155.2;M176.0 124.0L188.8 153.3"/></path>
    </g>
    <path class="cc-shirt" d="M38 182c0-44 18-70 56-78h52c38 8 56 34 56 78Z"/>
    <path class="cc-shirt-shade" d="M38 182c0-18 4-38 14-52 4 18 6 36 4 52Zm164 0c0-18-4-38-14-52-4 18-6 36-4 52Z"/>
    <path class="cc-collar" d="M100 104l20 15-9 8-16-17Zm40 0-20 15 9 8 16-17Z"/>
    <path class="cc-placket" d="M120 122v56" fill="none" stroke-width="1.5"/>
    <g transform="translate(120 116) scale(1.08) translate(-120 -116)">
        <g class="cc-turn"><g class="cc-head">
            <path class="cc-skin-shade" d="M96 104q24 20 48 0-3 14-24 16-21-2-24-16Z"/>
            <ellipse class="cc-skin" cx="80" cy="76" rx="7" ry="10"/>
            <ellipse class="cc-skin" cx="160" cy="76" rx="7" ry="10"/>
            <path class="cc-skin" d="${FACE}"/>
            <path class="cc-stubble" d="M88 94q32 30 64 0-2 18-32 20-30-2-32-20Z"/>
            <ellipse class="cc-blush" cx="95" cy="89" rx="7" ry="3.8"/>
            <ellipse class="cc-blush" cx="145" cy="89" rx="7" ry="3.8"/>
            <path class="cc-hair" d="M78 80C72 50 84 22 116 18c30-4 52 14 50 42-1 8-3 14-6 20-2-10-4-17-8-23l-4 8-8-11-8 9-9-10-11 8-7-9c-9 6-16 14-22 28Z"/>
            <path class="cc-hair-shine" d="M100 34c16-10 42-10 56 2-16-4-38-4-52 4Z"/>
            <g class="cc-features">
            <path class="cc-brow cc-brow-l" d="M98 65q7-3 15-.5" fill="none" stroke-width="3.6" stroke-linecap="round"/>
            <path class="cc-brow cc-brow-r" d="M127 64.5q8-2.5 15 .5" fill="none" stroke-width="3.6" stroke-linecap="round"/>
            <g class="cc-eyes">
                <g class="cc-eye-white">${eye(106)}${eye(134)}</g>
                <g clip-path="url(#${id}-eyes)">
                    <g class="cc-look"><g class="cc-pupils">
                        <circle class="cc-eye" cx="106" cy="75" r="2.7"/>
                        <circle class="cc-eye" cx="134" cy="75" r="2.7"/>
                        <circle class="cc-eye-shine" cx="107" cy="74" r="0.9"/>
                        <circle class="cc-eye-shine" cx="135" cy="74" r="0.9"/>
                    </g></g>
                    <g class="cc-spirals" fill="none" stroke-width="1" stroke-linecap="round">
                        <g transform="translate(106 75)"><path class="cc-spiral" d="${SPIRAL}"/></g>
                        <g transform="translate(134 75)"><path class="cc-spiral" d="${SPIRAL}"/></g>
                    </g>
                </g>
                <path class="cc-skin" d="${lid(106)}${lid(134)}"/>
                <path class="cc-lash" d="${lash(106)}${lash(134)}" fill="none" stroke-width="1.3" stroke-linecap="round"/>
            </g>
            <path class="cc-nose" d="M118 79q-3.5 8 1 10.5 4 1.5 5.5-1.5" fill="none" stroke-width="2" stroke-linecap="round"/>
            <g class="cc-lips" fill="none" stroke-width="2.4" stroke-linecap="round">
                <g class="cc-m cc-m-focus"><path class="cc-mumble" d="M112 97.5q8 1.4 16-.6"/></g>
                <ellipse class="cc-m cc-m-think" cx="125" cy="97.5" rx="2.4" ry="2.1"/>
                <path class="cc-m cc-m-frown" d="M112 99.5q8-3.6 16 0"/>
                <path class="cc-m cc-m-smile" d="M110 95.5q10 7 20 0"/>
                <ellipse class="cc-m cc-m-yawn" cx="120" cy="99" rx="3.8" ry="5.4"/>
            </g>
            </g>
        </g></g>
    </g>
    <g class="cc-mugset">
        <path class="cc-arm-shade" d="M188.8 153.3L218.8 164.5" fill="none" stroke-width="15" stroke-linecap="round"><animate class="cc-sip-anim" attributeName="d" begin="indefinite" dur="2.8s" calcMode="spline" keyTimes="0;0.2;0.3;0.42;0.66;0.76;0.86;1" keySplines="${EASE}" values="M188.8 153.3L218.8 164.5;M180.8 155.6L212.8 154.5;M181.3 155.6L187.9 124.3;M144.0 123.9L149.3 92.3;M144.0 123.9L149.3 92.3;M186.5 154.2L185.9 122.3;M182.9 155.2L214.8 158.5;M188.8 153.3L218.8 164.5"/></path>
        <path class="cc-arm" d="M188.8 153.3L218.8 164.5" fill="none" stroke-width="12" stroke-linecap="round"><animate class="cc-sip-anim" attributeName="d" begin="indefinite" dur="2.8s" calcMode="spline" keyTimes="0;0.2;0.3;0.42;0.66;0.76;0.86;1" keySplines="${EASE}" values="M188.8 153.3L218.8 164.5;M180.8 155.6L212.8 154.5;M181.3 155.6L187.9 124.3;M144.0 123.9L149.3 92.3;M144.0 123.9L149.3 92.3;M186.5 154.2L185.9 122.3;M182.9 155.2L214.8 158.5;M188.8 153.3L218.8 164.5"/></path>
        <circle class="cc-elbow" cx="188.8" cy="153.3" r="6.5"><animate class="cc-sip-anim" attributeName="cx" begin="indefinite" dur="2.8s" calcMode="spline" keyTimes="0;0.2;0.3;0.42;0.66;0.76;0.86;1" keySplines="${EASE}" values="188.8;180.8;181.3;144.0;144.0;186.5;182.9;188.8"/><animate class="cc-sip-anim" attributeName="cy" begin="indefinite" dur="2.8s" calcMode="spline" keyTimes="0;0.2;0.3;0.42;0.66;0.76;0.86;1" keySplines="${EASE}" values="153.3;155.6;155.6;123.9;123.9;154.2;155.2;153.3"/></circle>
        <g>
            <animateTransform class="cc-sip-anim" attributeName="transform" type="translate" begin="indefinite" dur="2.8s" calcMode="spline" keyTimes="0;0.2;0.3;0.42;0.66;0.76;0.86;1" keySplines="${EASE}"
                values="0 0;-6 -10;-30 -36;-66 -63;-66 -63;-32 -38;-4 -6;0 0"/>
            <animateTransform class="cc-sip-anim" attributeName="transform" type="rotate" additive="sum" begin="indefinite" dur="2.8s" calcMode="spline" keyTimes="0;0.2;0.3;0.42;0.66;0.76;0.86;1" keySplines="${EASE}"
                values="0 201 166;0 201 166;-14 201 166;-32 201 166;-32 201 166;-14 201 166;0 201 166;0 201 166"/>
            <path class="cc-steam" d="M196 148q-4-6 0-12t0-12m9 24q-4-6 0-12t0-12" fill="none" stroke-width="2" stroke-linecap="round"/>
            <rect class="cc-mug" x="190" y="154" width="22" height="24" rx="4"/>
            <path class="cc-mug-handle" d="M212 159h3a5.5 5.5 0 0 1 0 11h-3" fill="none" stroke-width="3"/>
            <g class="cc-grip">
                <rect class="cc-skin" x="212.5" y="157.5" width="12.5" height="14" rx="6"/>
                <ellipse class="cc-skin" cx="214.5" cy="157.5" rx="4.4" ry="2.8" transform="rotate(-20 214.5 157.5)"/>
                <path class="cc-knuckle" d="M215.5 162.5h7M215.5 166.5h7" fill="none" stroke-width="1" stroke-linecap="round"/>
            </g>
        </g>
    </g>
    <rect class="cc-desk" x="6" y="178" width="228" height="8" rx="3"/>
    <path class="cc-laptop" d="M63 114h114a7 7 0 0 1 7 7v53H56v-53a7 7 0 0 1 7-7Z"/>
    <rect class="cc-laptop-sheen" x="60" y="115.6" width="120" height="1.6" rx="0.8"/>
    <g class="cc-logo">
        <path d="M120 137.2c-1.8-1.4-5.6-1.9-7.8.6-2.8 3.2-1.9 9.4 1.3 13.1 1.5 1.7 2.8 2.4 4.1 1.9 1.1-.5 1.9-.5 3 0 1.3.5 2.6-.2 4.1-1.9 3.2-3.7 4.1-9.9 1.3-13.1-2.2-2.5-6-2-7.8-.6Z"/>
        <path d="M120.4 136.4c.3-2.5 2-4.2 4.4-4.6-.3 2.5-2 4.2-4.4 4.6Z"/>
    </g>
    <rect class="cc-sticker-b" x="68" y="156" width="16" height="9" rx="2.5" transform="rotate(-8 76 160)"/>
    <path class="cc-laptop-shade" d="M44 172h152v2.5a3.5 3.5 0 0 1-3.5 3.5h-145a3.5 3.5 0 0 1-3.5-3.5Z"/>
    <rect class="cc-laptop-notch" x="108" y="172" width="24" height="2.2" rx="1.1"/>
    <g class="cc-bug"><g class="cc-bug-body">
        <path class="cc-bug-legs" d="M-2 1.6-3.4 4M.4 2.2v2.6M2.6 1.6 4 4" fill="none" stroke-width="0.9" stroke-linecap="round"/>
        <ellipse class="cc-bug-shell" cx="0" cy="0" rx="3.6" ry="2.7"/>
        <circle class="cc-bug-head" cx="-3.6" cy="0.2" r="1.7"/>
        <path class="cc-bug-legs" d="M-0.2 -2.6V2.6" fill="none" stroke-width="0.6"/>
    </g></g>
    <g class="cc-confetti" transform="translate(120 114)">${CONFETTI.map(([x, y, r, c]) =>
        `<rect class="cc-bit" x="-1.6" y="-3" width="3.2" height="6" rx="0.8" style="--x:${x}px;--y:${y}px;--r:${r}deg;fill:var(--cc-${c})"/>`).join('')}</g>
    <ellipse class="cc-contact" cx="201" cy="178" rx="13" ry="1.8"/>
    <g class="cc-puff" fill="none" stroke-width="1.6" stroke-linecap="round">
        <path d="M129 103l6 5M131 99l7 3M127 107l4 6"/>
    </g>
    <g class="cc-hi">
        <path class="cc-hi-bubble" d="M18 20h40a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8h-4l10 9-18-9H18a8 8 0 0 1-8-8V28a8 8 0 0 1 8-8Z" stroke-width="1.5"/>
        <text class="cc-hi-text" x="38" y="40" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="700">Hi!</text>
    </g>
    <g class="cc-zzz" font-family="ui-monospace, monospace" font-weight="700">
        <text x="156" y="44" font-size="10">z</text>
        <text x="164" y="32" font-size="13">z</text>
        <text x="174" y="18" font-size="16">Z</text>
    </g>
    <text class="cc-bang" x="160" y="40" font-family="ui-monospace, monospace" font-size="20" font-weight="700">!</text>
    <g transform="translate(120 14) scale(1 0.38)"><g class="cc-orbit">
        <path class="cc-star" d="M0-34l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2Z"/>
        <path class="cc-star" d="M30 17l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2Z"/>
        <path class="cc-star" d="M-30 17l2 4.5 4.5 2-4.5 2-2 4.5-2-4.5-4.5-2 4.5-2Z"/>
    </g></g>
</svg>`;
}

// ---------- behaviour (one set of listeners for every copy on the page) ----------

const ccReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)');
const CC_ACTIONS = ['cc--sip', 'cc--bug', 'cc--yawn', 'cc--hi', 'cc--party', 'cc--dizzy', 'cc--startle'];
const ccTimers = new WeakMap();
// Exposed for tests: lastActive drives sleep, next is when the next idle action plays
const caricatureFx = { lastActive: Date.now(), next: Date.now() + 8000 };

const onScreen = svg => {
    const r = svg.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
};
const visibleCCs = () => [...document.querySelectorAll('svg.cc')].filter(onScreen);

// One action at a time per copy; a forced one (the visitor did something) replaces whatever is playing
function ccPlay(svg, action, ms, force = false) {
    const busy = CC_ACTIONS.some(a => svg.classList.contains(a));
    if (busy && !force) return;
    svg.classList.remove(...CC_ACTIONS);
    void svg.getBoundingClientRect(); // restart the CSS animation if the same action replays
    svg.classList.add(action);
    if (action === 'cc--sip') svg.querySelectorAll('.cc-sip-anim').forEach(a => a.beginElement());
    clearTimeout(ccTimers.get(svg));
    ccTimers.set(svg, setTimeout(() => svg.classList.remove(action), ms));
}

// Eyes (and a little of the head) follow the pointer. The reading animation pauses where it is rather than stopping,
// and the look is measured from that pose, so when the pointer rests (2.5s) the eyes glide back instead of jumping.
let lookFrame = 0;
let lookTimer = 0;
const ccReadPose = new WeakMap();
function lookAt(x, y) {
    document.querySelectorAll('svg.cc').forEach(svg => {
        const eyes = svg.querySelector('.cc-eye-white').getBoundingClientRect();
        if (!eyes.width) return; // copy in a hidden panel
        if (!svg.classList.contains('cc--looking')) {
            const t = getComputedStyle(svg.querySelector('.cc-pupils')).transform;
            const m = new DOMMatrixReadOnly(t === 'none' ? undefined : t);
            ccReadPose.set(svg, [m.e, m.f]);
            svg.classList.add('cc--looking');
        }
        const [rx, ry] = ccReadPose.get(svg);
        const dx = x - (eyes.left + eyes.width / 2);
        const dy = y - (eyes.top + eyes.height / 2);
        const k = Math.min(1, Math.hypot(dx, dy) / 240) / (Math.hypot(dx, dy) || 1); // full glance from ~240px away
        // Unit direction (shorter when the pointer is close); looking up is kept small so the eyes never roll back
        const tx = dx * k;
        const ty = Math.max(-0.35, dy * k);
        svg.querySelector('.cc-look').style.transform = `translate(${tx * 2.4 - rx}px, ${Math.max(-0.5, ty * 1.8) - ry}px)`;
        // The face slides further than the head outline and the head tilts: it reads as turning, not just glancing
        svg.querySelector('.cc-features').style.transform = `translate(${tx * 3}px, ${ty * 1.8}px)`;
        svg.querySelector('.cc-turn').style.transform = `translate(${tx * 2.6}px, ${ty * 1.4}px) rotate(${tx * 7}deg)`;
    });
    clearTimeout(lookTimer);
    lookTimer = setTimeout(() => document.querySelectorAll('svg.cc--looking').forEach(svg => {
        svg.classList.remove('cc--looking');
        ['.cc-look', '.cc-features', '.cc-turn'].forEach(sel => (svg.querySelector(sel).style.transform = ''));
    }), 2500);
}

// Any sign of the visitor wakes a sleeping caricature with a start
function ccWake() {
    caricatureFx.lastActive = Date.now();
    document.querySelectorAll('svg.cc--asleep').forEach(svg => {
        svg.classList.remove('cc--asleep');
        ccPlay(svg, 'cc--startle', 900, true);
    });
}

// Whipping the pointer back and forth (lots of travel, several reversals in under a second) makes it dizzy
const ccTrail = [];
let ccDizzyUntil = 0;
function ccWatchShake(e) {
    const now = performance.now();
    ccTrail.push([now, e.clientX, e.clientY]);
    while (ccTrail.length && now - ccTrail[0][0] > 800) ccTrail.shift();
    if (now < ccDizzyUntil || ccTrail.length < 6) return;
    let travel = 0;
    let turns = 0;
    for (let i = 2; i < ccTrail.length; i++) {
        const [, x0, y0] = ccTrail[i - 2];
        const [, x1, y1] = ccTrail[i - 1];
        const [, x2, y2] = ccTrail[i];
        travel += Math.hypot(x2 - x1, y2 - y1);
        if ((x1 - x0) * (x2 - x1) < 0 || (y1 - y0) * (y2 - y1) < 0) turns++;
    }
    if (travel > 2200 && turns >= 4) {
        ccDizzyUntil = now + 6000;
        ccTrail.length = 0;
        visibleCCs().forEach(svg => ccPlay(svg, 'cc--dizzy', 2600, true));
    }
}

// Idle life: every 9-16s a visible caricature sips coffee, blows a bug away, or (at night) yawns; after 40s (25s at
// night) with no sign of the visitor it falls asleep
function ccTick() {
    if (ccReduced.matches || document.hidden) return;
    const now = Date.now();
    const idle = now - caricatureFx.lastActive;
    const svgs = visibleCCs();
    if (idle > (isNight() ? 25000 : 40000)) {
        svgs.forEach(svg => svg.classList.add('cc--asleep'));
        return;
    }
    if (now < caricatureFx.next) return;
    caricatureFx.next = now + 9000 + Math.random() * 7000;
    svgs.filter(svg => !svg.classList.contains('cc--soul')).forEach(svg => {
        const pool = ['cc--sip', 'cc--sip', 'cc--bug', ...(svg.classList.contains('cc--night') ? ['cc--yawn', 'cc--yawn'] : [])];
        const action = pool[Math.floor(Math.random() * pool.length)];
        ccPlay(svg, action, { 'cc--sip': 2800, 'cc--bug': 4200, 'cc--yawn': 2400 }[action]);
    });
}

// ---------- the soul lift: a scroll indicator on the right edge; the soul rides it whenever the caricature isn't around ----------

// Copied from the theme's caricature so the soul wears the same colours
const CC_VARS = ['skin', 'skin-shade', 'hair', 'hair-shine', 'shirt', 'shirt-shade', 'collar', 'eye', 'mouth', 'blush', 'laptop',
    'laptop-shade', 'desk', 'mug', 'steam', 'code', 'sticker', 'bug', 'lamp', 'lamp-light', 'bubble', 'bubble-ink'].map(v => `--cc-${v}`);

const LIFT_SKIP = ['apple'];
const scrolls = el => /(auto|scroll|overlay)/.test(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight + 1;

const caricatureLift = {
    el: null,
    avatar: null,
    scroller: null,
    inBasket: null,
    y: 64, // basket position, eased toward target with a spring so it settles with a small bounce
    v: 0,
    target: 64,
    frame: 0,

    build() {
        this.el = document.createElement('div');
        this.el.className = 'lift';
        this.el.setAttribute('aria-hidden', 'true'); // a second scrollbar; keyboard and screen readers keep the real one
        // Winch bolted to the top edge: plate, housing with vents and a status light, a gear driving the rope drum
        this.el.innerHTML = `
            <svg class="lift-machine" viewBox="0 0 64 88">
                <rect class="lift-steel" x="0" y="-3" width="64" height="8" rx="2"/>
                <circle class="lift-bolt" cx="6" cy="1.5" r="1.4"/><circle class="lift-bolt" cx="58" cy="1.5" r="1.4"/>
                <rect class="lift-steel" x="14" y="4" width="8" height="6"/>
                <rect class="lift-steel" x="32" y="21.5" width="20" height="5" rx="2"/>
                <rect class="lift-housing" x="2" y="8" width="32" height="78" rx="4"/>
                <rect class="lift-screen" x="5" y="11" width="26" height="13" rx="2"/>
                <text class="lift-readout" x="18" y="20.5" text-anchor="middle">0%</text>
                <g class="lift-btn" data-lift="up"><rect x="5" y="27" width="26" height="17" rx="3"/><path d="M13 38.5l5-6 5 6"/></g>
                <g class="lift-btn" data-lift="down"><rect x="5" y="47" width="26" height="17" rx="3"/><path d="M13 52.5l5 6 5-6"/></g>
                <g class="lift-btn" data-lift="hide"><rect x="5" y="67" width="26" height="16" rx="3"/><path d="M14 71.5l8 7M22 71.5l-8 7"/></g>
                <g class="lift-gear"><circle class="lift-gear-teeth" cx="44" cy="40" r="6"/><circle class="lift-steel" cx="44" cy="40" r="3.8"/><circle class="lift-bolt" cx="44" cy="40" r="1.2"/></g>
                <g class="lift-drum">
                    <circle class="lift-flange" cx="50" cy="24" r="11"/>
                    <circle class="lift-coil" cx="50" cy="24" r="7.8"/>
                    <path class="lift-spoke" d="M50 16.2v15.6M42.2 24h15.6"/>
                    <circle class="lift-bolt" cx="50" cy="24" r="2.2"/>
                </g>
            </svg>
            <div class="lift-hint" role="presentation">Drag the basket to scroll<br>▲ ▼ one screen · ✕ hide the lift</div>
            <button type="button" class="lift-recall" tabindex="-1" title="Show the lift"><svg viewBox="0 0 24 16" aria-hidden="true"><path d="M6 3h12M7.5 7.5l4.5 4.5 4.5-4.5"/></svg></button>
            <div class="lift-rope"></div>
            <div class="lift-car">
                <div class="lift-hanger"></div>
                <div class="lift-soul">${caricatureSVG('', { head: true })}</div>
                <div class="lift-basket"></div>
            </div>`;
        document.body.append(this.el);
        this.car = this.el.querySelector('.lift-car');
        this.soul = this.el.querySelector('.lift-soul');
        this.readout = this.el.querySelector('.lift-readout');
        // Hidden stays hidden in this browser until the tab at the top brings it back
        this.el.classList.toggle('is-hidden', this.stored('portfolio-lift-hidden') === '1');
        const hide = (hidden) => {
            this.el.classList.toggle('is-hidden', hidden);
            this.store('portfolio-lift-hidden', hidden ? '1' : null);
        };
        this.el.querySelector('.lift-recall').addEventListener('click', () => hide(false));

        // Control panel: a screen up, a screen down, hide the lift
        this.el.querySelectorAll('[data-lift]').forEach(btn => btn.addEventListener('click', () => {
            this.hideHint();
            if (btn.dataset.lift === 'hide') return hide(true);
            this.scroller?.scrollBy({ top: (btn.dataset.lift === 'up' ? -1 : 1) * this.scroller.clientHeight * 0.85, behavior: ccReduced.matches ? 'auto' : 'smooth' });
        }));

        // Drag the basket to scroll
        this.car.addEventListener('pointerdown', (e) => {
            if (!this.scroller) return;
            e.preventDefault();
            this.car.setPointerCapture(e.pointerId);
            const grab = e.clientY - this.y;
            const move = (ev) => {
                if (!(ev.buttons & 1)) return up(); // released somewhere we didn't hear about
                const [top, bottom] = this.track();
                const max = this.scroller.scrollHeight - this.scroller.clientHeight;
                this.scroller.scrollTop = Math.min(1, Math.max(0, (ev.clientY - grab - top) / (bottom - top))) * max;
            };
            const up = () => {
                this.car.removeEventListener('pointermove', move);
                this.car.removeEventListener('lostpointercapture', up);
                this.el.classList.remove('is-dragging');
            };
            this.hideHint();
            this.el.classList.add('is-dragging');
            this.car.addEventListener('pointermove', move);
            this.car.addEventListener('lostpointercapture', up);
        });

        // Themes swap content (book chapters, Sci-Fi screens, terminal output), so look again after changes
        // (the caricature's own class changes, like eyes following the pointer, don't count)
        let queued = 0;
        const rescan = () => queued || (queued = requestAnimationFrame(() => { queued = 0; this.scan(); }));
        new MutationObserver(muts => muts.some(m => !m.target.closest?.('svg.cc')) && rescan()).observe(document.getElementById('themeContainer'), { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
        window.addEventListener('resize', rescan);
        document.getElementById('themeChooser')?.addEventListener('close', () => this.settle());
    },

    // Where the basket can travel: under the winch down to just above the theme switcher
    track() {
        const dock = document.getElementById('themeDock')?.getBoundingClientRect();
        const floor = (dock ? dock.top : innerHeight) - 14 - this.car.offsetHeight;
        const top = this.el.querySelector('.lift-machine').getBoundingClientRect().height + 4;
        return [top, Math.max(top + 40, floor)];
    },

    // First time the lift shows in this browser: say how it works (hovering the winch shows it again)
    showHint() {
        if (this.hinted || this.stored('portfolio-lift-hint')) return;
        this.hinted = true;
        this.el.classList.add('show-hint');
        this.hintTimer = setTimeout(() => this.hideHint(), 7000);
    },

    hideHint() {
        if (!this.el.classList.contains('show-hint')) return;
        clearTimeout(this.hintTimer);
        this.el.classList.remove('show-hint');
        this.store('portfolio-lift-hint', '1');
    },

    // Per-browser conveniences only; storage can be blocked
    stored(key) {
        try { return localStorage.getItem(key); } catch { return null; }
    },

    store(key, value) {
        try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* blocked: forget it */ }
    },

    // Theme switched: start over with the new theme's caricature (or none) and its scroller
    reset() {
        if (!this.el) this.build();
        this.avatar = this.scroller = null;
        this.inBasket = null;
        this.el.classList.remove('is-on', 'has-soul');
        this.settle();
    },

    // Theme openings slide bars and panels in over a few seconds without touching the DOM, so look again as they play
    settle() {
        (this.settling || []).forEach(clearTimeout);
        requestAnimationFrame(() => this.scan());
        this.settling = [1200, 3500, 6000].map(ms => setTimeout(() => this.scan(), ms));
    },

    // The scroller is the panel that scrolls the caricature, else the page if it scrolls, else the biggest scrolling panel
    scan() {
        const root = document.getElementById('themeContainer');
        const avatar = root.querySelector('svg.cc') || null;
        let scroller = null;
        for (let el = avatar?.parentElement; el && el !== root.parentElement && !scroller; el = el.parentElement) if (scrolls(el)) scroller = el;
        const page = document.scrollingElement;
        if (!scroller && page.scrollHeight > page.clientHeight + 1) scroller = page;
        if (!scroller) {
            const big = [...root.querySelectorAll('*')].filter(el => el.clientHeight > innerHeight * 0.3 && el.clientWidth > innerWidth * 0.3 && scrolls(el));
            scroller = big.sort((a, b) => b.clientHeight * b.clientWidth - a.clientHeight * a.clientWidth)[0] || page;
        }
        if (avatar !== this.avatar) {
            // The soul wears the theme's colours (on its own svg: its .cc rule would beat inherited values)
            const style = avatar && getComputedStyle(avatar);
            const soul = this.soul.querySelector('svg');
            CC_VARS.forEach(v => (style ? soul.style.setProperty(v, style.getPropertyValue(v)) : soul.style.removeProperty(v)));
        }
        this.avatar = avatar;
        this.scroller = scroller;
        this.update();
    },

    onScroll(e) {
        const box = e.target === document ? document.scrollingElement : e.target;
        if (!this.el || !(box instanceof Element) || box.closest('.lift')) return;
        // A panel that only now got long enough to scroll (chat thread, terminal output) takes over from one that can't
        if (box !== this.scroller && !scrolls(this.scroller) && box.clientHeight > innerHeight * 0.3) this.scroller = box;
        if (box === this.scroller) this.update();
    },

    update() {
        const s = this.scroller;
        if (!s) return;
        const max = s.scrollHeight - s.clientHeight;
        // A scroll indicator: one-screen pages have nothing to show, so the lift stays away
        // Contact Card is a single card with its own scroll; it doesn't get a lift
        this.el.classList.toggle('is-on', max > 24 && !LIFT_SKIP.includes(document.documentElement.dataset.theme));
        if (max > 24 && !document.getElementById('themeChooser')?.open) this.showHint();
        // The soul rides only once the visitor has scrolled past the caricature, or in themes and pages without one;
        // a caricature still further down keeps its soul, and the basket travels empty
        const view = s === document.scrollingElement ? 0 : s.getBoundingClientRect().top;
        const a = this.avatar?.isConnected ? this.avatar.getBoundingClientRect() : null;
        const present = !!a && a.width > 0;
        const inBasket = !present || a.bottom < Math.max(0, view) + 8;
        const [top, bottom] = this.track();
        const progress = max > 0 ? Math.min(1, s.scrollTop / max) : 0;
        this.target = top + progress * (bottom - top);
        const pct = `${Math.round(progress * 100)}%`;
        if (this.readout.textContent !== pct) this.readout.textContent = pct;
        if (this.inBasket === null) this.y = this.target; // first paint: no travel
        this.animate();
        if (inBasket !== this.inBasket) this.hop(inBasket, present ? a : null);
    },

    animate() {
        if (ccReduced.matches || this.el.classList.contains('is-dragging')) {
            this.y = this.target;
            this.v = 0;
            return this.paint();
        }
        if (this.frame) return;
        const step = () => {
            // Spring toward the target, a little under-damped: smooth travel and a soft bounce as it stops
            this.v = (this.v + (this.target - this.y) * 0.09) * 0.72;
            this.y += this.v;
            this.frame = Math.abs(this.target - this.y) < 0.1 && Math.abs(this.v) < 0.05 ? 0 : requestAnimationFrame(step);
            if (!this.frame) this.y = this.target;
            this.paint();
        };
        this.frame = requestAnimationFrame(step);
    },

    paint() {
        this.el.style.setProperty('--y', `${this.y.toFixed(2)}px`);
        // The drum turns as the rope pays out (radius ~12px); the gear turns the other way, twice as fast
        this.el.style.setProperty('--spin', `${(this.y * 4.8).toFixed(1)}deg`);
        this.el.style.setProperty('--swing', `${Math.max(-6, Math.min(6, this.v * -0.6)).toFixed(2)}deg`);
    },

    // The soul leaves the caricature for the basket, or climbs back into it; only animated when the visitor scrolls
    hop(inBasket, a) {
        const first = this.inBasket === null;
        this.inBasket = inBasket;
        if (inBasket) this.el.classList.add('has-soul');
        if (first || ccReduced.matches || !a || !this.el.classList.contains('is-on')) return inBasket || this.el.classList.remove('has-soul');
        const t = this.soul.getBoundingClientRect();
        const scale = Math.max(0.6, Math.min(3, (a.width * 0.45) / t.width));
        const dx = a.left + a.width * 0.5 - (t.left + t.width / 2);
        const dy = a.top + a.height * 0.3 - (t.top + t.height / 2);
        const frames = [
            { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.3 },
            { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 70}px) scale(${(scale + 1) / 2}) rotate(-12deg)`, opacity: 1, offset: 0.55 },
            { transform: 'none', opacity: 1 }
        ];
        const anim = this.soul.animate(inBasket ? frames : frames.reverse(), { duration: inBasket ? 750 : 600, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' });
        if (!inBasket) anim.finished.then(() => !this.inBasket && this.el.classList.remove('has-soul'), () => {});
    }
};

if (typeof window !== 'undefined') {
    window.caricatureSVG = caricatureSVG;
    window.caricatureLift = caricatureLift;
    window.caricatureFx = caricatureFx;
    window.addEventListener('pointermove', (e) => {
        ccWake();
        if (e.pointerType !== 'touch' && !ccReduced.matches) ccWatchShake(e);
        cancelAnimationFrame(lookFrame);
        lookFrame = requestAnimationFrame(() => lookAt(e.clientX, e.clientY));
    }, { passive: true });
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(type => window.addEventListener(type, ccWake, { passive: true, capture: true }));
    // Capture sees every scroll, including the panels themes scroll inside (and Space, arrows, Page Down)
    document.addEventListener('scroll', (e) => {
        ccWake();
        caricatureLift.onScroll(e);
    }, { passive: true, capture: true });
    document.addEventListener('click', (e) => {
        if (ccReduced.matches) return;
        if (e.target.closest?.('a[href$=".pdf"]')) visibleCCs().forEach(svg => ccPlay(svg, 'cc--party', 1900, true));
        // A tap says hi too (touch screens have no hover)
        const svg = e.target.closest?.('svg.cc');
        if (svg && !svg.closest('.lift')) ccPlay(svg, 'cc--hi', 1900, true);
    });
    setInterval(ccTick, 1000);
}
