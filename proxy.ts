import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function normalizeSupabaseUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
}

/**
 * Next.js 16 Proxy Convention (reemplaza a middleware.ts).
 * Intercepta peticiones para refrescar tokens de sesión de Supabase Auth y proteger rutas privadas.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    (process.env.NODE_ENV === "test" ? "https://test.supabase.co" : undefined);
  const supabaseUrl = normalizeSupabaseUrl(rawUrl);
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    (process.env.NODE_ENV === "test" ? "test-anon-key" : undefined);

  if (supabaseUrl && supabaseKey) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            const isDeleting = value === "" || options?.maxAge === 0;
            const maxAge = isDeleting
              ? 0
              : typeof options?.maxAge === "number" && options.maxAge < 7 * 24 * 60 * 60
                ? options.maxAge
                : 7 * 24 * 60 * 60;
            response.cookies.set(name, value, {
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              path: "/",
              maxAge,
            });
          });
        },
      },
    });

    // Refresca la sesión para asegurar tokens JWT actualizados
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // Rutas protegidas que exigen sesión activa del negocio
    const isProtectedRoute =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/agendas") ||
      pathname.startsWith("/sucursales");

    // Rutas exclusivas para usuarios sin autenticar
    const isAuthRoute =
      pathname.startsWith("/login") || pathname.startsWith("/register");

    if (isProtectedRoute && !user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      request.cookies.getAll().forEach((c) => {
        if (c.name.startsWith("sb-") || c.name.includes("auth")) {
          redirectResponse.cookies.set(c.name, "", {
            maxAge: 0,
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          });
        }
      });
      return redirectResponse;
    }

    if (isAuthRoute && user) {
      const redirectResponse = NextResponse.redirect(new URL("/dashboard", request.url));
      response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c.name, c.value, c));
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
