import type { Metadata, Viewport } from "next";
import "../globals.css";
import { i18n, type Locale } from "../../../i18n-config";
import { headers } from "next/headers";
import { ClientProviders } from "@/components/providers";
import { WorkspaceProvider } from "../../context/workspaceContext";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: process.env.NEXT_PUBLIC_APP_NAME,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#2a56b8",
  width: "device-width",
  initialScale: 1,
};

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}) {
  const params = await props.params;
  const { children } = props;

  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent ?? "");

  return (
    <html lang={params.lang} suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body className="">
        <ClientProviders isMobile={isMobile}>
          <WorkspaceProvider>{children}</WorkspaceProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
