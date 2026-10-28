// Caricature: a plus-size developer at a laptop, as inline SVG so any theme can recolour it (--cc-* variables).
// It reads the screen (pupils scan line by line, blinks) and its expression changes as it works: focused and muttering,
// thinking, puzzled, then a small "got it" smile. Animations live in styles.css under .cc

// Round, full-cheeked face (also clips the screen glow)
const FACE = 'M120 28c28 0 42 20 42 44 0 14-4 24-12 30-8 7-19 10-30 10s-22-3-30-10c-8-6-12-16-12-30 0-24 14-44 42-44Z';
let caricatureCount = 0;

function caricatureSVG(label = '') {
    const id = `cc-${++caricatureCount}`; // clip-path ids must be unique per copy on the page
    const eye = x => `<ellipse cx="${x}" cy="75" rx="5.2" ry="4.4"/>`;
    const lid = x => `M${x - 6} 73.4C${x - 5} 69 ${x + 5} 69 ${x + 6} 73.4C${x + 2} 72.2 ${x - 2} 72.2 ${x - 6} 73.4Z`;
    const lash = x => `M${x - 6} 73.4C${x - 2} 72.2 ${x + 2} 72.2 ${x + 6} 73.4`;
    return `
<svg class="cc" viewBox="0 0 240 200" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>
    <defs>
        <clipPath id="${id}-face"><path d="${FACE}"/></clipPath>
        <clipPath id="${id}-eyes">${eye(106)}${eye(134)}</clipPath>
    </defs>
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
            <path class="cc-brow cc-brow-l" d="M98 65q7-3 15-.5" fill="none" stroke-width="3.6" stroke-linecap="round"/>
            <path class="cc-brow cc-brow-r" d="M127 64.5q8-2.5 15 .5" fill="none" stroke-width="3.6" stroke-linecap="round"/>
            <g class="cc-eyes">
                <g class="cc-eye-white">${eye(106)}${eye(134)}</g>
                <g clip-path="url(#${id}-eyes)">
                    <g class="cc-pupils">
                        <circle class="cc-eye" cx="106" cy="75" r="2.7"/>
                        <circle class="cc-eye" cx="134" cy="75" r="2.7"/>
                        <circle class="cc-eye-shine" cx="107" cy="74" r="0.9"/>
                        <circle class="cc-eye-shine" cx="135" cy="74" r="0.9"/>
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
            </g>
            <ellipse class="cc-glow" cx="120" cy="112" rx="50" ry="34" clip-path="url(#${id}-face)"/>
        </g>
    </g>
    <rect class="cc-desk" x="6" y="178" width="228" height="8" rx="3"/>
    <path class="cc-laptop" d="M68 122h104a6 6 0 0 1 6 6v46H62v-46a6 6 0 0 1 6-6Z"/>
    <path class="cc-logo" d="M113 144l-6 5 6 5m14-10 6 5-6 5" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    <circle class="cc-sticker-a" cx="158" cy="134" r="5"/>
    <rect class="cc-sticker-b" x="74" y="156" width="16" height="9" rx="2.5" transform="rotate(-8 82 160)"/>
    <rect class="cc-laptop-shade" x="52" y="172" width="136" height="6" rx="3"/>
    <ellipse class="cc-contact" cx="201" cy="178" rx="13" ry="1.8"/>
    <path class="cc-steam" d="M196 148q-4-6 0-12t0-12m9 24q-4-6 0-12t0-12" fill="none" stroke-width="2" stroke-linecap="round"/>
    <rect class="cc-mug" x="190" y="154" width="22" height="24" rx="4"/>
    <path class="cc-mug-handle" d="M212 159h3a5.5 5.5 0 0 1 0 11h-3" fill="none" stroke-width="3"/>
</svg>`;
}

if (typeof window !== 'undefined') {
    window.caricatureSVG = caricatureSVG;
}
