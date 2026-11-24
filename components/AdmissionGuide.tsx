"use client";

import {
  BookOpenCheck, Building2, CalendarDays, CircleAlert, ClipboardList, CreditCard, ExternalLink, FileText,
  GraduationCap, HeartPulse, ListOrdered, Network, NotebookPen, Phone, Scale, UserRound, Wallet,
} from "lucide-react";
import { admission as A, bdt, contact, eligibility, fees, formatDate, links, programName, programs, toLangDigits, VERIFIED } from "@/lib/admission-data";
import PageShell, { Card, NotAvailable } from "./PageShell";
import { useLang } from "./Providers";

/* ---------- small building blocks ---------- */

function Table({ head, rows, min = "min-w-[520px]" }: { head: React.ReactNode[]; rows: React.ReactNode[][]; min?: string }) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className={`w-full ${min} text-left text-sm`}>
        <thead className="text-slate-500 dark:text-slate-400">
          <tr className="border-b border-slate-200 dark:border-white/10">
            {head.map((h, i) => <th key={i} className="py-2 pr-4 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 align-top dark:border-white/5">
              {r.map((c, j) => <td key={j} className={`py-2.5 pr-4 ${j === 0 ? "font-medium" : ""}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Bullets = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
);
const H3 = ({ children }: { children: React.ReactNode }) => <h3 className="mb-2 mt-5 font-semibold first:mt-0">{children}</h3>;
const Official = ({ href, label }: { href: string; label: string }) => (
  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline dark:text-brand-violet">
    {label} <ExternalLink size={13} />
  </a>
);

const SECTIONS = [
  ["steps", "steps_title"], ["dates", "dates_title"], ["elig", "elig_title"], ["fees", "fees_title"], ["masters", "masters_title"],
  ["test", "test_title"], ["docs", "docs_title"], ["pay", "payment_title"], ["academic", "academic_title"],
  ["campus", "campus_title"], ["leaders", "leadership_title"], ["depts", "dept_title"],
] as const;

export default function AdmissionGuide() {
  const { t, lang } = useLang();
  const money = (n: number | null | undefined) => bdt(n, lang);
  const d = (v: string | number) => toLangDigits(v, lang);
  const gpa = (n: number | null) => (n == null ? t("na") : d(n.toFixed(2)));

  const tf = A.tuition_fees;
  const proc = A.admission_procedure;
  const dt = A.admission_dates;
  const docs = A.required_documents;
  const pay = A.payment_policy;
  const mf = A.masters_programs_and_fees;
  const ax = A.admission_extra;
  const ar = A.academic_rules;
  const fac = A.facilities;

  const dates: [string, string][] = [
    [t("d_start"), dt.admission_starts],
    [t("d_direct"), dt.bachelors.direct_admission_last_date],
    [t("d_test_apply"), dt.bachelors.last_date_to_apply_for_written_test],
    [t("d_test"), dt.bachelors.written_test],
    [t("d_result"), dt.bachelors.result_publication],
    [t("d_admission"), dt.bachelors.admission_period],
    [t("d_class"), dt.intake],
    [t("d_orientation"), dt.bachelors.orientation ?? t("na")],
  ];

  return (
    <PageShell title={t("guide_title")} sub={t("guide_sub")}>
      {A.demo_data && <NotAvailable text={t("demo_flag")} />}

      {/* in-page navigation */}
      <nav aria-label={t("nav_jump")} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {SECTIONS.map(([id, key]) => (
          <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium hover:border-brand-violet/50 hover:text-brand dark:border-white/10 dark:bg-white/5">
            {t(key).replace(/\s*\(.*\)$/, "")}
          </a>
        ))}
      </nav>

      <div id="steps" className="scroll-mt-24">
        <Card icon={ListOrdered} title={t("steps_title")}>
          <ol className="space-y-4">
            {proc.steps.map((s, i) => (
              <li key={i} className="flex gap-4">
                <span className="bg-brand-gradient grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold text-white">{d(i + 1)}</span>
                <p className="pt-1">{lang === "bn" ? s.bn : s.en}</p>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href={A.university.online_admission_portal} target="_blank" rel="noreferrer" className="btn-primary">{t("portal")}</a>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t("portal_note")}</span>
          </div>
          <H3>{t("selection")}</H3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{ax.selection_basis}</p>
        </Card>
      </div>

      <div id="dates" className="scroll-mt-24">
        <Card icon={CalendarDays} title={t("dates_title")}>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {dates.map(([k, v]) => (
              <div key={k} className="rounded-xl border border-slate-200 px-4 py-3 dark:border-white/10">
                <dt className="text-slate-500 dark:text-slate-400">{k}</dt>
                <dd className="font-semibold">{/^\d{4}-\d{2}-\d{2}$/.test(v) ? formatDate(v, lang) : v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <div id="elig" className="scroll-mt-24">
        <Card icon={GraduationCap} title={t("elig_title")}>
          <Table
            head={[t("program"), t("min_gpa"), t("published")]}
            rows={programs.map((p) => {
              const e = eligibility[p.id];
              return [programName(p, lang), e.min_ssc_gpa == null ? t("na") : `${gpa(e.min_ssc_gpa)} / ${gpa(e.min_hsc_gpa)}`, e.published_text ?? e.note ?? t("na")];
            })}
          />
          <dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
            <div><dt className="font-semibold">{t("o_a_level")}</dt><dd className="text-slate-500 dark:text-slate-400">{A.eligibility.o_a_level}</dd></div>
            <div><dt className="font-semibold">{t("direct")}</dt><dd className="text-slate-500 dark:text-slate-400">{ax.written_test_exemption}</dd></div>
          </dl>
        </Card>
      </div>

      <div id="fees" className="scroll-mt-24">
        <Card icon={Wallet} title={t("fees_title")}>
          <Table
            min="min-w-[620px]"
            head={[t("program"), t("credits"), t("per_credit"), t("total_hsc"), t("total_diploma")]}
            rows={programs.map((p) => {
              const f = fees[p.id];
              return [programName(p, lang), d(f.total_credits) + (p.id === "bba" ? " *" : ""), money(f.tuition_per_credit), <b key="t">{money(f.total_fee_hsc)}</b>, money(f.total_fee_diploma)];
            })}
          />
          <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">* {tf.by_program.bba.credits_conflict_note}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {t("admission_fee")}: <b>{money(tf.admission_fee)}</b> ({t("non_refundable")}) · {t("form_price")}: {money(tf.admission_form_price)}. {t("fee_note")}
          </p>
        </Card>
      </div>

      <div id="masters" className="scroll-mt-24">
        <Card icon={BookOpenCheck} title={t("masters_title")}>
          <H3>{t("masters_fees")}</H3>
          <Table
            min="min-w-[560px]"
            head={[t("program"), t("bg"), t("credits"), t("per_credit"), t("total")]}
            rows={mf.programs.flatMap((p) => {
              const list = "fresh_graduates_by_background" in p ? p.fresh_graduates_by_background : "by_background" in p ? p.by_background : null;
              if (list) return list.map((b) => [p.name, b.background, d(b.credits), money(p.tuition_per_credit), <b key="t">{money(b.total_fee)}</b>]);
              const q = p as { credits: number; total_fee: number };
              return [[p.name, "—", d(q.credits), money(p.tuition_per_credit), <b key="t">{money(q.total_fee)}</b>]];
            })}
          />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t("job_note")} {t("fee_not_pub")}: {mf.fee_not_published.join(", ")}.</p>

          <H3>{t("masters_elig")}</H3>
          <Bullets items={ax.masters_minimum_qualifications.general} />
          <div className="mt-3">
            <Table head={[t("program"), t("published")]} rows={ax.masters_minimum_qualifications.by_program.map((r) => [r.program, r.requirement])} />
          </div>

          <H3>{t("masters_direct")}</H3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t("d_direct")}: <b>{formatDate(ax.masters_direct_admission.last_date, lang)}</b>. {ax.masters_direct_admission.note}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{ax.masters_direct_admission.programs.join(", ")}</p>

          <H3>{t("docs_title")}</H3>
          <div className="grid gap-4 md:grid-cols-2">
            <div><p className="mb-1 text-sm font-medium">{t("at_submission")}</p><Bullets items={ax.masters_required_documents.at_form_submission} /></div>
            <div><p className="mb-1 text-sm font-medium">{t("at_admission")}</p><Bullets items={ax.masters_required_documents.at_admission} /></div>
          </div>
        </Card>
      </div>

      <div id="test" className="scroll-mt-24">
        <Card icon={NotebookPen} title={t("test_title")}>
          <div className="grid gap-3 sm:grid-cols-2">
            {ax.written_test_marks.map((m) => (
              <div key={m.program_group} className="rounded-xl border border-slate-200 p-4 text-sm dark:border-white/10">
                <p className="font-semibold">{m.program_group} <span className="text-slate-400">({d(m.total)})</span></p>
                <ul className="mt-2 space-y-1">
                  {Object.entries(m.parts).map(([k, v]) => (
                    <li key={k} className="flex justify-between gap-3"><span className="text-slate-600 dark:text-slate-300">{k}</span><b>{d(v)}</b></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <H3>{t("test_exempt")}</H3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{ax.written_test_exemption}</p>
          <div className="mt-3"><Official href={links.admission_test} label={t("view_official")} /></div>
        </Card>
      </div>

      <div id="docs" className="scroll-mt-24 grid gap-6 md:grid-cols-2">
        <Card icon={FileText} title={t("docs_title")}>
          <H3>{t("at_submission")}</H3>
          <Bullets items={docs.bachelors.at_form_submission} />
          <H3>{t("at_admission")}</H3>
          <Bullets items={docs.bachelors.at_admission} />
          <div className="mt-4"><NotAvailable text={docs.note} /></div>
        </Card>
        <Card icon={ClipboardList} title={t("info_title")}>
          <dl className="space-y-3 text-sm">
            <div><dt className="font-semibold">{t("scholarship")}</dt><dd className="text-slate-500 dark:text-slate-400"><Bullets items={[...A.scholarships.items, A.scholarship_extra.note]} /></dd></div>
            <div><dt className="font-semibold">{t("special")}</dt><dd className="text-slate-500 dark:text-slate-400">{A.eligibility.special_provision}</dd></div>
            <div><dt className="font-semibold">{t("conflict_title")}</dt><dd className="text-slate-500 dark:text-slate-400"><Bullets items={A.data_conflicts} /></dd></div>
          </dl>
        </Card>
      </div>

      <div id="pay" className="scroll-mt-24 grid gap-6 md:grid-cols-2">
        <Card icon={CreditCard} title={t("payment_title")}>
          <Bullets items={[...pay.rules, A.payment_policy_extra.exam_clearance, A.payment_policy_extra.admit_card]} />
          <dl className="mt-4 space-y-2 text-sm">
            {pay.payment_channels.banks.map((b) => (
              <div key={b.bank}><dt className="font-semibold">{b.bank}</dt><dd className="text-slate-500 dark:text-slate-400">A/C {b.account_no}, {b.branch}</dd></div>
            ))}
            <div><dt className="font-semibold">bKash</dt><dd className="text-slate-500 dark:text-slate-400">{pay.payment_channels.bkash.how}</dd></div>
            <div><dt className="font-semibold">Rocket</dt><dd className="text-slate-500 dark:text-slate-400">{pay.payment_channels.rocket.how}</dd></div>
          </dl>
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            {t("pay_official")} {pay.payment_channels.bank_note}{" "}
            <a href={links.payment_policy} target="_blank" rel="noreferrer" className="font-semibold underline">{t("view_official")}</a>
          </p>
        </Card>
        <Card icon={Phone} title={t("contacts_title")}>
          <ul className="grid gap-2 text-sm">
            {pay.payment_query_contacts.map((c) => (
              <li key={c.phone} className="flex justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2 dark:border-white/10">
                <span>{c.name}{"for" in c && c.for ? <span className="block text-xs text-slate-400">{c.for}</span> : null}</span>
                <a href={`tel:${c.phone}`} className="font-semibold text-brand dark:text-brand-violet">{c.phone}</a>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div id="academic" className="scroll-mt-24">
        <Card icon={Scale} title={t("academic_title")}>
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <H3>{t("grading")}</H3>
              <Table min="min-w-0" head={[t("marks"), t("letter"), t("gp")]} rows={ar.grading_scale.map((g) => [g.marks, g.letter, d(g.grade_point.toFixed(2))])} />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{ar.gpa_calculation}</p>
            </div>
            <div>
              <H3>{t("attendance")}</H3>
              <Bullets items={[ar.class_attendance_rule, `${t("probation")}: ${ar.academic_probation}`, ...ar.exam_rules_summary.slice(0, 3)]} />
              <H3>{t("repeat_rules")}</H3>
              <Bullets items={[...ar.repeat_policy, ar.improvement_policy, ar.incomplete_policy]} />
            </div>
          </div>
          <H3>{t("doc_fees")}</H3>
          <Table
            min="min-w-0"
            head={[lang === "bn" ? "বিষয়" : "Item", lang === "bn" ? "টাকা" : "BDT"]}
            rows={A.other_fees_and_charges.items.map((i) => [i.name + (i.note ? ` (${i.note})` : ""), i.amount == null ? "—" : money(i.amount)])}
          />
          <H3>{t("check_result")}</H3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{ar.result_publication} {A.student_services_faq.check_result}</p>
        </Card>
      </div>

      <div id="campus" className="scroll-mt-24 grid gap-6 md:grid-cols-2">
        <Card icon={Building2} title={t("campus_title")}>
          <H3>{t("library")}: {fac.library.name}</H3>
          <Bullets items={[`${t("hours")}: ${fac.library.hours}`, fac.library.borrowing, ...fac.library.rules.slice(0, 3)]} />
          <div className="mt-2"><Official href={fac.library.e_library} label="E-library" /></div>
          <H3>{t("forums")}</H3>
          <p className="text-sm text-slate-600 dark:text-slate-300">{fac.forums_and_clubs.join(" · ")}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{A.university_profile.campus_policies.join(" · ")}</p>
        </Card>
        <Card icon={HeartPulse} title={t("medical")}>
          <Bullets items={[fac.medical_center.location, ...fac.medical_center.services.slice(0, 4)]} />
          <p className="mt-3 text-sm">
            {t("emergency")}: {fac.medical_center.emergency_phones.map((p) => <a key={p} href={`tel:${p}`} className="mr-2 font-semibold text-brand dark:text-brand-violet">{p}</a>)}
            <br />24h: <a href={`tel:${fac.medical_center.urgent_care_24h.mobile}`} className="font-semibold text-brand dark:text-brand-violet">{fac.medical_center.urgent_care_24h.mobile}</a>
          </p>
        </Card>
      </div>

      <div id="leaders" className="scroll-mt-24">
        <Card icon={UserRound} title={t("leadership_title")}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[{ name: A.leadership.vice_chancellor.name, role: t("vc") }, ...A.leadership.deans.map((x) => ({ name: x.name, role: `${t("deans")}, ${x.faculty}` }))].map((p) => (
              <div key={p.name} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{p.role}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div id="depts" className="scroll-mt-24">
        <Card icon={Network} title={t("dept_title")}>
          <div className="grid gap-4 lg:grid-cols-3">
            {A.faculties_and_departments.faculties.map((f) => (
              <div key={f.name} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
                <p className="mb-3 font-bold text-brand dark:text-brand-violet">{f.name}</p>
                <ul className="space-y-3">
                  {f.departments.map((dep) => (
                    <li key={dep.name}>
                      <p className="text-sm font-semibold">{dep.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{dep.programs.length ? dep.programs.join(" · ") : t("no_degree")}</p>
                    </li>
                  ))}
                </ul>
                {"note" in f && f.note && <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">{f.note}</p>}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <p className="flex flex-wrap items-center justify-center gap-2 text-center text-xs text-slate-400">
        <CircleAlert size={14} /> {t("data_note")} · {t("last_verified")}: {formatDate(VERIFIED, lang)} ·
        <a className="underline" href={contact.source_url} target="_blank" rel="noreferrer">portcity.edu.bd</a>
      </p>
    </PageShell>
  );
}
