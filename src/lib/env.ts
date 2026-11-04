// Ortam değişkenlerine TEK erişim noktası (ESLint, process.env'e başka yerden erişimi engeller).
// Yalnızca NEXT_PUBLIC_ önekli, gizli OLMAYAN değişkenler burada bulunur; bunlar istemci paketine gömülür.
// Gizli değerler (ör. SUPABASE_SERVICE_ROLE_KEY) bu uygulamada HİÇ kullanılmaz:
// yalnızca Supabase Edge Functions secrets'ta tutulur (TECH_STACK §13.3).
//
// Not: Next.js NEXT_PUBLIC_ değerlerini derleme anında koda yerleştirir; bu yüzden her değişken
// process.env.X biçiminde AÇIKÇA yazılmalıdır (dinamik erişim istemcide çalışmaz).

export const appEnvironments = ["local", "staging", "production"] as const;
export type AppEnvironment = (typeof appEnvironments)[number];

/** Uygulamanın çalıştığı ortam. Tanımlı değilse "local" kabul edilir. */
export function getAppEnvironment(): AppEnvironment {
  const value = process.env.NEXT_PUBLIC_APP_ENV;
  return (appEnvironments as readonly string[]).includes(value ?? "") ? (value as AppEnvironment) : "local";
}

export type SupabasePublicEnv = {
  url: string;
  anonKey: string;
};

/**
 * Yerel veri depoları örnek içerikle mi başlasın? Yalnızca sunucuda okunur (gizli değil, NEXT_PUBLIC_ öneki yok).
 * Varsayılan: hayır — yeni hesap boş başlar (yalnızca varsayılan kategoriler ve "Ana Hesap", PRD FR-AUTH-005).
 * Tasarım incelemesi gibi dolu ekran gereken durumlarda .env.local'de PICKALY_DEMO_DATA=true verilir.
 */
export function isDemoDataEnabled(): boolean {
  return process.env.PICKALY_DEMO_DATA === "true";
}

/**
 * Supabase bağlantı değerleri tanımlı mı? Tanımlı değilse uygulama yerel örnek veriyle, oturumsuz çalışır
 * (giriş zorunlu değildir, giriş ekranları kurulum notu gösterir). Değerler girildiğinde oturum zorunlu olur.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Supabase'in herkese açık bağlantı değerleri.
 * Eksikse veya hatalıysa ne yapılacağını söyleyen açık bir hata fırlatır.
 * Değerler yalnızca Supabase istemcisi oluşturulurken okunur; Supabase kullanmayan ekranlar çalışmaya devam eder.
 */
export function getSupabasePublicEnv(): SupabasePublicEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing = [
    !url && "NEXT_PUBLIC_SUPABASE_URL",
    !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `[Pickaly] Eksik ortam değişkeni: ${missing.join(", ")}. ` +
        "Yerelde .env.example dosyasını .env.local olarak kopyalayıp değerleri girin; " +
        "staging/production değerleri Vercel ortam değişkenlerinde tanımlanır (TECH_STACK §13.3).",
    );
  }

  try {
    new URL(url as string);
  } catch {
    throw new Error("[Pickaly] NEXT_PUBLIC_SUPABASE_URL geçerli bir URL değil.");
  }

  return { url: url as string, anonKey: anonKey as string };
}
