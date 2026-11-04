import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isPublicPath, SIGN_IN_PATH } from "@/features/auth/routes";
import { getSupabasePublicEnv, isSupabaseConfigured } from "@/lib/env";

// Oturum proxy'si (Next.js 16'da middleware.ts yerine proxy.ts; TECH_STACK §6.3):
//   1) Supabase oturum cookie'lerini her istekte yeniler (@supabase/ssr önerisi).
//   2) Oturumsuz kullanıcıyı uygulama ekranlarından Giriş'e yönlendirir; oturumlu kullanıcıyı giriş ekranlarından Ana Sayfa'ya.
// Supabase ortam değişkenleri tanımlı değilse hiçbir şey yapmaz: uygulama yerel örnek veriyle oturumsuz açılır.
// Asıl yetki kontrolü veritabanında RLS ile yapılır; proxy yalnızca yönlendirme ve oturum yenileme içindir.

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.next({ request });

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
