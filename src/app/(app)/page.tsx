import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardSkeleton } from "@/components/layout/Skeleton";
import { Dashboard } from "@/features/dashboard/components/Dashboard";

// Ana Sayfa (Dashboard). Veriler istek anına bağlı olduğundan kendi Suspense sınırında çizilir; navigasyon ve üst bar
// hemen görünür, içerik beklenirken Ana Sayfa iskeleti gösterilir (cacheComponents, DESIGN_SYSTEM_PICKALY §5.9).
export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      {/* Karşılama alanının renk geçişi bakiyenin üstünde bitsin diye ek üst boşluk (ürün sahibi isteği 2026-11-06). */}
      <PageContainer className="pt-32! tablet:pt-40! laptop:pt-48!">
        <Dashboard />
      </PageContainer>
    </Suspense>
  );
}
