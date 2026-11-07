"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Menu, Sun, Users } from "lucide-react";
import { useT } from "./i18n";

const items = [
  { href: "/", key: "home", Icon: Sun },
  { href: "/cases", key: "cases", Icon: BookOpen },
  { href: "/dates", key: "dates", Icon: CalendarDays },
  { href: "/clients", key: "clients", Icon: Users },
  { href: "/more", key: "more", Icon: Menu },
] as const;

export function BottomNav() {
  const { t } = useT();
  const path = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-ink bg-paper"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-xl">
        {items.map(({ href, key, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 text-[13px] ${
                  active ? "font-bold text-ink" : "text-ink-soft"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={24} strokeWidth={active ? 2.4 : 1.8} />
                <span>{t.nav[key]}</span>
                <span className={`h-[3px] w-6 rounded-full ${active ? "bg-red" : "bg-transparent"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
