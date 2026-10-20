import type { Metadata } from "next";
import { headers } from "next/headers";
import {isRTL} from 'react-aria-components/I18nProvider';
import { Geist, Geist_Mono } from "next/font/google";
import { ClientProviders } from "./provider";
import { Sidebar } from "./components/sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Post Atlas",
  description: "Organize, agende e publique seus posts.",
};

export const instant = false;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const acceptLanguage = (await headers()).get("accept-language");
  const lang = acceptLanguage?.split(/[,;]/)[0] || "en-US";

  return (
    <html
      lang={lang}
      dir={isRTL(lang) ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-ds focus:bg-ds-surface focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-ds-text focus:outline-2 focus:outline-offset-2 focus:outline-ds-focus"
        >
          Pular para o conteúdo
        </a>
        <ClientProviders lang={lang}>
          <div className="flex min-h-screen">
            <Sidebar />
            <main
              id="conteudo"
              tabIndex={-1}
              className="min-w-0 flex-1 outline-none"
            >
              {children}
            </main>
          </div>
        </ClientProviders>
      </body>
    </html>
  );
}
