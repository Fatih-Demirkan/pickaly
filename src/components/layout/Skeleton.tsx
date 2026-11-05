import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { cn } from "@/lib/cn";

// Yükleme iskeletleri (DESIGN_SYSTEM_PICKALY §5.9): neutral.100 bloklar, öğenin radius'u, 1,2 sn nabız;
// "hareketi azalt" tercihinde sabit (globals.css). Dönen gösterge yerine ekranın yerleşimini önceden çizer:
// sayfa geçişinde içerik beklenirken kullanıcı boş bir alan yerine gelecek ekranın iskeletini görür (uygulama hissi).
// Ekran okuyucuya tek bir "Yükleniyor" durumu okunur.

export function SkeletonBlock({ className }: { className?: string }) {
  return <span aria-hidden className={cn("block animate-skeleton rounded-md bg-surface-muted", className)} />;
}

async function Shell({ children, className }: { children: ReactNode; className?: string }) {
  const t = await getTranslations("common");
  return (
    <div role="status" aria-busy="true" className={cn("mx-auto flex w-full max-w-(--layout-content-max-width) flex-col gap-(--layout-section-gap) px-(--layout-page-padding-x) pt-(--layout-page-padding-top) pb-32", className)}>
      <span className="sr-only">{t("loading")}</span>
      {children}
    </div>
  );
}

function CardRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col divide-y divide-border-subtle overflow-hidden rounded-md bg-surface-card shadow-elev-1">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex min-h-64 items-center gap-12 px-16 py-12">
          <SkeletonBlock className="size-36 shrink-0 rounded-sm" />
          <span className="flex min-w-0 flex-1 flex-col gap-6">
            <SkeletonBlock className="h-12 w-1/2" />
            <SkeletonBlock className="h-10 w-1/3" />
          </span>
          <SkeletonBlock className="h-12 w-64 shrink-0" />
        </div>
      ))}
    </div>
  );
}

/** Sekme ekranları (İşlemler, Takvim, Birikimler, Profil): başlık + özet kartı + liste. */
export function ListSkeleton() {
  return (
    <Shell>
      <span className="flex flex-col gap-6">
        <SkeletonBlock className="h-20 w-40" />
        <SkeletonBlock className="h-12 w-56" />
      </span>
      <SkeletonBlock className="h-44 rounded-full" />
      <div className="flex flex-col gap-12 rounded-lg bg-surface-card p-16 shadow-elev-1">
        <SkeletonBlock className="h-12 w-32" />
        <SkeletonBlock className="h-28 w-48" />
      </div>
      <CardRows />
    </Shell>
  );
}

/** Ana Sayfa: ortalı bakiye + stat kartları + hızlı aksiyonlar + akış. */
export function DashboardSkeleton() {
  return (
    <Shell>
      <span className="flex flex-col items-center gap-8 pt-8">
        <SkeletonBlock className="h-12 w-24" />
        <SkeletonBlock className="h-44 w-64" />
        <SkeletonBlock className="h-12 w-20" />
      </span>
      <div className="grid grid-cols-2 gap-8 tablet:grid-cols-3">
        <SkeletonBlock className="h-72" />
        <SkeletonBlock className="h-72" />
        <SkeletonBlock className="col-span-2 h-72 tablet:col-span-1" />
      </div>
      <div className="grid grid-cols-4 gap-8">
        {Array.from({ length: 4 }, (_, index) => (
          <SkeletonBlock key={index} className="h-88" />
        ))}
      </div>
      <CardRows rows={3} />
    </Shell>
  );
}

/** Odak ekranları ve formlar (drawer içeriği): başlık + tutar kartı + alanlar. */
export function FormSkeleton() {
  return (
    <Shell className="pt-16">
      <SkeletonBlock className="h-20 w-40" />
      <SkeletonBlock className="h-40 rounded-full" />
      <div className="flex flex-col items-center gap-12 rounded-lg bg-surface-card p-16 shadow-elev-1">
        <SkeletonBlock className="h-24 w-24 rounded-full" />
        <SkeletonBlock className="h-44 w-48" />
      </div>
      {Array.from({ length: 3 }, (_, index) => (
        <span key={index} className="flex flex-col gap-8">
          <SkeletonBlock className="h-12 w-24" />
          <SkeletonBlock className="h-48" />
        </span>
      ))}
    </Shell>
  );
}
