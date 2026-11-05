import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Next.js 16 varsayılanları (create-next-app 16.4): Cache Components + Partial Prefetching.
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // Uygulama hissi (ürün sahibi isteği 2026-11-05): ziyaret edilen dinamik sayfalar istemci önbelleğinde 30 sn
    // tutulur; sekmeler arasında geri dönüş anlık olur. Her kayıt aksiyonu revalidatePath("/", "layout") ile bu
    // önbelleği temizlediği için eski veri görünmez.
    staleTimes: { dynamic: 30 },
  },
  // Sunucu yanıtlarında framework bilgisini gizler.
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
