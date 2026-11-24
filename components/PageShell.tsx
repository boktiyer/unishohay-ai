"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import Footer from "./Footer";
import { GlowBg } from "./Landing";

export default function PageShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <>
      <main className="relative isolate mx-auto max-w-6xl px-4 pb-20 pt-12 sm:px-6">
        <GlowBg />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl">
            <span className="text-gradient">{title}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500 dark:text-slate-400">{sub}</p>
        </motion.div>
        <div className="space-y-6">{children}</div>
      </main>
      <Footer />
    </>
  );
}

export function Card({ icon: Icon, title, children, className = "" }: { icon: LucideIcon; title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass rounded-3xl p-5 sm:p-7 ${className}`}
    >
      <h2 className="mb-5 flex items-center gap-3 text-xl font-bold">
        <span className="bg-brand-gradient grid h-10 w-10 place-items-center rounded-xl text-white"><Icon size={19} /></span>
        {title}
      </h2>
      {children}
    </motion.section>
  );
}

export function NotAvailable({ text }: { text: string }) {
  return <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">{text}</p>;
}
