import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set(name, value);
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set(name, "");
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: "", ...options, maxAge: 0 });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // Public / API bypass
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path === "/favicon.ico"
  ) {
    return response;
  }

  // If user is NOT logged in
  if (!user) {
    if (path !== "/login") {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // User is logged in, fetch profile role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  const role = profile?.role;
  const isActive = profile?.is_active ?? true;

  if (!isActive) {
    await supabase.auth.signOut();
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("error", "account_deactivated");
    return NextResponse.redirect(loginUrl);
  }

  // If user visits / or /login while logged in -> redirect to their role dashboard
  if (path === "/login" || path === "/") {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = `/${role || "employee"}`;
    return NextResponse.redirect(targetUrl);
  }

  // Cross-role guard
  if (path.startsWith("/admin") && role !== "admin") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${role || "employee"}`;
    return NextResponse.redirect(redirectUrl);
  }

  if (path.startsWith("/manager") && role !== "manager") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${role || "employee"}`;
    return NextResponse.redirect(redirectUrl);
  }

  if (path.startsWith("/employee") && role !== "employee") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${role || "employee"}`;
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
