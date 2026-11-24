"use client";

import clsx from "clsx";
import {
  ArrowRight, BookOpen, Calculator, CalendarCheck, ChevronDown, Clock, Database, GraduationCap,
  Languages, MessageSquare, Search, ShieldCheck, Sparkles, Wallet,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { allFaqs, formatDate, toLangDigits, VERIFIED } from "@/lib/admission-data";
import Countdown from "./Countdown";
import type { DictKey } from "@/lib/i18n";
import { LogoMark } from "./Logo";
import { useLang } from "./Providers";


export function GlowBg() {
  return (
    // Soft glow drawn with radial gradients (no blur filter: much cheaper to paint on phones)
    <div aria-hidden className="glow-bg pointer-events-none absolute inset-0 -z-10" />
  );
}

export function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

function ChatMockup() {
  const { lang } = useLang();
  const q = lang === "bn" ? "সিএসই পড়তে মোট খরচ কত?" : "What is the total fee for CSE?";
  const a =
    lang === "bn"
      ? "সিএসই প্রোগ্রামে মোট ১৫৬ ক্রেডিট, প্রতি ক্রেডিট ২,৩০০ টাকা। মোট ফি **৩,৭৬,৮০০ টাকা** (এইচএসসি) — ভর্তি ফি সহ।"
      : "CSE has 156 credits at BDT 2,300 per credit. Total fee is **BDT 3,76,800** (HSC background), including the admission fee.";
  const [before, bold, after] = a.split("**");
  return (
    <div
      style={{ animationDelay: "200ms" }}
      className="anim-up glass w-full max-w-md rounded-3xl p-5"
    >
      <div className="mb-4 flex items-center gap-2 border-b border-slate-200/70 pb-3 dark:border-white/10">
        <LogoMark size={36} />
        <div className="text-sm font-semibold">UnishohayAI</div>
        <span className="ml-auto flex items-center gap-1 text-xs text-emerald-500"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Online</span>
      </div>
      <div className="space-y-3 text-sm">
        <div className="bg-brand-gradient ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-white">{q}</div>
        <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 shadow-sm dark:bg-white/10">
          {before}<strong>{bold}</strong>{after}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-brand dark:text-brand-violet"><Database size={13} /> {lang === "bn" ? "সূত্র: অফিসিয়াল ভর্তি ডেটা" : "Source: Official Admission Data"}</div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { t, lang } = useLang();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const stats: [typeof Clock, string, DictKey][] = [
    [Clock, "24/7", "stat_1"], [Languages, toLangDigits(2, lang), "stat_2"], [GraduationCap, toLangDigits("9 + 10", lang), "stat_3"], [CalendarCheck, formatDate(VERIFIED, lang), "stat_4"],
  ];
  const features: [typeof Clock, DictKey, DictKey][] = [
    [GraduationCap, "f1_t", "f1_d"], [Wallet, "f2_t", "f2_d"], [BookOpen, "f3_t", "f3_d"],
    [Languages, "f4_t", "f4_d"], [ShieldCheck, "f5_t", "f5_d"], [Calculator, "f6_t", "f6_d"],
  ];
  const steps: [typeof Clock, DictKey, DictKey][] = [
    [MessageSquare, "h1_t", "h1_d"], [Search, "h2_t", "h2_d"], [Sparkles, "h3_t", "h3_d"],
  ];

  return (
    <main>
      <Countdown />

      {/* Hero */}
      <section className="relative isolate">
        <GlowBg />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-2 lg:pt-24">
          <div>
            <span className="anim-up glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-brand dark:text-brand-violet">
              <Sparkles size={15} /> {t("hero_badge")}
            </span>
            <h1 style={{ animationDelay: "60ms" }} className="anim-up mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero_title_1")} <span className="text-gradient">{t("hero_title_2")}</span>
            </h1>
            <p style={{ animationDelay: "120ms" }} className="anim-up mt-5 max-w-xl text-lg text-slate-600 dark:text-slate-300">{t("hero_sub")}</p>
            <div style={{ animationDelay: "180ms" }} className="anim-up mt-8 flex flex-wrap gap-3">
              <Link href="/chat" className="btn-primary px-6 py-3">{t("start_chat")} <ArrowRight size={18} /></Link>
              <Link href="/admission-guide" className="btn-ghost px-6 py-3">{t("view_guide")}</Link>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end"><ChatMockup /></div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="glass grid grid-cols-2 gap-6 rounded-3xl p-6 md:grid-cols-4">
          {stats.map(([Icon, value, key]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand dark:text-brand-violet"><Icon size={20} /></span>
              <div>
                <div className="text-xl font-extrabold">{value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400">{t(key)}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">{t("data_note")}</p>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <SectionTitle title={t("features_title")} sub={t("features_sub")} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([Icon, title, desc]) => (
            <div key={title} className="glass group rounded-2xl p-6 transition hover:-translate-y-1">
              <span className="bg-brand-gradient grid h-12 w-12 place-items-center rounded-xl text-white shadow-lg shadow-brand/25"><Icon size={22} /></span>
              <h3 className="mt-5 text-lg font-bold">{t(title)}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t(desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <SectionTitle title={t("how_title")} />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map(([Icon, title, desc], i) => (
            <div key={title} className="relative text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand/10 text-brand dark:text-brand-violet"><Icon size={26} /></div>
              <div className="mt-2 text-xs font-bold tracking-widest text-brand-violet">0{i + 1}</div>
              <h3 className="mt-1 text-lg font-bold">{t(title)}</h3>
              <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">{t(desc)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <SectionTitle title={t("faq_title")} />
        <div className="space-y-3">
          {allFaqs.slice(0, 12).map((f, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className="glass overflow-hidden rounded-2xl">
                <button onClick={() => setOpenFaq(open ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold" aria-expanded={open}>
                  {lang === "bn" ? f.q_bn : f.q_en}
                  <ChevronDown size={18} className={clsx("shrink-0 transition", open && "rotate-180")} />
                </button>
                {open && <p className="px-5 pb-4 text-slate-600 dark:text-slate-300">{lang === "bn" ? f.a_bn : f.a_en}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="bg-brand-gradient relative overflow-hidden rounded-3xl px-6 py-14 text-center text-white shadow-2xl shadow-brand/30">
          <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <h2 className="text-3xl font-extrabold sm:text-4xl">{t("cta_title")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">{t("cta_sub")}</p>
          <Link href="/chat" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-brand shadow-lg transition hover:scale-[1.02]">
            {t("start_chat")} <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
