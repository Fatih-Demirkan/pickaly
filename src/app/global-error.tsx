"use client";

import trMessages from "@/locales/tr.json";
import enMessages from "@/locales/en.json";
import "@/styles/globals.css";

// Kök layout'un kendisi hata verdiğinde gösterilir; bu durumda dil sağlayıcısı da çalışmıyor olabilir.
// Bu yüzden iki dilin metni birlikte gösterilir.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="tr">
      <body>
        <main className="flex min-h-dvh flex-col items-start justify-center gap-12 bg-surface-page px-(--layout-page-padding-x)">
          <h1 className="text-heading-h2 text-text-primary">{trMessages.errors.genericTitle}</h1>
          <p className="text-body-md text-text-secondary">{trMessages.errors.genericBody}</p>
          <p lang="en" className="text-body-sm text-text-secondary">
            {enMessages.errors.genericTitle}. {enMessages.errors.genericBody}
          </p>
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex min-h-48 items-center rounded-md bg-brand-primary px-16 text-button text-text-inverse"
          >
            {trMessages.common.retry} / {enMessages.common.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
