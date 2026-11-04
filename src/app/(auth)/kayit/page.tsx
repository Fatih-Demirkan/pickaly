import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { AuthHeading } from "@/features/auth/components/AuthFields";
import { SignUpForm } from "@/features/auth/components/AuthForms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signUp");
  return { title: t("title") };
}

// Kayıt (PRD FR-AUTH-001): ad, e-posta, şifre, kullanım koşulları onayı → e-postaya 6 haneli kod.
export default async function SignUpPage() {
  const t = await getTranslations("auth.signUp");
  return (
    <>
      <AuthHeading title={t("title")} subtitle={t("subtitle")} />
      <SignUpForm />
    </>
  );
}
