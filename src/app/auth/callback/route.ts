import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath, SIGN_IN_PATH } from "@/features/auth/routes";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// E-postadaki bağlantıyla doğrulama (kod yerine bağlantıya tıklanırsa): Supabase'in varsayılan e-posta şablonu
// ?code= (PKCE) veya ?token_hash=&type= ile buraya döner. Oturum açılır ve ?sonra= adresine gidilir.
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeNextPath(searchParams.get("sonra") ?? "/");
  const fail = new URL(`${SIGN_IN_PATH}?hata=baglanti`, request.url);
  if (!isSupabaseConfigured()) return NextResponse.redirect(fail);

  const supabase = await createSupabaseServerClient();
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("missing code") };
  return NextResponse.redirect(error ? fail : new URL(next, request.url));
}
