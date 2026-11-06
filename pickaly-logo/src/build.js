// Pickaly logo generator — every shape is a filled path (no strokes, no transforms, no text).
const fs = require("fs");
const f = n => +n.toFixed(2);
const C = { red: "#E23A4E", green: "#1E9E6A", ink: "#1B1B23", cream: "#FFF4EC", white: "#FFFFFF" };

// ---- transform helpers (uniform scale + translate) ----
const mk = (s = 1, tx = 0, ty = 0) => ({ s, tx, ty, p: (x, y) => `${f(x * s + tx)} ${f(y * s + ty)}`, r: r => f(r * s) });

// ---- primitives -> path data ----
const circle = (t, cx, cy, r) => `M${t.p(cx - r, cy)}A${t.r(r)} ${t.r(r)} 0 1 0 ${t.p(cx + r, cy)}A${t.r(r)} ${t.r(r)} 0 1 0 ${t.p(cx - r, cy)}Z`;
const ring = (t, cx, cy, ro, ri) => circle(t, cx, cy, ro) + `M${t.p(cx - ri, cy)}A${t.r(ri)} ${t.r(ri)} 0 1 1 ${t.p(cx + ri, cy)}A${t.r(ri)} ${t.r(ri)} 0 1 1 ${t.p(cx - ri, cy)}Z`;
function seg(t, ax, ay, bx, by, w) { // line with round caps
  const L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L, h = w / 2, nx = -uy * h, ny = ux * h;
  return `M${t.p(ax + nx, ay + ny)}L${t.p(bx + nx, by + ny)}A${t.r(h)} ${t.r(h)} 0 0 0 ${t.p(bx - nx, by - ny)}L${t.p(ax - nx, ay - ny)}A${t.r(h)} ${t.r(h)} 0 0 0 ${t.p(ax + nx, ay + ny)}Z`;
}
function quadStroke(t, P0, Cp, P2, w) { // quadratic curve outlined by offsetting the control polygon
  const h = w / 2;
  const unit = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]); return [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; };
  const u1 = unit(P0, Cp), u2 = unit(Cp, P2);
  const side = k => {
    const n1 = [-u1[1] * h * k, u1[0] * h * k], n2 = [-u2[1] * h * k, u2[0] * h * k];
    const A = [P0[0] + n1[0], P0[1] + n1[1]], B = [P2[0] + n2[0], P2[1] + n2[1]];
    // intersect A + s*u1 and B + q*u2
    const det = u1[0] * -u2[1] - u1[1] * -u2[0];
    const s = ((B[0] - A[0]) * -u2[1] - (B[1] - A[1]) * -u2[0]) / det;
    return [A, [A[0] + s * u1[0], A[1] + s * u1[1]], B];
  };
  const [a1, c1, b1] = side(1), [a2, c2, b2] = side(-1);
  return `M${t.p(...a1)}Q${t.p(...c1)} ${t.p(...b1)}A${t.r(h)} ${t.r(h)} 0 0 0 ${t.p(...b2)}Q${t.p(...c2)} ${t.p(...a2)}A${t.r(h)} ${t.r(h)} 0 0 0 ${t.p(...a1)}Z`;
}
const almond = (t, ax, ay, bx, by, r) => `M${t.p(ax, ay)}A${t.r(r)} ${t.r(r)} 0 0 1 ${t.p(bx, by)}A${t.r(r)} ${t.r(r)} 0 0 1 ${t.p(ax, ay)}Z`;
function arcBand(t, cx, cy, r, w, a0, a1) { // c-shaped band, long way round through the left, round caps
  const h = w / 2, ro = r + h, ri = r - h, P = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  const A0 = a0 * Math.PI / 180, A1 = a1 * Math.PI / 180;
  return `M${t.p(...P(ro, A0))}A${t.r(ro)} ${t.r(ro)} 0 1 0 ${t.p(...P(ro, A1))}A${t.r(h)} ${t.r(h)} 0 0 0 ${t.p(...P(ri, A1))}A${t.r(ri)} ${t.r(ri)} 0 1 1 ${t.p(...P(ri, A0))}A${t.r(h)} ${t.r(h)} 0 0 0 ${t.p(...P(ro, A0))}Z`;
}

