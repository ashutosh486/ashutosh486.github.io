// Caricature: a plus-size developer typing on a laptop, as inline SVG so any theme can recolour it (--cc-* variables)
// and animate it (blink, typing arms, screen glow, coffee steam, code floating up; styles in styles.css under .cc)
// Round, full-cheeked face (also clips the screen glow)
const FACE = 'M120 28c28 0 42 20 42 44 0 14-4 24-12 30-8 7-19 10-30 10s-22-3-30-10c-8-6-12-16-12-30 0-24 14-44 42-44Z';
let caricatureCount = 0;

function caricatureSVG(label = '') {
    const face = `cc-face-${++caricatureCount}`; // clip-path ids must be unique per copy on the page
    return `
<svg class="cc" viewBox="0 0 240 200" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>
    <defs><clipPath id="${face}"><path d="${FACE}"/></clipPath></defs>
    <g class="cc-code" font-family="ui-monospace, monospace" font-size="11" font-weight="700">
        <text x="34" y="122">&lt;/&gt;</text>
        <text x="176" y="118">{ }</text>
        <text x="54" y="118">01</text>
    </g>
    <rect class="cc-desk" x="8" y="176" width="224" height="6" rx="3"/>
    <path class="cc-shirt" d="M38 180c0-42 18-68 56-76h52c38 8 56 34 56 76Z"/>
    <g class="cc-arm cc-arm-l"><path class="cc-shirt-shade" d="M38 180c0-18 4-36 14-50 4 18 6 34 4 50Z"/></g>
    <g class="cc-arm cc-arm-r"><path class="cc-shirt-shade" d="M202 180c0-18-4-36-14-50-4 18-6 34-4 50Z"/></g>
    <path class="cc-collar" d="M100 104l20 15-9 8-16-17Zm40 0-20 15 9 8 16-17Z"/>
    <path class="cc-placket" d="M120 122v56" fill="none" stroke-width="1.5"/>
    <g transform="translate(120 116) scale(1.08) translate(-120 -116)">
        <g class="cc-head">
            <path class="cc-skin-shade" d="M96 104q24 20 48 0-3 14-24 16-21-2-24-16Z"/>
            <ellipse class="cc-skin" cx="80" cy="76" rx="7" ry="10"/>
            <ellipse class="cc-skin" cx="160" cy="76" rx="7" ry="10"/>
            <path class="cc-skin" d="${FACE}"/>
            <path class="cc-stubble" d="M88 94q32 30 64 0-2 18-32 20-30-2-32-20Z"/>
            <ellipse class="cc-blush" cx="95" cy="89" rx="7" ry="3.8"/>
            <ellipse class="cc-blush" cx="145" cy="89" rx="7" ry="3.8"/>
            <path class="cc-hair" d="M78 80C72 50 84 22 116 18c30-4 52 14 50 42-1 8-3 14-6 20-2-10-4-17-8-23l-4 8-8-11-8 9-9-10-11 8-7-9c-9 6-16 14-22 28Z"/>
            <path class="cc-hair-shine" d="M100 34c16-10 42-10 56 2-16-4-38-4-52 4Z"/>
            <path class="cc-brow" d="M98 66q7-4 15-1m14 1q8-3 15 1" fill="none" stroke-width="3.6" stroke-linecap="round"/>
            <g class="cc-eyes">
                <ellipse class="cc-eye" cx="106" cy="75" rx="3.4" ry="3.9"/>
                <ellipse class="cc-eye" cx="134" cy="75" rx="3.4" ry="3.9"/>
                <circle class="cc-eye-shine" cx="107.3" cy="73.6" r="1.1"/>
                <circle class="cc-eye-shine" cx="135.3" cy="73.6" r="1.1"/>
            </g>
            <path class="cc-nose" d="M118 79q-3.5 8 1 10.5 4 1.5 5.5-1.5" fill="none" stroke-width="2" stroke-linecap="round"/>
            <path class="cc-mouth" d="M104 94q16 17 32 0-16 5-32 0Z"/>
            <path class="cc-teeth" d="M106.5 95.2q13.5 4.8 27 0l-1.2 2.7q-12.3 4-24.6 0Z"/>
            <ellipse class="cc-glow" cx="120" cy="112" rx="50" ry="34" clip-path="url(#${face})"/>
        </g>
    </g>
    <path class="cc-laptop" d="M68 122h104a6 6 0 0 1 6 6v48H62v-48a6 6 0 0 1 6-6Z"/>
    <path class="cc-logo" d="M113 145l-6 5 6 5m14-10 6 5-6 5" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="cc-sticker-a" cx="158" cy="135" r="5"/>
    <rect class="cc-sticker-b" x="74" y="158" width="16" height="9" rx="2.5" transform="rotate(-8 82 162)"/>
    <rect class="cc-laptop-shade" x="52" y="174" width="136" height="6" rx="3"/>
    <path class="cc-steam" d="M196 146q-4-6 0-12t0-12m9 24q-4-6 0-12t0-12" fill="none" stroke-width="2" stroke-linecap="round"/>
    <rect class="cc-mug" x="190" y="152" width="20" height="24" rx="4"/>
    <path class="cc-mug-handle" d="M210 157h3a5.5 5.5 0 0 1 0 11h-3" fill="none" stroke-width="3"/>
</svg>`;
}

if (typeof window !== 'undefined') {
    window.caricatureSVG = caricatureSVG;
}
