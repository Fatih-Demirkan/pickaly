import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthHeading } from "@/features/auth/components/AuthFields";
import { VerifySignUpForm } from "@/features/auth/components/AuthForms";
import { safeNextPath, SIGN_UP_PATH } from "@/features/auth/routes";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.verify");
  return { title: t("title") };
}

// E-posta Doğrulama (PRD FR-AUTH-002, D-1): 6 haneli kod + geri sayımlı "Kodu tekrar gönder". ?e= e-posta adresi.
// [Ertelendi] Özel SMTP kurulana kadar Supabase şablonları düzenlenemiyor: e-postada kod yok, yalnızca bağlantı var.
// Bu yüzden metin önce bağlantıyı söyler; kod kutuları SMTP gelince kullanılmak üzere durur.
export default async function VerifyPage({ searchParams }: PageProps<"/dogrulama">) {
  const [t, params] = await Promise.all([getTranslations("auth.verify"), searchParams]);
  const email = typeof params.e === "string" ? params.e : "";
  if (!email) redirect(SIGN_UP_PATH);
  const next = safeNextPath(params.sonra);
  return (
    <>
      <AuthHeading title={t("title")} subtitle={t.rich("subtitle", { email, strong: (chunks) => <strong className="text-text-primary">{chunks}</strong> })} />
      <VerifySignUpForm email={email} next={next === "/" ? undefined : next} />
    </>
  );
}
