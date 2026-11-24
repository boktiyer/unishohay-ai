"use client";

import { CircleAlert, ClipboardList, FileText, GraduationCap, ListOrdered, Wallet } from "lucide-react";
import { admission, eligibility, fees, formatBDT, programName, programs, toLangDigits } from "@/lib/admission-data";
import PageShell, { Card, NotAvailable } from "./PageShell";
import { useLang } from "./Providers";

export default function AdmissionGuide() {
  const { t, lang } = useLang();
  const tf = admission.tuition_fees;
  const proc = admission.admission_procedure;
  const bdt = (n: number | null) => (n == null ? "—" : `${lang === "bn" ? "৳" : "BDT "}${formatBDT(n, lang)}`);
  const gpa = (n: number | null) => (n == null ? t("na") : toLangDigits(n.toFixed(2), lang));

  const info: [string, React.ReactNode][] = [
    [t("admission_fee"), <>{bdt(tf.admission_fee)} ({t("non_refundable")})</>],
    [t("form_price"), bdt(tf.admission_form_price)],
    [t("direct"), lang === "bn" ? proc.steps[2].bn : proc.steps[2].en],
    [t("deadline"), admission.admission_dates.application_deadline ?? t("na")],
    [t("scholarship"), admission.scholarships.amounts_or_percentages ?? admission.scholarships.summary],
    [t("masters"), admission.departments.masters_programs.join(", ")],
  ];

  return (
    <PageShell title={t("guide_title")} sub={t("guide_sub")}>
      {admission.demo_data && <NotAvailable text={t("demo_flag")} />}

      <Card icon={ListOrdered} title={t("steps_title")}>
        <ol className="space-y-4">
          {proc.steps.map((s, i) => (
            <li key={i} className="flex gap-4">
              <span className="bg-brand-gradient grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold text-white">{toLangDigits(i + 1, lang)}</span>
              <p className="pt-1">{lang === "bn" ? s.bn : s.en}</p>
            </li>
          ))}
        </ol>
        <a href={admission.university.online_admission_portal} target="_blank" rel="noreferrer" className="btn-primary mt-6">{t("portal")}</a>
      </Card>

      <Card icon={GraduationCap} title={t("elig_title")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="py-2 pr-4">{t("program")}</th><th className="py-2 pr-4">{t("min_gpa")}</th><th className="py-2">{t("published")}</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => {
                const e = eligibility[p.id];
                return (
                  <tr key={p.id} className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 pr-4 font-medium">{programName(p, lang)}</td>
                    <td className="py-2.5 pr-4">{e.min_ssc_gpa == null ? t("na") : `${gpa(e.min_ssc_gpa)} / ${gpa(e.min_hsc_gpa)}`}</td>
                    <td className="py-2.5 text-slate-500 dark:text-slate-400">{e.published_text ?? t("na")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
          <div><dt className="font-semibold">{t("o_a_level")}</dt><dd className="text-slate-500 dark:text-slate-400">{admission.eligibility.o_a_level}</dd></div>
          <div><dt className="font-semibold">{t("special")}</dt><dd className="text-slate-500 dark:text-slate-400">{admission.eligibility.special_provision} ({t("na")})</dd></div>
        </dl>
      </Card>

      <Card icon={Wallet} title={t("fees_title")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-400">
              <tr className="border-b border-slate-200 dark:border-white/10">
                <th className="py-2 pr-4">{t("program")}</th><th className="py-2 pr-4">{t("credits")}</th><th className="py-2 pr-4">{t("per_credit")}</th>
                <th className="py-2 pr-4">{t("total_hsc")}</th><th className="py-2">{t("total_diploma")}</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => {
                const f = fees[p.id];
                return (
                  <tr key={p.id} className="border-b border-slate-100 dark:border-white/5">
                    <td className="py-2.5 pr-4 font-medium">{programName(p, lang)}</td>
                    <td className="py-2.5 pr-4">{toLangDigits(f.total_credits, lang)}</td>
                    <td className="py-2.5 pr-4">{bdt(f.tuition_per_credit)}</td>
                    <td className="py-2.5 pr-4 font-semibold">{bdt(f.total_fee_hsc)}</td>
                    <td className="py-2.5">{bdt(f.total_fee_diploma)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">{tf.notes} {t("fee_note")}</p>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card icon={FileText} title={t("docs_title")}>
          <NotAvailable text={t("na_long")} />
        </Card>
        <Card icon={ClipboardList} title={t("info_title")}>
          <dl className="space-y-3 text-sm">
            {info.map(([k, v]) => (
              <div key={k}><dt className="font-semibold">{k}</dt><dd className="text-slate-500 dark:text-slate-400">{v}</dd></div>
            ))}
          </dl>
        </Card>
      </div>

      <p className="flex items-center justify-center gap-2 text-center text-xs text-slate-400">
        <CircleAlert size={14} /> {t("last_verified")}: {admission.university.last_verified} · <a className="underline" href={admission.university.source_url} target="_blank" rel="noreferrer">portcity.edu.bd</a>
      </p>
    </PageShell>
  );
}
