"use client";

import { ExternalLink, MapPin, Phone } from "lucide-react";
import { contact } from "@/lib/admission-data";
import Link from "next/link";
import { admission } from "@/lib/admission-data";
import { LogoFull } from "./Logo";
import { useLang } from "./Providers";

export default function Footer() {
  const { t } = useLang();
  const u = admission.university;
  return (
    <footer className="border-t border-slate-200/70 bg-white/50 dark:border-white/5 dark:bg-white/[0.02]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <LogoFull width={200} className="h-auto w-44" />
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("footer_note")}</p>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">{t("footer_links")}</h3>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><Link className="hover:text-brand" href="/chat">{t("nav_chat")}</Link></li>
            <li><Link className="hover:text-brand" href="/admission-guide">{t("nav_guide")}</Link></li>
            <li><Link className="hover:text-brand" href="/tools">{t("nav_tools")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-semibold">{t("footer_official")}</h3>
          <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
            <li><a className="inline-flex items-center gap-1.5 hover:text-brand" href={u.website} target="_blank" rel="noreferrer">{t("website")} <ExternalLink size={13} /></a></li>
            <li><a className="inline-flex items-center gap-1.5 hover:text-brand" title={t("portal_note")} href={u.online_admission_portal} target="_blank" rel="noreferrer">{t("portal")} <ExternalLink size={13} /></a></li>
            <li className="text-xs">{t("portal_note")}</li>
            <li className="flex gap-1.5"><MapPin size={15} className="mt-0.5 shrink-0" /> <span><b>{t("city_campus")}:</b> {contact.city_campus_address}</span></li>
            <li className="flex gap-1.5"><MapPin size={15} className="mt-0.5 shrink-0" /> <span><b>{t("permanent_campus")}:</b> {contact.permanent_campus_address}</span></li>
            <li className="flex gap-1.5"><Phone size={15} className="mt-0.5 shrink-0" /> <span>{[...contact.phones, ...contact.mobiles].map((n, i) => <a key={n} href={`tel:${n.replace(/\s/g, "")}`} className="hover:text-brand">{n}{i < contact.phones.length + contact.mobiles.length - 1 ? ", " : ""}</a>)}</span></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-slate-200/70 py-5 text-center text-xs text-slate-400 dark:border-white/5">
        © {new Date().getFullYear()} UnishohayAI · {u.name}
      </p>
    </footer>
  );
}
