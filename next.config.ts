import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Next.js 16 varsayılanları (create-next-app 16.4): Cache Components + Partial Prefetching.
  cacheComponents: true,
  partialPrefetching: true,
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
