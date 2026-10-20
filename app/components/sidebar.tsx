"use client";

import { usePathname } from "next/navigation";
import { Link } from "react-aria-components/Link";
import type { ComponentType, SVGProps } from "react";
import {
  ArchiveIcon,
  CalendarIcon,
  ConnectionIcon,
  HomeIcon,
  LogoutIcon,
  LogsIcon,
  PostsIcon,
  SettingsIcon,
} from "./icons";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const primaryItems: NavItem[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/posts", label: "Posts", icon: PostsIcon },
  { href: "/calendario", label: "Calendário", icon: CalendarIcon },
  { href: "/arquivados", label: "Arquivados", icon: ArchiveIcon },
  { href: "/conexao", label: "Conexão", icon: ConnectionIcon },
  { href: "/logs", label: "Logs", icon: LogsIcon },
  { href: "/configuracoes", label: "Configurações", icon: SettingsIcon },
];

const secondaryItems: NavItem[] = [
  { href: "/sair", label: "Sair", icon: LogoutIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/"
    ? pathname === "/"
    : pathname === href || pathname.startsWith(`${href}/`);
}

function navItemClassName(active: boolean) {
  return [
    "flex h-8 w-full items-center justify-center gap-0 rounded-ds px-0 text-sm leading-5 no-underline outline-none transition-colors md:justify-start md:gap-3 md:px-3",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-focus",
    active
      ? "bg-ds-surface-selected font-semibold text-ds-selected-text"
      : "font-medium text-ds-text-subtle hover:bg-ds-surface-hover hover:text-ds-text",
  ].join(" ");
}

function NavListItem({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={navItemClassName(active)}
      >
        <Icon className="size-5 shrink-0" />
        <span className="hidden truncate md:inline">{item.label}</span>
      </Link>
    </li>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 flex h-screen w-16 shrink-0 flex-col border-r border-ds-line bg-ds-surface md:w-60">
      <div className="flex h-14 shrink-0 items-center justify-center gap-3 px-4 md:justify-start">
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-ds bg-ds-brand text-[13px] font-bold text-white"
        >
          A
        </span>
        <span className="hidden min-w-0 flex-col md:flex">
          <span className="truncate text-sm font-semibold leading-5 text-ds-text">
            Post Atlas
          </span>
          <span className="truncate text-[11px] leading-4 text-ds-text-subtle">
            Espaço de trabalho
          </span>
        </span>
      </div>

      <nav
        aria-label="Navegação principal"
        className="flex flex-1 flex-col overflow-y-auto px-2 pb-3 pt-1"
      >
        <ul className="flex flex-col gap-0.5">
          {primaryItems.map((item) => (
            <NavListItem key={item.href} item={item} />
          ))}
        </ul>

        <ul className="mt-auto flex flex-col gap-0.5 border-t border-ds-line pt-3">
          {secondaryItems.map((item) => (
            <NavListItem key={item.href} item={item} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
