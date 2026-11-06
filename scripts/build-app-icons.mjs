// PWA / favicon ikonlarını Pickaly logo kitinden (pickaly-logo/web) yerine koyar (TECH_STACK §8.5).
//   node scripts/build-app-icons.mjs   (pnpm icons:build)
// Logo kiti ürün sahibinin kaynağıdır; ikonlar burada yeniden çizilmez, yalnızca kopyalanır.
//   - favicon.ico (16/32/48) ve favicon.svg → Next.js dosya kuralları (src/app/favicon.ico, src/app/icon.svg)
//   - apple-touch-icon (180, kırmızı zemin) → src/app/apple-icon.png
//   - 192 / 512 / maskable 512 → public/icons (manifest.ts)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const kit = path.join(root, "pickaly-logo", "web");

const copies = [
  ["favicon.ico", "src/app/favicon.ico"],
  ["favicon.svg", "src/app/icon.svg"],
  ["apple-touch-icon.png", "src/app/apple-icon.png"],
  ["icon-192.png", "public/icons/icon-192.png"],
  ["icon-512.png", "public/icons/icon-512.png"],
  ["maskable-512.png", "public/icons/icon-maskable-512.png"],
  // Uygulama içi logo sembolü (src/components/ui/Logo.tsx): ana çizim ve 32 px altı için küçük boyut çizimi.
  ["../masters/pickaly-symbol.svg", "public/brand/pickaly-symbol.svg"],
  ["../masters/pickaly-symbol-small.svg", "public/brand/pickaly-symbol-small.svg"],
];

for (const [from, to] of copies) {
  const target = path.join(root, to);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(kit, from), target);
  console.log(`Kopyalandı: pickaly-logo/web/${from} → ${to}`);
}

// Eski geçici ikon (düz mavi karo) artık kullanılmıyor.
const legacy = path.join(root, "src/app/icon.png");
if (fs.existsSync(legacy)) {
  fs.rmSync(legacy);
  console.log("Kaldırıldı: src/app/icon.png (geçici mavi ikon)");
}
