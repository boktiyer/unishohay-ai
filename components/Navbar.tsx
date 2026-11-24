"use client";

import clsx from "clsx";
import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import InstallApp from "./InstallApp";
import Logo from "./Logo";
import { useLang } from "./Providers";

const links = [
  { href: "/", key: "nav_home" },
  { href: "/chat", key: "nav_chat" },
  { href: "/admission-guide", key: "nav_guide" },
  { href: "/tools", key: "nav_tools" },
] as const;

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-xl border border-slate-200 bg-white/70 p-0.5 text-sm font-semibold dark:border-white/10 dark:bg-white/5" role="group" aria-label="Language">
      {(["bn", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={clsx("rounded-lg px-2.5 py-1 transition", lang === l ? "bg-brand-gradient text-white shadow" : "text-slate-500 hover:text-brand dark:text-slate-400")}
        >
          {l === "bn" ? "বাংলা" : "EN"}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser-only state after mount so server and client HTML match
  useEffect(() => setMounted(true), []);
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white/70 transition hover:text-brand dark:border-white/10 dark:bg-white/5"
      aria-label="Toggle theme"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export default function Navbar() {
  const { t } = useLang();
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/95 md:bg-white/70 md:backdrop-blur-xl dark:border-white/5 dark:bg-night/95 md:dark:bg-night/70">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={clsx(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                path === l.href ? "bg-brand/10 text-brand dark:text-brand-violet" : "text-slate-600 hover:text-brand dark:text-slate-300"
              )}
            >
              {t(l.key)}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <InstallApp />
          <LangToggle />
          <ThemeToggle />
          <button className="grid h-9 w-9 place-items-center rounded-xl md:hidden" onClick={() => setOpen(!open)} aria-label={t("menu")}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-slate-200/60 px-4 py-2 md:hidden dark:border-white/5">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={clsx("block rounded-lg px-3 py-2.5 font-medium", path === l.href && "bg-brand/10 text-brand")}>
              {t(l.key)}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
