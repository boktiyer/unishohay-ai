"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "./Providers";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Registers the service worker and shows an "Install app" button when the browser allows it. */
export default function InstallApp() {
  const { lang } = useLang();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferred) return null;
  const label = lang === "bn" ? "অ্যাপ ইনস্টল" : "Install app";

  return (
    <button
      onClick={async () => {
        await deferred.prompt();
        await deferred.userChoice;
        setDeferred(null);
      }}
      className="grid h-9 place-items-center rounded-xl border border-slate-200 bg-white/70 px-2.5 text-sm font-semibold text-brand transition hover:bg-brand/10 sm:flex sm:gap-1.5 dark:border-white/10 dark:bg-white/5 dark:text-brand-violet"
      aria-label={label}
      title={label}
    >
      <Download size={16} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
