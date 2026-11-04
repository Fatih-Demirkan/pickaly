import { getTranslations } from "next-intl/server";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { getSessionUser } from "@/features/auth/server";
import { listCategories } from "@/features/categories/server";
import { isSupabaseConfigured } from "@/lib/env";
import packageJson from "../../../../package.json";
import { getProfile, getSettings } from "../server";
import { ExportRow, LanguageRow, WeekStartRow } from "./PreferenceRows";
import { SettingsDisabledRow, SettingsGroup, SettingsLinkRow, SettingsStaticRow, SettingsValue } from "./SettingsRow";
import { SignOutRow } from "./SignOutRow";

// Pages → Profil ve Ayarlar (145:9490, PRD FR-SET-001…013), RESPONSIVE §3.6.1.
//   Sayfa başlığı "Profil ve Ayarlar" Heading/H2 + alt başlık Body/Small
//   Profil kartı (İşlemler özet kartıyla aynı gradyan, radius-2xl, padding 16, shadow-floating): 58 px avatar (2 px beyaz
//     çerçeve, Shadow/MD) + ad Label/Default, e-posta Body/Small, "Senkronize" çipi
//   Gruplar: başlık Label/Small büyük harf text-secondary, aralık 8 · satırlar SettingsRow.
// Tablet: tek sütun, max 720, ortalı · laptop+: profil kartı [4/12] sticky | ayar grupları [8/12, max 720].
// Satır kararları (PRD):
//   Kategori Yönetimi → /profil/kategoriler; çipte aktif kategori sayısı.
//   Hatırlatma ve Bildirimler: ekranı tasarlanmadı [Eksik] (RESPONSIVE §3.6.4) — durum çipi görünür, satır devre dışı.
//   Para Birimi: V1'de yalnızca ₺, bilgi amaçlı (FR-SET-004) — chevron gösterilmez [Varsayım].
//   Uygulama Dili, Haftanın İlk Günü: değer seçici · Verileri Yedekle & Dışa Aktar: JSON / CSV.
//   PIN / Biyometrik Kilit: V1'de yok, satır gizlenir (FR-SET-011, D-4).
//   Hakkında & Sürüm: metinler hukuki onay bekliyor [Eksik] (LB-01) — sürüm görünür, satır devre dışı.
//   Çıkış Yap: Supabase oturumu açıksa bu cihazdaki oturumu kapatır (FR-AUTH-006); Supabase tanımlı değilse
//     (yerel örnek veri modu, oturum yok) devre dışı.
// Profil kartı oturumdaki kullanıcının adı ve e-postasıyla dolar; oturum yoksa yerel örnek profil gösterilir.
// [Varsayım] Avatar görseli yokken ad-soyad baş harfleri gösterilir (Pages'taki fotoğraf örnek görseldir).
// [Ertelendi] Profil düzenleme (FR-SET-002) ve "Senkronize" durumunun gerçek değeri veri katmanı Supabase'e geçince.
// Pages'taki "UygulamaAdi v1.0" yer tutucusu "Pickaly" + package.json sürümüyle değiştirildi (RESPONSIVE §8.3 madde 9).

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toLocaleUpperCase("tr-TR"))
    .join("");
}

export async function ProfileSettings() {
  const [t, tPage, tHeader, mockProfile, sessionUser, settings, categories] = await Promise.all([
    getTranslations("settings"),
    getTranslations("pages.profile"),
    getTranslations("header"),
    getProfile(),
    getSessionUser(),
    getSettings(),
    listCategories(),
  ]);
  const profile = sessionUser ? { name: sessionUser.name, email: sessionUser.email } : mockProfile;
  const authEnabled = isSupabaseConfigured();
  const activeCategories = categories.filter((category) => !category.archived).length;

  return (
    <PageContainer className="flex flex-col gap-(--layout-section-gap)">
      <span id="settings-unavailable" className="sr-only">
        {tHeader("unavailable")}
      </span>
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-(--layout-section-gap) laptop:mx-0 laptop:max-w-none">
        <PageHeader title={tPage("title")} subtitle={tPage("subtitle")} />

        <div className="grid grid-cols-1 gap-(--layout-section-gap) laptop:grid-cols-12 laptop:items-start">
          <section
            aria-label={t("profile.label")}
            className="flex items-center gap-12 rounded-2xl border border-border-default bg-linear-to-b from-surface-card to-surface-muted p-16 shadow-floating laptop:sticky laptop:top-24 laptop:col-span-4"
          >
            <span
              aria-hidden
              className="inline-flex size-58 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-surface-card bg-category-blue text-heading-h4 text-text-on-task shadow-md"
            >
              {initials(profile.name)}
            </span>
            <div className="flex min-w-0 flex-col items-start gap-4">
              <p className="max-w-full truncate text-label-md text-text-primary">{profile.name}</p>
              <p className="max-w-full truncate text-body-sm text-text-secondary">{profile.email}</p>
              <Chip>{t("profile.synced")}</Chip>
            </div>
          </section>

          <div className="flex flex-col gap-(--layout-section-gap) laptop:col-span-8 laptop:max-w-[720px]">
            <SettingsGroup id="settings-content" title={t("groups.content")}>
              <li>
                <SettingsLinkRow
                  href="/profil/kategoriler"
                  icon="categories"
                  title={t("categories.title")}
                  hint={t("categories.hint")}
                  trailing={<Chip>{t("categories.count", { count: activeCategories })}</Chip>}
                />
              </li>
              <li>
                <SettingsDisabledRow
                  describedBy="settings-unavailable"
                  icon="reminders"
                  title={t("reminders.title")}
                  hint={t("reminders.hint")}
                  trailing={<Chip variant={settings.remindersEnabled ? "success" : "neutral"}>{settings.remindersEnabled ? t("reminders.on") : t("reminders.off")}</Chip>}
                />
              </li>
            </SettingsGroup>

            <SettingsGroup id="settings-preferences" title={t("groups.preferences")}>
              <li>
                <SettingsStaticRow icon="currencySetting" title={t("currency.title")} hint={t("currency.hint")} trailing={<SettingsValue>{t("currency.value")}</SettingsValue>} />
              </li>
              <li>
                <LanguageRow />
              </li>
              <li>
                <WeekStartRow weekStart={settings.weekStart} />
              </li>
            </SettingsGroup>

            <SettingsGroup id="settings-data" title={t("groups.data")}>
              <li>
                <ExportRow />
              </li>
            </SettingsGroup>

            <SettingsGroup id="settings-support" title={t("groups.support")}>
              <li>
                <SettingsDisabledRow
                  describedBy="settings-unavailable"
                  icon="info"
                  title={t("about.title")}
                  hint={t("about.hint")}
                  trailing={<SettingsValue muted>{t("about.version", { version: packageJson.version })}</SettingsValue>}
                />
              </li>
              <li>
                {authEnabled ? (
                  <SignOutRow title={t("logout.title")} hint={t("logout.hint")} />
                ) : (
                  <SettingsDisabledRow describedBy="settings-unavailable" icon="logout" title={t("logout.title")} hint={t("logout.hint")} danger />
                )}
              </li>
            </SettingsGroup>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
