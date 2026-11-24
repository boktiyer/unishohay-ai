"use client";

import { CalendarDays, CircleAlert, ClipboardList, CreditCard, FileText, GraduationCap, ListOrdered, Phone, Wallet } from "lucide-react";
import { admission, eligibility, fees, formatBDT, programName, programs, toLangDigits } from "@/lib/admission-data";
import PageShell, { Card, NotAvailable } from "./PageShell";
import { useLang } from "./Providers";

export default function AdmissionGuide() {
  const { t, lang } = useLang();
  const tf = admission.tuition_fees;
  const proc = admission.admission_procedure;
  const bdt = (n: number | null) => (n == null ? "—" : `${lang === "bn" ? "৳" : "BDT "}${formatBDT(n, lang)}`);
  const gpa = (n: number | null) => (n == null ? t("na") : toLangDigits(n.toFixed(2), lang));

  const d = admission.admission_dates;
  const docs = admission.required_documents.bachelors;
  const pay = admission.payment_policy;
  const dates: [string, string][] = [
    [t("d_start"), d.admission_starts],
    [t("d_direct"), d.bachelors.direct_admission_last_date],
    [t("d_test_apply"), d.bachelors.last_date_to_apply_for_written_test],
    [t("d_test"), d.bachelors.written_test],
    [t("d_result"), d.bachelors.result_publication],
    [t("d_admission"), d.bachelors.admission_period],
    [t("d_class"), d.intake],
    [t("d_orientation"), d.bachelors.orientation ?? t("na")],
  ];
  const info: [string, React.ReactNode][] = [
    [t("admission_fee"), <>{bdt(tf.admission_fee)} ({t("non_refundable")})</>],
    [t("form_price"), bdt(tf.admission_form_price)],
    [t("scholarship"), <ul className="list-disc space-y-1 pl-4">{admission.scholarships.items.map((s) => <li key={s}>{s}</li>)}</ul>],
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
          <div><dt className="font-semibold">{t("special")}</dt><dd className="text-slate-500 dark:text-slate-400">{admission.eligibility.special_provision}</dd></div>
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

      <Card icon={CalendarDays} title={t("dates_title")}>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {dates.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-slate-200 px-4 py-3 dark:border-white/10">
              <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card icon={FileText} title={t("docs_title")}>
          {([["at_submission", docs.at_form_submission], ["at_admission", docs.at_admission]] as const).map(([k, list]) => (
            <div key={k} className="mb-4">
              <h3 className="mb-2 font-semibold">{t(k)}</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">{list.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          ))}
          <NotAvailable text={admission.required_documents.note} />
        </Card>
        <Card icon={CreditCard} title={t("payment_title")}>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">{pay.rules.map((r) => <li key={r}>{r}</li>)}</ul>
          <dl className="mt-4 space-y-2 text-sm">
            {pay.payment_channels.banks.map((b) => (
              <div key={b.bank}><dt className="font-semibold">{b.bank}</dt><dd className="text-slate-500 dark:text-slate-400">A/C {b.account_no}, {b.branch}</dd></div>
            ))}
            <div><dt className="font-semibold">bKash</dt><dd className="text-slate-500 dark:text-slate-400">{pay.payment_channels.bkash.how}</dd></div>
            <div><dt className="font-semibold">Rocket</dt><dd className="text-slate-500 dark:text-slate-400">{pay.payment_channels.rocket.how}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{pay.payment_channels.bank_note}</p>
        </Card>
      </div>

      <div className="grid gap-6">
        <Card icon={Phone} title={t("contacts_title")}>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {pay.payment_query_contacts.map((c) => (
              <li key={c.phone} className="flex justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10">
                <span>{c.name}{"for" in c && c.for ? <span className="block text-xs text-slate-400">{c.for}</span> : null}</span>
                <a href={`tel:${c.phone}`} className="font-semibold text-brand dark:text-brand-violet">{c.phone}</a>
              </li>
            ))}
          </ul>
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
