// Pickaly design token derleyicisi.
//
// Kaynak: tokens/*.json (W3C DTCG biçimi, TECH_STACK.md §8.1).
// Çıktılar (ELLE DÜZENLENMEZ):
//   src/styles/tokens.css  → CSS değişkenleri + Tailwind v4 @theme eşlemesi
//   src/styles/tokens.ts   → çözümlenmiş değerler (manifest, viewport gibi CSS dışı kullanımlar için)
//
// Kullanım:
//   node scripts/build-tokens.mjs          # dosyaları üretir
//   node scripts/build-tokens.mjs --check  # üretilen dosyalar güncel değilse hata verir (CI)
//
// Not: TECH_STACK.md §1.2 Style Dictionary öneriyor. İlk aşamada tek hedef (web/CSS) olduğu için
// bağımlılıksız bu betik kullanılıyor; ikinci bir çıktı (ör. React Native) gerekirse Style Dictionary'e geçilir.

import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokensDir = join(root, "tokens");
const outCss = join(root, "src", "styles", "tokens.css");
const outTs = join(root, "src", "styles", "tokens.ts");
const checkOnly = process.argv.includes("--check");

// ---- 1. Kaynakları oku ve birleştir -------------------------------------------------------
const tree = {};
for (const file of readdirSync(tokensDir).filter((f) => f.endsWith(".json")).sort()) {
  const json = JSON.parse(readFileSync(join(tokensDir, file), "utf8"));
  for (const [key, value] of Object.entries(json)) {
    if (key.startsWith("$")) continue;
    if (key in tree) throw new Error(`Token grubu birden fazla dosyada tanımlı: "${key}" (${file})`);
    tree[key] = value;
  }
}

const isToken = (node) => node && typeof node === "object" && "$value" in node;

/** Ağaçtaki tüm token'ları [yol, token] olarak döndürür. */
function collect(node, path = []) {
  if (isToken(node)) return [[path, node]];
  return Object.entries(node)
    .filter(([key]) => !key.startsWith("$"))
    .flatMap(([key, child]) => collect(child, [...path, key]));
}

function lookup(path) {
  let node = tree;
  for (const part of path) {
    node = node?.[part];
    if (node === undefined) throw new Error(`Çözümlenemeyen token referansı: {${path.join(".")}}`);
  }
  if (!isToken(node)) throw new Error(`Referans bir token değil: {${path.join(".")}}`);
  return node;
}

/** "{primitive.teal.700}" gibi referansları sonuna kadar çözer. */
function resolve(value, seen = new Set()) {
  if (typeof value !== "string") return value;
  const match = value.match(/^\{([^}]+)\}$/);
  if (!match) return value;
  if (seen.has(match[1])) throw new Error(`Döngüsel token referansı: ${match[1]}`);
  seen.add(match[1]);
  return resolve(lookup(match[1].split("."))["$value"], seen);
}

const aliasPath = (value) => (typeof value === "string" ? value.match(/^\{([^}]+)\}$/)?.[1] : undefined);
const cssName = (path) => path.join("-");
const pxToRem = (px) => `${parseFloat(px) / 16}rem`;
// Gölge: tek katman ({…}), çok katman ([{…}, {…}]) veya başka bir gölgeye referans ("{shadow.elev-1}").
const shadowCss = (value) => {
  const s = resolve(value);
  return (Array.isArray(s) ? s : [s]).map((l) => `${l.offsetX} ${l.offsetY} ${l.blur} ${l.spread} ${l.color}`).join(", ");
};

// ---- 2. CSS üret -------------------------------------------------------------------------
const breakpoints = collect(tree.breakpoint).map(([p, t]) => [p[0], t.$value]);
const bp = Object.fromEntries(breakpoints);
const lines = [];
const push = (...l) => lines.push(...l);

push(
  "/* ------------------------------------------------------------------------------------------",
  " * ÜRETİLEN DOSYA – ELLE DÜZENLEMEYİN.",
  " * Kaynak: tokens/*.json · Üretici: scripts/build-tokens.mjs (pnpm tokens:build)",
  " * Kurallar: DESIGN_SYSTEM.md Part A, DESIGN_SYSTEM_PICKALY.md, TECH_STACK.md §8",
  " * ---------------------------------------------------------------------------------------- */",
  "",
);

// 2a. Primitive renkler: yalnızca CSS değişkeni, Tailwind sınıfı ÜRETİLMEZ.
push("/* Primitive palet – bileşenler doğrudan kullanmaz. */", ":root {");
for (const [path, token] of collect(tree.primitive)) {
  push(`  --pk-${cssName(path)}: ${token.$value};`);
}
push("}", "");

// 2b. Tailwind tema eşlemesi. Varsayılan palet ve ölçekler sıfırlanır; yalnızca Pickaly token'ları kalır.
push("@theme {");
push("  /* Renkler: yalnızca semantic token'lar (bg-surface-card, text-text-secondary …) */", "  --color-*: initial;");
for (const [path, token] of collect(tree.color)) {
  const alias = aliasPath(token.$value);
  const value = alias ? `var(--pk-${alias.replace(/^primitive\./, "").replaceAll(".", "-")})` : token.$value;
  push(`  --color-${cssName(path)}: ${value};`);
}

push("", "  /* Boşluk: 1 birim = 1px, böylece p-16 = 16px (token adı = değer). Ölçek: --space-* */", "  --spacing: 1px;");

