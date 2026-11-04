import Link from "next/link";
import type { AppIconName } from "@/config/icons";
import { Icon } from "@/components/ui/Icon";

// Bölüm başlığı ("Bugünün Akışı", "Yaklaşan Ödemeler"): 20 px ikon + title-sm; sağda "Tümü (n)" metin bağlantısı
// (caption-strong, text-brand). DESIGN_SYSTEM.md §A3 card headings, DESIGN_SYSTEM_PICKALY §5.1 Text buton.

type SectionHeaderProps = {
  id: string;
  icon: AppIconName;
  title: string;
  link?: { href: string; label: string };
};

export function SectionHeader({ id, icon, title, link }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-12">
      <h2 id={id} className="flex items-center gap-8 text-title-sm text-text-primary">
        <Icon icon={icon} />
        {title}
      </h2>
      {link && (
        <Link href={link.href} className="touch-target shrink-0 text-caption-strong text-text-brand hover:underline">
          {link.label}
        </Link>
      )}
    </div>
  );
}
