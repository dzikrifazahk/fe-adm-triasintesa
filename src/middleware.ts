import { i18n } from "../i18n-config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/", "/dashboard"];

interface RoutePermissions {
  [key: string]: string[];
}

const routePermissions: RoutePermissions = {
  "/loans": ["Loans"],
};

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  const locales: any = i18n.locales;
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages(
    locales
  );
  return matchLocale(languages, locales, i18n.defaultLocale);
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const crea = searchParams.get("crea");

  const segments = pathname.split("/");
  const locale = isLocale(segments[1]) ? segments[1] : i18n.defaultLocale;
  const basePath = `/${segments.slice(2).join("/")}`;

  const accessToken = request.cookies.get("accessToken")?.value;
  const role = request.cookies.get("role")?.value;
  const permsCookie = request.cookies.get("perms")?.value;
  const userPermissions = permsCookie ? JSON.parse(permsCookie) : [];

  const isStaticAsset =
    [
      "/_next",
      "/templates",
      "/static",
      "/assets",
      "/favicon.ico",
      "/manifest.json",
    ].some((p) => pathname.startsWith(p)) ||
    [".ico", ".png", ".jpg", ".webp", ".svg", ".json"].some((ext) =>
      pathname.endsWith(ext)
    );

  if (isStaticAsset) return NextResponse.next();

  if (pathname.startsWith("/api/signin")) return NextResponse.next();
  if (pathname.startsWith("/api/forgot-pass")) return NextResponse.next();

  const missingLocale = i18n.locales.every(
    (loc) => !pathname.startsWith(`/${loc}/`) && pathname !== `/${loc}`
  );

  if (missingLocale) {
    const resolvedLocale = getLocale(request);
    const redirectUrl = new URL(`/${resolvedLocale}${pathname}`, request.url);

    // preserve query string termasuk ?crea=
    request.nextUrl.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });

    return NextResponse.redirect(redirectUrl);
  }

  // allow access kalau ada query ?crea=
  const hasCreaToken = !!crea;

  if (basePath === "/signin") {
    if (accessToken && !hasCreaToken) {
      return NextResponse.redirect(new URL(`/${locale}/`, request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith(`/${locale}/dashboard`) && role === "4") {
    return NextResponse.redirect(new URL(`/${locale}/forbidden`, request.url));
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    basePath.startsWith(route)
  );

  if (isProtectedRoute && !accessToken && !hasCreaToken) {
    return NextResponse.redirect(new URL(`/${locale}/signin`, request.url));
  }

  const shouldForceDashboard =
    role === "admin" &&
    accessToken &&
    !hasCreaToken &&
    !pathname.startsWith(`/${locale}/dashboard`) &&
    !pathname.startsWith(`/${locale}/signin`) &&
    !pathname.startsWith(`/${locale}/forbidden`) &&
    !pathname.startsWith(`/${locale}/api/`);

  if (shouldForceDashboard) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  const requiredPermissions = routePermissions[basePath];
  if (requiredPermissions?.length) {
    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );
    if (!hasPermission) {
      return NextResponse.redirect(
        new URL(`/${locale}/forbidden`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export function isLocale(value: string): value is "en" | "id" {
  return (i18n.locales as readonly string[]).includes(value);
}