push("", "  --radius-*: initial;");
for (const [path, token] of collect(tree.radius)) push(`  --radius-${cssName(path)}: ${token.$value};`);

push("", "  --shadow-*: initial;", "  --inset-shadow-*: initial;", "  --drop-shadow-*: initial;");
for (const [path, token] of collect(tree.shadow)) push(`  --shadow-${cssName(path)}: ${shadowCss(token.$value)};`);

push("", "  --breakpoint-*: initial;");
for (const [name, value] of breakpoints) push(`  --breakpoint-${name}: ${pxToRem(value)};`);

push(
  "",
  "  --font-*: initial;",
  // --font-geist: src/app/layout.tsx'te next/font ile yüklenen fontun değişkeni.
  `  --font-sans: var(--font-geist), ${tree.font.family.sans.$value}, ui-sans-serif, system-ui, sans-serif;`,
  "  --font-weight-*: initial;",
);
for (const [path, token] of collect(tree.font.weight)) push(`  --font-weight-${cssName(path)}: ${token.$value};`);

push("", "  /* Metin stilleri: boyut + satır yüksekliği + ağırlık birlikte (text-heading-h1 …) */", "  --text-*: initial;");
for (const [path, token] of collect(tree.type)) {
  const name = cssName(path);
  push(
    `  --text-${name}: var(--pk-type-${name}-size);`,
    `  --text-${name}--line-height: var(--pk-type-${name}-line-height);`,
    `  --text-${name}--font-weight: ${token.$value.fontWeight};`,
    ...(token.$value.letterSpacing ? [`  --text-${name}--letter-spacing: ${token.$value.letterSpacing};`] : []),
  );
}
push("}", "");

// 2c. Breakpoint'e göre değişen değerler (tipografi, layout).
const responsive = { base: [], tablet: [], laptop: [], desktop: [] };
for (const [path, token] of collect(tree.type)) {
  const name = cssName(path);
  responsive.base.push(`  --pk-type-${name}-size: ${token.$value.fontSize};`, `  --pk-type-${name}-line-height: ${token.$value.lineHeight};`);
  if (token.laptop) {
    responsive.laptop.push(`  --pk-type-${name}-size: ${token.laptop.fontSize};`, `  --pk-type-${name}-line-height: ${token.laptop.lineHeight};`);
  }
}
for (const [path, token] of collect(tree.layout)) {
  const name = `--layout-${cssName(path)}`;
  responsive.base.push(`  ${name}: ${token.$value};`);
  for (const step of ["tablet", "laptop", "desktop"]) {
    if (token[step]) responsive[step].push(`  ${name}: ${token[step]};`);
  }
}

push("/* Ölçek değişkenleri ve breakpoint'e göre değişen değerler (mobile-first). */", ":root {");
for (const [path, token] of collect(tree.space)) push(`  --space-${cssName(path)}: ${token.$value};`);
for (const [path, token] of collect(tree["border-width"])) push(`  --border-width-${cssName(path)}: ${token.$value};`);
for (const [path, token] of collect(tree["icon-size"])) push(`  --icon-size-${cssName(path)}: ${token.$value};`);
for (const [path, token] of collect(tree["z-index"])) push(`  --z-${cssName(path)}: ${token.$value};`);
push(...responsive.base, "}", "");
for (const step of ["tablet", "laptop", "desktop"]) {
  if (responsive[step].length === 0) continue;
  push(`@media (min-width: ${pxToRem(bp[step])}) {`, "  :root {", ...responsive[step].map((l) => `  ${l}`), "  }", "}", "");
}

const css = lines.join("\n");

// ---- 3. TypeScript çıktısı (CSS dışı kullanımlar) ---------------------------------------
const colorValues = Object.fromEntries(collect(tree.color).map(([path, token]) => [cssName(path), resolve(token.$value)]));
const ts = [
  "// ÜRETİLEN DOSYA – ELLE DÜZENLEMEYİN. Kaynak: tokens/*.json · Üretici: scripts/build-tokens.mjs",
  "// Yalnızca CSS kullanılamayan yerler için (manifest, viewport themeColor, e-posta vb.).",
  "// Bileşenlerde renkler Tailwind sınıflarıyla (ör. bg-surface-card) kullanılır.",
  "",
  `export const semanticColors = ${JSON.stringify(colorValues, null, 2)} as const;`,
  "",
  `export const breakpoints = ${JSON.stringify(Object.fromEntries(breakpoints.map(([n, v]) => [n, parseFloat(v)])), null, 2)} as const;`,
  "",
  "export type SemanticColor = keyof typeof semanticColors;",
  "export type Breakpoint = keyof typeof breakpoints;",
  "",
].join("\n");

// ---- 4. Yaz veya kontrol et -------------------------------------------------------------
const outputs = [
  [outCss, css],
  [outTs, ts],
];
if (checkOnly) {
  const stale = outputs.filter(([file, content]) => !existsSync(file) || readFileSync(file, "utf8") !== content);
  if (stale.length > 0) {
    console.error(`Token çıktıları güncel değil: ${stale.map(([f]) => f.replace(root, ".")).join(", ")}\nÇalıştırın: pnpm tokens:build`);
    process.exit(1);
  }
  console.log("Token çıktıları güncel.");
} else {
  for (const [file, content] of outputs) writeFileSync(file, content, "utf8");
  console.log(`Üretildi: ${outputs.map(([f]) => f.replace(root, ".")).join(", ")}`);
}
