import Link from "next/link";
import type { AppIconName } from "@/config/icons";
import { Icon } from "@/components/ui/Icon";

// Pages → Ana Sayfa bölüm başlığı ("Bugünün Akışı", "Yaklaşan Ödemeler"): 20 px ikon + Heading/H4,
// sağda "Tümü (n)" Label/Small Brand/Primary.

type SectionHeaderProps = {
  id: string;
  icon: AppIconName;
  title: string;
  link?: { href: string; label: string };
};

export function SectionHeader({ id, icon, title, link }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-12">
      <h2 id={id} className="flex items-center gap-8 text-heading-h4 text-text-primary">
        <Icon icon={icon} />
        {title}
      </h2>
      {link && (
        <Link href={link.href} className="touch-target shrink-0 text-label-sm text-text-brand hover:underline">
          {link.label}
        </Link>
      )}
    </div>
  );
}
