import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AUTH_CALLBACK_PATH, isPublicPath, SIGN_IN_PATH } from "@/features/auth/routes";
import { getSupabasePublicEnv, isDeployed, isSupabaseConfigured } from "@/lib/env";

// Oturum proxy'si (Next.js 16'da middleware.ts yerine proxy.ts; TECH_STACK §6.3):
//   1) Supabase oturum cookie'lerini her istekte yeniler (@supabase/ssr önerisi).
//   2) Oturumsuz kullanıcıyı uygulama ekranlarından Giriş'e yönlendirir; oturumlu kullanıcıyı giriş ekranlarından Ana Sayfa'ya.
// Supabase ortam değişkenleri tanımlı değilse:
//   - bilgisayarda (next dev) hiçbir şey yapmaz: uygulama yerel örnek veriyle oturumsuz açılır;
//   - yayında (Vercel) örnek veriye DÜŞMEZ: 503 bakım sayfası döner. Aksi hâlde girilen veriler kaydedilmez ve
//     sessizce sıfırlanır (2026-11-05'te kullanıcı bunu yaşadı; denetim P0-2).
// Asıl yetki kontrolü veritabanında RLS ile yapılır; proxy yalnızca yönlendirme ve oturum yenileme içindir.

const NOT_CONFIGURED_HTML = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pickaly</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#F5F6F7;font-family:system-ui,sans-serif;color:#000"><main style="max-width:360px;padding:24px;text-align:center"><h1 style="font-size:20px;margin:0 0 8px">Pickaly şu an kullanılamıyor</h1><p style="font-size:14px;line-height:20px;color:#6B6F76;margin:0">Sunucu veritabanına bağlı değil. Girdiğiniz bilgiler kaybolmasın diye uygulama açılmadı. Lütfen daha sonra tekrar deneyin.</p></main></body></html>`;

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    if (isDeployed()) {
      return new NextResponse(NOT_CONFIGURED_HTML, { status: 503, headers: { "content-type": "text/html; charset=utf-8", "retry-after": "300" } });
    }
    return NextResponse.next({ request });
  }

  // E-postadaki doğrulama bağlantısı Supabase'in izin listesine göre Site URL'e (ör. "/?code=…") dönebilir.
  // Kod hangi adrese gelirse gelsin oturum açmak için /auth/callback'e aktarılır; yoksa yönlendirmede kaybolur.
  const { searchParams: incoming, pathname: incomingPath } = request.nextUrl;
  if (!incomingPath.startsWith(AUTH_CALLBACK_PATH) && (incoming.has("code") || (incoming.has("token_hash") && incoming.has("type")))) {
    const target = request.nextUrl.clone();
    target.pathname = AUTH_CALLBACK_PATH;
    if (incomingPath !== "/" && !target.searchParams.has("sonra")) target.searchParams.set("sonra", incomingPath);
    return NextResponse.redirect(target);
  }

  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabasePublicEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  // getUser() Supabase Auth sunucusunda doğrular; yalnızca cookie'ye güvenen getSession() kullanılmaz.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname, search } = request.nextUrl;
  const publicPath = isPublicPath(pathname);

  const redirect = (target: URL) => {
    const redirectResponse = NextResponse.redirect(target);
    // Yenilenen oturum cookie'leri yönlendirmeye de taşınır.
    for (const cookie of response.cookies.getAll()) redirectResponse.cookies.set(cookie);
    return redirectResponse;
  };

  if (!user && !publicPath) {
    const target = request.nextUrl.clone();
    target.pathname = SIGN_IN_PATH;
    target.search = pathname === "/" ? "" : `?sonra=${encodeURIComponent(pathname + search)}`;
    return redirect(target);
  }
  // Şifre sıfırlamanın son adımı (yeni şifre) kurtarma oturumuyla açılır; o yüzden sifremi-unuttum hariç tutulur.
  if (user && publicPath && !pathname.startsWith("/sifremi-unuttum") && !pathname.startsWith("/auth/")) {
    const target = request.nextUrl.clone();
    target.pathname = "/";
    target.search = "";
    return redirect(target);
  }
  return response;
}

export const config = {
  // Statik dosyalar, görseller ve manifest proxy'den geçmez.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|illustrations/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
