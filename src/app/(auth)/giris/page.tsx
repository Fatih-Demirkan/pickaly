import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { AuthHeading } from "@/features/auth/components/AuthFields";
import { SignInForm } from "@/features/auth/components/AuthForms";
import { safeNextPath } from "@/features/auth/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signIn");
  return { title: t("title") };
}

// Giriş (PRD FR-AUTH-003). ?sonra= girişten sonra dönülecek adres · ?hata=baglanti e-posta bağlantısı geçersizdi.
export default async function SignInPage({ searchParams }: PageProps<"/giris">) {
  const [t, params] = await Promise.all([getTranslations("auth.signIn"), searchParams]);
  return (
    <>
      <AuthHeading title={t("title")} subtitle={t("subtitle")} />
      <SignInForm next={safeNextPath(params.sonra)} initialError={params.hata === "baglanti" ? "codeInvalid" : undefined} />
    </>
  );
}
