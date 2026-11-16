// Caricature: a plus-size developer at a laptop, as inline SVG so any theme can recolour it (--cc-* variables).
// It reads the screen (pupils scan line by line, blinks) and its expression changes as it works: focused and muttering,
// thinking, puzzled, then a lightbulb and a small "got it" smile. Animations live in styles.css under .cc
// Behaviour (bottom of this file): eyes follow the pointer; it sips coffee, chases a bug off the lid, falls asleep when
// the visitor goes idle, gets dizzy if the pointer whips around, waves when clicked, cheers a résumé download, and yawns
// under a desk lamp at night. When its theme scrolls it away, its "soul" rides a pulley lift down the right edge.

// Round, full-cheeked face (also clips the screen glow)
const FACE = 'M120 28c28 0 42 20 42 44 0 14-4 24-12 30-8 7-19 10-30 10s-22-3-30-10c-8-6-12-16-12-30 0-24 14-44 42-44Z';
// Spiral for dizzy eyes, centred on 0,0
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
        <clipPath id="${id}-face"><path d="${FACE}"/></clipPath>
        <clipPath id="${id}-eyes">${eye(106)}${eye(134)}</clipPath>
    </defs>
    <g class="cc-lamp">
        <path class="cc-lamp-light" d="M44 132 62 136 104 178H36Z"/>
        <ellipse class="cc-lamp-metal" cx="24" cy="177" rx="12" ry="3"/>
        <path class="cc-lamp-arm" d="M24 176 30 140 46 126" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="cc-lamp-metal" d="M41 118 57 121 62 137 39 130Z"/>
        <circle class="cc-lamp-bulb" cx="52" cy="132" r="3.4"/>
    </g>
    <g class="cc-code" font-family="ui-monospace, monospace" font-size="11" font-weight="700">
        <text x="34" y="122">&lt;/&gt;</text>
        <text x="176" y="118">{ }</text>
        <text x="54" y="118">01</text>
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
            <ellipse class="cc-glow" cx="120" cy="112" rx="50" ry="34" clip-path="url(#${id}-face)"/>
        </g></g>
    </g>
    <g class="cc-hand"><g class="cc-hand-pose">
        <rect class="cc-shirt" x="-6.5" y="4" width="13" height="22" rx="5"/>
        <rect class="cc-skin" x="-6" y="-6.5" width="12" height="12" rx="5"/>
        <rect class="cc-skin" x="-6" y="-13" width="2.7" height="9" rx="1.35"/>
        <rect class="cc-skin" x="-2.9" y="-14.5" width="2.7" height="10" rx="1.35"/>
        <rect class="cc-skin" x="0.2" y="-14" width="2.7" height="9.5" rx="1.35"/>
        <rect class="cc-skin" x="3.3" y="-12" width="2.7" height="8" rx="1.35"/>
        <rect class="cc-skin" x="-11" y="-3" width="7.5" height="3" rx="1.5" transform="rotate(-35 -4 -1.5)"/>
    </g></g>
    <rect class="cc-desk" x="6" y="178" width="228" height="8" rx="3"/>
    <path class="cc-laptop" d="M68 122h104a6 6 0 0 1 6 6v46H62v-46a6 6 0 0 1 6-6Z"/>
    <path class="cc-logo" d="M113 144l-6 5 6 5m14-10 6 5-6 5" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="cc-sticker-a" cx="158" cy="134" r="5"/>
    <rect class="cc-sticker-b" x="74" y="156" width="16" height="9" rx="2.5" transform="rotate(-8 82 160)"/>
    <rect class="cc-laptop-shade" x="52" y="172" width="136" height="6" rx="3"/>
    <g class="cc-bug"><g class="cc-bug-body">
        <path class="cc-bug-legs" d="M-2 1.6-3.4 4M.4 2.2v2.6M2.6 1.6 4 4" fill="none" stroke-width="0.9" stroke-linecap="round"/>
        <ellipse class="cc-bug-shell" cx="0" cy="0" rx="3.6" ry="2.7"/>
        <circle class="cc-bug-head" cx="-3.6" cy="0.2" r="1.7"/>
        <path class="cc-bug-legs" d="M-0.2 -2.6V2.6" fill="none" stroke-width="0.6"/>
    </g></g>
    <g class="cc-confetti" transform="translate(120 122)">${CONFETTI.map(([x, y, r, c]) =>
        `<rect class="cc-bit" x="-1.6" y="-3" width="3.2" height="6" rx="0.8" style="--x:${x}px;--y:${y}px;--r:${r}deg;fill:var(--cc-${c})"/>`).join('')}</g>
    <ellipse class="cc-contact" cx="201" cy="178" rx="13" ry="1.8"/>
    <g class="cc-mugset">
        <path class="cc-steam" d="M196 148q-4-6 0-12t0-12m9 24q-4-6 0-12t0-12" fill="none" stroke-width="2" stroke-linecap="round"/>
        <rect class="cc-mug" x="190" y="154" width="22" height="24" rx="4"/>
        <path class="cc-mug-handle" d="M212 159h3a5.5 5.5 0 0 1 0 11h-3" fill="none" stroke-width="3"/>
        <circle class="cc-skin cc-sip-hand" cx="217" cy="164.5" r="4.8"/>
    </g>
    <g class="cc-bulb">
        <path class="cc-bulb-rays" d="M166 -3v-4M178 2l3-3M154 2l-3-3M182 13h4M146 13h4" fill="none" stroke-width="2" stroke-linecap="round"/>
        <circle class="cc-bulb-glass" cx="166" cy="12" r="7"/>
        <rect class="cc-bulb-base" x="162.5" y="18" width="7" height="5" rx="1.5"/>
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
const CC_ACTIONS = ['cc--sip', 'cc--bug', 'cc--yawn', 'cc--wave', 'cc--party', 'cc--dizzy', 'cc--startle'];
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
    clearTimeout(ccTimers.get(svg));
    ccTimers.set(svg, setTimeout(() => svg.classList.remove(action), ms));
}

