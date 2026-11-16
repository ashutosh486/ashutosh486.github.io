# Generates the SMIL frames for the caricature's coffee arm (js/caricature.js, .cc-sip-anim): python3 scripts/caricature-arm-ik.py
# Two-bone IK for the coffee arm: fixed shoulder, equal fixed bone lengths, elbow always on the lower side
import math
S = (176.0, 124.0)      # shoulder, inside the torso
L = 32.0                # upper arm = forearm
MUG = (201.0, 166.0)    # mug centre (rotation pivot)
GRIP = (218.75, 164.5)  # hand centre on the handle, mug at rest
CUFF = 8.0              # the drawn sleeve stops this far short of the hand centre, so no sleeve shows around the fist
# keyTime: (translate x, y, rotate deg) of the mug
KEYS = [(0, 0, 0, 0), (0.2, -6, -10, 0), (0.3, -30, -36, -14), (0.42, -66, -63, -32), (0.66, -66, -63, -32),
        (0.76, -32, -38, -14), (0.86, -4, -6, 0), (1, 0, 0, 0)]

def hand(tx, ty, deg):
    a = math.radians(deg)
    x, y = GRIP[0] - MUG[0], GRIP[1] - MUG[1]
    return (MUG[0] + x * math.cos(a) - y * math.sin(a) + tx, MUG[1] + x * math.sin(a) + y * math.cos(a) + ty)

def elbow(h):
    dx, dy = h[0] - S[0], h[1] - S[1]
    d = math.hypot(dx, dy)
    assert d < 2 * L, f'out of reach: {d:.1f}'
    ux, uy = dx / d, dy / d
    m = (S[0] + dx / 2, S[1] + dy / 2)
    off = math.sqrt(L * L - (d / 2) ** 2)
    px, py = -uy, ux
    if py < 0: px, py = -px, -py   # elbow below the shoulder-hand line
    return (m[0] + px * off, m[1] + py * off)

f = lambda p: f'{p[0]:.1f} {p[1]:.1f}'
upper, fore, ex, ey = [], [], [], []
for t, tx, ty, deg in KEYS:
    h = hand(tx, ty, deg); e = elbow(h)
    # check: both bones keep length
    assert abs(math.dist(S, e) - L) < 0.01 and abs(math.dist(e, h) - L) < 0.01
    tip = (h[0] - (h[0] - e[0]) * CUFF / L, h[1] - (h[1] - e[1]) * CUFF / L)
    upper.append(f'M{f(S)}L{f(e)}'); fore.append(f'M{f(e)}L{f(tip)}'); ex.append(f'{e[0]:.1f}'); ey.append(f'{e[1]:.1f}')
    print(t, 'hand', f(h), 'elbow', f(e))
import json
print(json.dumps({'keyTimes': ';'.join(str(k[0]) for k in KEYS), 'upper': ';'.join(upper), 'fore': ';'.join(fore), 'ex': ';'.join(ex), 'ey': ';'.join(ey), 'tr': ';'.join(f'{k[1]} {k[2]}' for k in KEYS), 'rot': ';'.join(f'{k[3]} 201 166' for k in KEYS)}, indent=1))
