import type { ReactNode } from "react";

// Pages kalıbı → sekme ekranlarının başlık bloğu: başlık H2 + alt başlık Body/Small (Figma "Container" 358×49).
// Sağdaki aksiyonlar (ör. "Bugün") ilgili modülde eklenecek.

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-12">
      <div className="flex min-w-0 flex-col">
        <h1 className="text-heading-h2 text-text-primary">{title}</h1>
        {subtitle && <p className="text-body-sm text-text-secondary">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
