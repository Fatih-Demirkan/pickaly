import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { AuthHeading } from "@/features/auth/components/AuthFields";
import { NewPasswordForm, ResetCodeForm, ResetRequestForm } from "@/features/auth/components/AuthForms";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.reset");
  return { title: t("title") };
}

// Şifremi Unuttum (PRD FR-AUTH-004, RESPONSIVE §8.2.8): tek akışta 3 adım — e-posta → 6 haneli kod → yeni şifre.
//   ?adim=kod&e=… kod adımı · ?adim=yeni kurtarma oturumu açıldıktan sonra yeni şifre.
// Adım göstergesi "Adım n / 3" [Varsayım: görünümü tasarlanmadı].
export default async function ResetPasswordPage({ searchParams }: PageProps<"/sifremi-unuttum">) {
  const [t, params] = await Promise.all([getTranslations("auth.reset"), searchParams]);
  const email = typeof params.e === "string" ? params.e : "";
  // Yeni şifre adımı kurtarma oturumu ister; oturum yoksa form bunu söyler ve akışa baştan dönme bağlantısı gösterir.
  const step = params.adim === "yeni" ? 3 : params.adim === "kod" && email ? 2 : 1;

  return (
    <>
      <div className="flex flex-col gap-8">
        <p className="text-caption-strong text-text-secondary">{t("step", { step, total: 3 })}</p>
        <AuthHeading
          title={step === 3 ? t("newTitle") : t("title")}
          subtitle={
            step === 1
              ? t("subtitle")
              : step === 2
                ? t.rich("codeSubtitle", { email, strong: (chunks) => <strong className="text-text-primary">{chunks}</strong> })
                : t("newSubtitle")
          }
        />
      </div>
      {step === 1 && <ResetRequestForm />}
      {step === 2 && <ResetCodeForm email={email} />}
      {step === 3 && <NewPasswordForm />}
    </>
  );
}
