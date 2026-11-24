"use client";

import clsx from "clsx";
import { ArrowUpRight, Calculator, CircleCheck, CircleX, GitCompare, HelpCircle, Info, UserCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  admission, checkEligibility, eligibility, fees, formatBDT, programName, programs, toLangDigits,
  type Background, type EligibilityResult,
} from "@/lib/admission-data";
import AdmissionChecklist from "./AdmissionChecklist";
import PageShell, { Card } from "./PageShell";
import { useLang } from "./Providers";

function ProgramSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  const { lang } = useLang();
  return (
    <label className="block text-sm font-medium">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input mt-1.5">
        {programs.map((p) => <option key={p.id} value={p.id}>{programName(p, lang)}</option>)}
      </select>
    </label>
  );
}

const useBdt = () => {
  const { lang } = useLang();
  return (n: number | null | undefined) => (n == null ? "—" : `${lang === "bn" ? "৳" : "BDT "}${formatBDT(n, lang)}`);
};

function EligibilityChecker() {
  const { t, lang } = useLang();
  const [program, setProgram] = useState("cse");
  const [ssc, setSsc] = useState("");
  const [hsc, setHsc] = useState("");
  const [bg, setBg] = useState<Background>("science");
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [error, setError] = useState("");

  const check = (e: React.FormEvent) => {
    e.preventDefault();
    const s = parseFloat(ssc), h = parseFloat(hsc);
    if (!(s >= 1 && s <= 5 && h >= 1 && h <= 5)) {
      setError(t("gpa_range"));
      setResult(null);
      return;
    }
    setError("");
    setResult(checkEligibility(program, s, h, bg));
  };

  const fmt = (n: number) => toLangDigits(n.toFixed(2), lang);
  const tone = result?.status === "eligible" ? "green" : result?.status === "not_eligible" ? "red" : "amber";
  const Icon = tone === "green" ? CircleCheck : tone === "red" ? CircleX : HelpCircle;

  return (
    <Card icon={UserCheck} title={t("elig_checker")}>
      <form onSubmit={check} className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><ProgramSelect label={t("program")} value={program} onChange={(v) => { setProgram(v); setResult(null); }} /></div>
        <label className="text-sm font-medium">{t("ssc_gpa")}
          <input className="input mt-1.5" type="number" inputMode="decimal" step="0.01" min="1" max="5" placeholder="4.50" value={ssc} onChange={(e) => setSsc(e.target.value)} required />
        </label>
        <label className="text-sm font-medium">{t("hsc_gpa")}
          <input className="input mt-1.5" type="number" inputMode="decimal" step="0.01" min="1" max="5" placeholder="4.25" value={hsc} onChange={(e) => setHsc(e.target.value)} required />
        </label>
        <label className="text-sm font-medium sm:col-span-2">{t("background")}
          <select className="input mt-1.5" value={bg} onChange={(e) => setBg(e.target.value as Background)}>
            <option value="science">{t("bg_science")}</option>
            <option value="commerce">{t("bg_commerce")}</option>
            <option value="arts">{t("bg_arts")}</option>
            <option value="diploma">{t("bg_diploma")}</option>
          </select>
        </label>
        <button className="btn-primary sm:col-span-2">{t("check")}</button>
      </form>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      {result && (
        <div className={clsx("mt-5 space-y-2 rounded-2xl border p-4 text-sm", {
          "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200": tone === "green",
          "border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200": tone === "red",
          "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200": tone === "amber",
        })}>
          <p className="flex gap-2 font-semibold"><Icon size={18} className="shrink-0" />
            {t(result.status === "eligible" ? "r_eligible" : result.status === "not_eligible" ? "r_not" : "r_unknown")}
          </p>
          {result.needsScienceConfirm && <p>{t("r_science")}</p>}
          {result.status === "eligible" && (
            <p>{t(result.directAdmission ? "r_direct" : "r_test", { c: fmt(result.combined), t: fmt(result.directThreshold) })}</p>
          )}
          <p className="flex items-center gap-1.5 text-xs opacity-80"><Info size={13} /> {t("confirm_note")}</p>
        </div>
      )}
    </Card>
  );
}

