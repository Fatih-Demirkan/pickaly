import type { ReactNode } from "react";

// Sekme ekranlarının başlık bloğu: title-md sayfa başlığı + caption alt başlık (DESIGN_SYSTEM_PICKALY §3.2).
// Sağdaki aksiyonlar (ör. "Bugün") ilgili modülde verilir.

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-12">
      <div className="flex min-w-0 flex-col">
        <h1 className="text-title-md text-text-primary">{title}</h1>
        {subtitle && <p className="text-caption text-text-secondary">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