// Eyes (and a little of the head) follow the pointer; once it rests for 2.5s they go back to reading the screen
let lookFrame = 0;
let lookTimer = 0;
function lookAt(x, y) {
    document.querySelectorAll('svg.cc').forEach(svg => {
        const eyes = svg.querySelector('.cc-eye-white').getBoundingClientRect();
        if (!eyes.width) return; // copy in a hidden panel
        const dx = x - (eyes.left + eyes.width / 2);
        const dy = y - (eyes.top + eyes.height / 2);
        const k = Math.min(1, Math.hypot(dx, dy) / 240) / (Math.hypot(dx, dy) || 1); // full glance from ~240px away
        svg.classList.add('cc--looking');
        svg.querySelector('.cc-look').style.transform = `translate(${dx * k * 2.4}px, ${dy * k * 1.8}px)`;
        svg.querySelector('.cc-turn').style.transform = `translate(${dx * k * 2}px, ${dy * k * 1.2}px)`;
    });
    clearTimeout(lookTimer);
    lookTimer = setTimeout(() => document.querySelectorAll('svg.cc--looking').forEach(svg => {
        svg.classList.remove('cc--looking');
        svg.querySelector('.cc-look').style.transform = svg.querySelector('.cc-turn').style.transform = '';
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

// Idle life: every 9-16s a visible caricature sips coffee, chases a bug, or (at night) yawns; after 40s (25s at
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

// ---------- the soul lift: when the theme scrolls the caricature away, its soul rides a pulley down the right edge ----------

// Copied from the theme's caricature so the soul wears the same colours
const CC_VARS = ['skin', 'skin-shade', 'hair', 'hair-shine', 'shirt', 'shirt-shade', 'collar', 'eye', 'mouth', 'blush', 'laptop',
    'laptop-shade', 'desk', 'mug', 'steam', 'glow', 'code', 'sticker', 'bug', 'bulb', 'lamp', 'lamp-light'].map(v => `--cc-${v}`);

const caricatureLift = {
    el: null,
    avatar: null,
    scroller: null,
    away: false,
    lastTop: 0,

    build() {
        this.el = document.createElement('div');
        this.el.className = 'lift';
        this.el.setAttribute('aria-hidden', 'true'); // a second scrollbar; keyboard and screen readers keep the real one
        this.el.innerHTML = `
            <div class="lift-pulley"><span class="lift-wheel"></span></div>
            <div class="lift-rope"></div>
            <div class="lift-car"><div class="lift-hanger"></div><div class="lift-soul">${caricatureSVG('', { head: true })}</div><div class="lift-basket"></div></div>`;
        document.body.append(this.el);
        this.car = this.el.querySelector('.lift-car');
        this.soul = this.el.querySelector('.lift-soul');

        // Drag the basket to scroll
        this.car.addEventListener('pointerdown', (e) => {
            if (!this.scroller) return;
            e.preventDefault();
            this.car.setPointerCapture(e.pointerId);
            const grab = e.clientY - this.car.getBoundingClientRect().top;
            const move = (ev) => {
                const [top, bottom] = this.track();
                const max = this.scroller.scrollHeight - this.scroller.clientHeight;
                this.scroller.scrollTop = Math.min(1, Math.max(0, (ev.clientY - grab - top) / (bottom - top))) * max;
            };
            const up = () => {
                this.car.removeEventListener('pointermove', move);
                this.el.classList.remove('is-dragging');
            };
            this.el.classList.add('is-dragging');
            this.car.addEventListener('pointermove', move);
            this.car.addEventListener('pointerup', up, { once: true });
            this.car.addEventListener('pointercancel', up, { once: true });
        });
    },

    // Where the basket can travel: under the pulley down to just above the theme switcher
    track() {
        const dock = document.getElementById('themeDock')?.getBoundingClientRect();
        const floor = (dock ? dock.top : innerHeight) - 12 - this.car.offsetHeight;
        return [56, Math.max(80, floor)];
    },

    // Theme switched: the new theme has its own caricature (or none)
    reset() {
        this.avatar = this.scroller = null;
        this.away = false;
        this.el?.classList.remove('is-on');
    },

    onScroll(e) {
        const box = e.target === document ? document.scrollingElement : e.target;
        if (!(box instanceof Element) || box.closest('.lift')) return;
        if (box !== this.scroller) {
            const avatar = box.querySelector('svg.cc:not(.cc--soul)');
            if (!avatar) return;
            if (!this.el) this.build();
            this.scroller = box;
            this.avatar = avatar;
            const style = getComputedStyle(avatar);
            // On the soul's own svg: its .cc rule would override values inherited from the wrapper
            const soul = this.soul.querySelector('svg');
            CC_VARS.forEach(v => soul.style.setProperty(v, style.getPropertyValue(v)));
        }
        this.update();
    },

    update() {
        const s = this.scroller;
        const a = this.avatar.getBoundingClientRect();
        if (!a.width || !this.avatar.isConnected) return;
        const view = s === document.scrollingElement ? 0 : s.getBoundingClientRect().top;
        const away = a.bottom < view + 8; // scrolled up past the top, not merely below the fold
        const max = s.scrollHeight - s.clientHeight;
        const [top, bottom] = this.track();
        const y = top + (max > 0 ? s.scrollTop / max : 0) * (bottom - top);
        this.el.style.setProperty('--y', `${y}px`);
        this.el.style.setProperty('--spin', `${s.scrollTop * 0.8}deg`);
        this.el.dataset.spin = Math.floor(s.scrollTop / 24) % 4;
        // The basket swings with the scroll speed and settles once it stops
        if (!ccReduced.matches) {
            this.el.style.setProperty('--swing', `${Math.max(-9, Math.min(9, (s.scrollTop - this.lastTop) * -0.25))}deg`);
            clearTimeout(this.settle);
            this.settle = setTimeout(() => this.el.style.setProperty('--swing', '0deg'), 120);
        }
        this.lastTop = s.scrollTop;
        if (away !== this.away) this.hop(away, a);
    },

    // The soul leaves the caricature and lands in the basket, or climbs back out
    hop(away, a) {
        this.away = away;
        if (away) this.el.classList.add('is-on');
        if (ccReduced.matches) return away || this.el.classList.remove('is-on');
        const t = this.soul.getBoundingClientRect();
        const scale = Math.max(0.6, Math.min(3, (a.width * 0.45) / t.width));
        const dx = a.left + a.width * 0.5 - (t.left + t.width / 2);
        const dy = a.top + a.height * 0.3 - (t.top + t.height / 2);
        const frames = [
            { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0.3 },
            { transform: `translate(${dx * 0.4}px, ${dy * 0.4 - 70}px) scale(${(scale + 1) / 2}) rotate(-12deg)`, opacity: 1, offset: 0.55 },
            { transform: 'none', opacity: 1 }
        ];
        const anim = this.soul.animate(away ? frames : frames.reverse(), { duration: away ? 750 : 600, easing: 'cubic-bezier(0.3, 0.7, 0.4, 1)' });
        if (away) {
            anim.finished.then(() => this.car.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(6px)' }, { transform: 'translateY(0)' }], { duration: 300, easing: 'ease-out' }), () => {});
        } else {
            anim.finished.then(() => !this.away && this.el.classList.remove('is-on'), () => {});
        }
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
    // Capture sees every scroll, including the panels themes scroll inside
    document.addEventListener('scroll', (e) => {
        ccWake();
        caricatureLift.onScroll(e);
    }, { passive: true, capture: true });
    document.addEventListener('click', (e) => {
        if (ccReduced.matches) return;
        if (e.target.closest?.('a[href$=".pdf"]')) visibleCCs().forEach(svg => ccPlay(svg, 'cc--party', 1900, true));
        const svg = e.target.closest?.('svg.cc');
        if (svg && !svg.closest('.lift')) ccPlay(svg, 'cc--wave', 1900, true);
    });
    setInterval(ccTick, 1000);
}