function FeeCalculator() {
  const { t, lang } = useLang();
  const bdt = useBdt();
  const [program, setProgram] = useState("cse");
  const [bg, setBg] = useState<"hsc" | "diploma">("hsc");
  const f = fees[program];
  const total = bg === "diploma" ? f.total_fee_diploma : f.total_fee_hsc;
  const af = admission.tuition_fees.admission_fee;

  return (
    <Card icon={Calculator} title={t("fee_calc")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProgramSelect label={t("program")} value={program} onChange={setProgram} />
        <label className="text-sm font-medium">{t("background")}
          <select className="input mt-1.5" value={bg} onChange={(e) => setBg(e.target.value as "hsc" | "diploma")}>
            <option value="hsc">{t("bg_hsc")}</option>
            <option value="diploma">{t("bg_diploma")}</option>
          </select>
        </label>
      </div>
      <dl className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 text-sm dark:divide-white/10 dark:border-white/10">
        <Row k={t("admission_fee")} v={`${bdt(af)} (${t("non_refundable")})`} />
        <Row k={t("credits")} v={toLangDigits(f.total_credits, lang)} />
        <Row k={t("per_credit")} v={bdt(f.tuition_per_credit)} />
        {bg === "hsc" && <Row k={t("tuition_part")} v={bdt(f.total_credits * f.tuition_per_credit)} />}
        <Row k={t("total")} v={total == null ? t("na") : bdt(total)} strong />
      </dl>
      {total == null && <p className="mt-3 text-sm text-amber-600 dark:text-amber-300">{t("fee_na")}</p>}
      <p className="mt-3 flex gap-1.5 text-xs text-slate-500 dark:text-slate-400"><Info size={13} className="mt-0.5 shrink-0" /> {t("fee_note")} {t("confirm_note")}.</p>
    </Card>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div className={clsx("flex justify-between gap-4 px-4 py-3", strong && "bg-brand/5 font-bold")}>
      <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
      <dd className={clsx(strong && "text-gradient text-base")}>{v}</dd>
    </div>
  );
}

function DepartmentComparison() {
  const { t, lang } = useLang();
  const bdt = useBdt();
  const [a, setA] = useState("cse");
  const [b, setB] = useState("eee");
  const ids = [a, b];
  const gpa = (id: string) => {
    const e = eligibility[id];
    return e.min_ssc_gpa == null ? t("na") : `${toLangDigits(e.min_ssc_gpa.toFixed(2), lang)} / ${toLangDigits((e.min_hsc_gpa ?? 0).toFixed(2), lang)}`;
  };
  const rows: [string, (id: string) => string][] = [
    [t("credits"), (id) => toLangDigits(fees[id].total_credits, lang)],
    [t("per_credit"), (id) => bdt(fees[id].tuition_per_credit)],
    [t("total_hsc"), (id) => bdt(fees[id].total_fee_hsc)],
    [t("total_diploma"), (id) => bdt(fees[id].total_fee_diploma)],
    [t("min_gpa"), gpa],
  ];
  const name = (id: string) => programName(programs.find((p) => p.id === id)!, lang);

  return (
    <Card icon={GitCompare} title={t("compare")} className="lg:col-span-2">
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t("select_two")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <ProgramSelect label="A" value={a} onChange={setA} />
        <ProgramSelect label="B" value={b} onChange={setB} />
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              <th className="py-2 pr-4" />
              {ids.map((id, i) => <th key={i} className="py-2 pr-4 font-semibold text-brand dark:text-brand-violet">{name(id)}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label} className="border-b border-slate-100 dark:border-white/5">
                <td className="py-2.5 pr-4 text-slate-500 dark:text-slate-400">{label}</td>
                {ids.map((id, i) => <td key={i} className="py-2.5 pr-4 font-medium">{fn(id)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Link
        href={`/chat?q=${encodeURIComponent(lang === "bn" ? `${name(a)} এবং ${name(b)} এর মধ্যে তুলনা করুন` : `Compare ${name(a)} and ${name(b)}`)}`}
        className="btn-ghost mt-5 text-sm"
      >
        {t("ask_ai")} <ArrowUpRight size={15} />
      </Link>
    </Card>
  );
}

export default function AdmissionTools() {
  const { t } = useLang();
  return (
    <PageShell title={t("tools_title")} sub={t("tools_sub")}>
      <div className="grid gap-6 lg:grid-cols-2">
        <EligibilityChecker />
        <FeeCalculator />
        <DepartmentComparison />
        <div className="lg:col-span-2"><AdmissionChecklist /></div>
      </div>
    </PageShell>
  );
}
