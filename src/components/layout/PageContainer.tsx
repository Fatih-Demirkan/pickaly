import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  /** Formlar (560) ve ayarlar (720) için okuma genişliği sınırı (RESPONSIVE.md §1.2). */
  width?: "content" | "form" | "settings";
  className?: string;
};

const widthClass = {
  content: "max-w-(--layout-content-max-width)",
  form: "max-w-(--layout-form-max-width)",
  settings: "max-w-(--layout-settings-max-width)",
} as const;

/**
 * Sayfa içeriği kabı. Yan boşluk, üst boşluk ve en fazla genişlik breakpoint'e göre token'lardan gelir:
 * padding-x 16 / 24 / 32 / 40, padding-top 16 / 24 / 32 / 32, içerik ≥1440'ta en fazla 1200 px.
 */
export function PageContainer({ children, width = "content", className }: PageContainerProps) {
  return (
    <div
      className={[
        "mx-auto w-full px-(--layout-page-padding-x) pt-(--layout-page-padding-top) pb-(--layout-section-gap)",
        widthClass[width],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
