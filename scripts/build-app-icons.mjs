// PWA / favicon ikonlarını üretir (TECH_STACK §8.5: 192 / 512 / maskable + apple-touch-icon).
//   node scripts/build-app-icons.mjs
// [Geçici] Logo dosyası henüz yok (PRD TD-14, TECH_STACK P1-13). İkon, uygulamadaki logo karosunun aynısıdır:
//   düz brand.accent (blue.500) karo, radius.2xl maskesi (DESIGN_SYSTEM_PICKALY §4.2, §7). Logo gelince bu betik
//   logoyu karonun ortasına yerleştirecek şekilde güncellenir.
//   - "any" ikonlar: köşeleri yuvarlatılmış karo, köşeler saydam. Radius 28/128 oranında [Varsayım: oran].
//   - maskable ve apple-touch-icon: tam dolu kare; köşeyi işletim sistemi keser (saydamlık yok).
// Bağımlılık yok: PNG, Node'un zlib modülüyle yazılır.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const primitives = JSON.parse(fs.readFileSync(path.join(root, "tokens/color.primitives.json"), "utf8"));
const hex = findBlue500(primitives);
const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function findBlue500(tokens) {
  const stack = [tokens];
  while (stack.length) {
    const node = stack.pop();
    if (node && typeof node === "object") {
      if (node.blue?.["500"]?.$value) return node.blue["500"].$value;
      stack.push(...Object.values(node));
    }
  }
  throw new Error("blue.500 bulunamadı");
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

/** Kenar yumuşatmalı (4×4 örnek) yuvarlak köşeli karo; radius 0 → tam dolu kare. */
function png(size, radiusRatio) {
  const radius = size * radiusRatio;
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const samples = 4;
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      let covered = 0;
      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const px = x + (sx + 0.5) / samples;
          const py = y + (sy + 0.5) / samples;
          const cx = Math.min(Math.max(px, radius), size - radius);
          const cy = Math.min(Math.max(py, radius), size - radius);
          if ((px - cx) ** 2 + (py - cy) ** 2 <= radius ** 2) covered++;
        }
      }
      const offset = row + 1 + x * 4;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = Math.round((covered / samples ** 2) * 255);
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8; // bit derinliği
  header[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const ROUNDED = 28 / 128;
const outputs = [
  ["public/icons/icon-192.png", 192, ROUNDED],
  ["public/icons/icon-512.png", 512, ROUNDED],
  ["public/icons/icon-maskable-512.png", 512, 0],
  // Next.js dosya kuralları: <link rel="icon"> ve <link rel="apple-touch-icon"> kendiliğinden eklenir.
  ["src/app/icon.png", 64, ROUNDED],
  ["src/app/apple-icon.png", 180, 0],
];
for (const [file, size, ratio] of outputs) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, png(size, ratio));
  console.log(`Üretildi: ${file} (${size}px, ${hex})`);
}
