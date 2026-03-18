import type { Metadata } from "next";
import "../globals.css";
import { i18n, type Locale } from "../../../i18n-config";
import { headers } from "next/headers";
import { ClientProviders } from "@/components/providers";
import { WorkspaceProvider } from "../../context/workspaceContext";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME,
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
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
