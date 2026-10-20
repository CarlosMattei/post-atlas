"use client";

import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";
import { I18nProvider } from "react-aria-components/I18nProvider";

export function ClientProviders({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <RouterProvider navigate={(href) => router.push(String(href))}>
      <I18nProvider locale={lang}>{children}</I18nProvider>
    </RouterProvider>
  );
}