// ---- the cherry (256 grid). Leaf + stem draw the check; the fruit is the cherry ----
const CHERRY = {
  main:  { fruit: [96, 182, 48], leaf: [95, 134, 30, 86, 52], stem: [[96, 134], [136, 72], [214, 30], 17] },
  small: { fruit: [98, 184, 54], leaf: [96, 132, 24, 78, 58], stem: [[98, 134], [138, 76], [212, 34], 28] },
};
const BBOX = { main: [30, 21.5, 222.5, 230], small: [24, 20, 226, 238] };
function cherry(t, v = "main") {
  const g = CHERRY[v];
  return {
    fruit: circle(t, ...g.fruit),
    leaf: almond(t, ...g.leaf),
    stem: quadStroke(t, ...g.stem),
  };
}
// ---- wordmark (532 x 256 grid, x-height 90-170, ascender 50, descender 210, stroke 18) ----
function wordmark(t) {
  const w = 18, d = [];
  d.push(ring(t, 40, 130, 40, 22), seg(t, 9, 130, 9, 201, w));            // p
  d.push(seg(t, 111, 99, 111, 161, w));                                   // i stem
  d.push(arcBand(t, 182, 130, 31, w, -50, 50));                            // c
  d.push(seg(t, 242, 59, 242, 161, w), seg(t, 278, 99, 242, 135, w), seg(t, 257, 121, 280, 161, w)); // k
  d.push(ring(t, 351, 130, 40, 22), seg(t, 382, 99, 382, 161, w));        // a
  d.push(seg(t, 422, 59, 422, 161, w));                                   // l
  d.push(seg(t, 460, 99, 490, 163, w), seg(t, 520, 99, 472, 201, w));     // y
  return { body: d, dot: circle(t, 111, 62, 12) };
}

// ---- palettes ----
const PAL = {
  color:  { fruit: C.red, leaf: C.green, word: C.ink, dot: C.red },
  dark:   { fruit: C.red, leaf: C.green, word: C.white, dot: C.red },
  black:  { fruit: "#000", leaf: "#000", word: "#000", dot: "#000" },
  white:  { fruit: C.white, leaf: C.white, word: C.white, dot: C.white },
  red:    { fruit: C.red, leaf: C.red, word: C.red, dot: C.red },
};
const svg = (vb, title, inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><title>${title}</title>${inner}</svg>\n`;
const P = (fill, ds) => ds.map(d => `<path fill="${fill}" d="${d}"/>`).join("");
const cherryPaths = (t, pal, v) => { const c = cherry(t, v); return P(pal.fruit, [c.fruit]) + P(pal.leaf, [c.leaf, c.stem]); };
const wordPaths = (t, pal) => { const w = wordmark(t); return P(pal.word, w.body) + P(pal.dot, [w.dot]); };

const out = "masters"; fs.mkdirSync(out, { recursive: true });
const write = (n, s) => fs.writeFileSync(`${out}/${n}.svg`, s);
for (const [k, pal] of Object.entries(PAL)) {
  const sfx = k === "color" ? "" : "-" + k;
  // symbol
  write(`pickaly-symbol${sfx}`, svg("0 0 256 256", "Pickaly", cherryPaths(mk(), pal, "main")));
  write(`pickaly-symbol-small${sfx}`, svg("0 0 256 256", "Pickaly", cherryPaths(mk(), pal, "small")));
  // wordmark (tight: x -4..534 incl. round caps; y 50..210 -> canvas 0..256 kept)
  write(`pickaly-wordmark${sfx}`, svg("-4 0 540 256", "Pickaly", wordPaths(mk(), pal)));
  // horizontal lockup: symbol height 172 (= ascender..descender + overshoot), gap = 52
  { const [x0, y0, x1, y1] = BBOX.main, s = 172 / (y1 - y0), ts = mk(s, -x0 * s, 44 - y0 * s);
    const sw = (x1 - x0) * s, gap = 52, tw = mk(1, sw + gap + 9, 0);
    write(`pickaly-horizontal${sfx}`, svg(`-4 0 ${f(sw + gap + 9 + 534 + 8)} 256`, "Pickaly", cherryPaths(ts, pal, "main") + wordPaths(tw, pal))); }
  // stacked lockup
  { const [x0, y0, x1, y1] = BBOX.main, W = 540, s = 1, sw = (x1 - x0);
    const ts = mk(s, (W - sw) / 2 - x0 - 4, 24 - y0), tw = mk(1, 0, 24 + (y1 - y0) + 10);
    write(`pickaly-stacked${sfx}`, svg(`-4 0 ${W} ${f(24 + (y1 - y0) + 10 + 230)}`, "Pickaly", cherryPaths(ts, pal, "main") + wordPaths(tw, pal))); }
}
// app icon / tile artwork: white cherry on red tile + colour cherry on cream tile
const tile = (bg, pal, v) => { const t = mk(0.76, 128 - 0.76 * 125, 128 - 0.76 * 129 - 3);
  return svg("0 0 256 256", "Pickaly app icon", `<rect width="256" height="256" rx="56" fill="${bg}"/>` + cherryPaths(t, pal, v)); };
write("pickaly-app-icon", tile(C.red, PAL.white, "small"));
write("pickaly-app-icon-cream", tile(C.cream, PAL.color, "small"));
console.log("ok", fs.readdirSync(out).length, "files");
