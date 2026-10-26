import { NextResponse, type NextRequest } from "next/server";
import { partners } from "@/config/partners";
import { findActivePartner } from "@/lib/partners";
import { isSupabaseConfigured } from "@/lib/supabase";

/**
 * A partner's share link: /r/PRIYA, or /r/PRIYA?to=/templates/bagh to land on one design.
 * Remembers the code in this browser, then opens the site. Unknown codes just open the site.
 */
export async function GET(request: NextRequest, { params }: RouteContext<"/r/[code]">) {
  const to = request.nextUrl.searchParams.get("to") ?? "/";
  // Only paths on this site, never another domain.
  const dest = new URL(/^\/(?!\/)/.test(to) ? to : "/", request.url);
  const res = NextResponse.redirect(dest);

  const partner = isSupabaseConfigured() ? await findActivePartner((await params).code) : null;
  if (partner) {
    // Readable by the page so the order form can show the code as applied.
    res.cookies.set(partners.cookie, partner.code, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: partners.cookieDays * 86_400,
    });
  }
  return res;
}
