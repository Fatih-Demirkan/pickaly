import { Suspense } from "react";
import { ContentLoading } from "@/components/layout/ContentLoading";
import { PageContainer } from "@/components/layout/PageContainer";
import { Dashboard } from "@/features/dashboard/components/Dashboard";

// Ana Sayfa (Dashboard). Veriler istek anına bağlı olduğundan kendi Suspense sınırında çizilir;
// navigasyon ve üst bar hemen görünür (cacheComponents).
export default function HomePage() {
  return (
    <PageContainer>
      <Suspense fallback={<ContentLoading />}>
        <Dashboard />
      </Suspense>
    </PageContainer>
  );
}
