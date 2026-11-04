import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ProfileSettings } from "@/features/settings/components/ProfileSettings";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pages.profile");
  return { title: t("title") };
}

export default function ProfilePage() {
  return <ProfileSettings />;
}
