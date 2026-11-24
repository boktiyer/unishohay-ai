/**
 * Rule-based answers built straight from data/admission-info.json.
 * Used when Gemini is overloaded, out of quota or too slow, so the student always gets an answer.
 * Only copies values from the dataset; never calculates or guesses.
 */
import { admission, bdt, contact, eligibility, facultyDepts, facultyDeptKeys, fees, links, programs, retrieveContext, toLangDigits, type Topic } from "./admission-data";
import type { Lang } from "@/types";
import { detectSmallTalk, ONLY_PCIU, smallTalkReply } from "./small-talk";

const L = {
  en: {
    intro: "Here is what the official PCIU data says:",
    fees: "Bachelor's fees", programs: "Programs", elig: "Eligibility", dates: "Admission schedule (January 2027 intake)",
    steps: "How to apply", docs: "Required documents", sch: "Scholarships", pay: "How to pay", uni: "About PCIU", campus: "Campus & facilities",
    credits: "credits", perCredit: "per credit", total: "Total", diploma: "Diploma background", admFee: "Admission fee (non-refundable)",
    form: "Admission form", minGpa: "Minimum GPA (SSC / HSC)", na: "not published",
    direct: "Direct admission: combined SSC + HSC GPA 7.00 or above (8.00 for LL.B.); written test exempted, viva and English placement test required.",
    masters: "Master's programs (totals include the BDT 18,000 admission fee)", atForm: "With the application form", atAdm: "At admission",
    test: "Admission test marks", other: "Other fees & charges", rules: "Academic rules", contact: "Contact PCIU", lead: "Leadership",
    notFound: "This is not published in the official PCIU data I have, so I can't answer it reliably.",
    callUs: "Please contact the PCIU Admission Office",
    confirm: "Please confirm with the PCIU Admission Office.",
    try: "You can ask about: departments, fees, eligibility, admission dates, admission test, documents, scholarships, payment, master's programs, academic rules or campus facilities.",
    perTerm: "Per-trimester and per-year fee totals are not published (PCIU uses trimesters), so I will not calculate them.",
    chairmen: "Department chairmen names are not published in the official data; please confirm with the department.",
    payNote: "Account numbers are copied from the official payment policy page; check it before paying",
  },
  bn: {
    intro: "অফিসিয়াল পিসিআইইউ ডেটা অনুযায়ী:",
    fees: "ব্যাচেলর প্রোগ্রামের ফি", programs: "প্রোগ্রামসমূহ", elig: "ভর্তির যোগ্যতা", dates: "ভর্তির সময়সূচি (জানুয়ারি ২০২৭ ইনটেক)",
    steps: "আবেদনের ধাপ", docs: "প্রয়োজনীয় কাগজপত্র", sch: "বৃত্তি", pay: "ফি পরিশোধের উপায়", uni: "পিসিআইইউ পরিচিতি", campus: "ক্যাম্পাস ও সুবিধা",
    credits: "ক্রেডিট", perCredit: "প্রতি ক্রেডিট", total: "মোট", diploma: "ডিপ্লোমা ব্যাকগ্রাউন্ড", admFee: "ভর্তি ফি (অফেরতযোগ্য)",
    form: "ভর্তি ফর্ম", minGpa: "ন্যূনতম জিপিএ (এসএসসি / এইচএসসি)", na: "প্রকাশিত নয়",
    direct: "সরাসরি ভর্তি: এসএসসি + এইচএসসি মিলিয়ে জিপিএ ৭.০০ বা বেশি (এলএল.বি-র জন্য ৮.০০); লিখিত পরীক্ষা লাগবে না, তবে ভাইভা ও ইংরেজি প্লেসমেন্ট টেস্ট দিতে হবে।",
    masters: "মাস্টার্স প্রোগ্রাম (মোট ফিতে ১৮,০০০ টাকা ভর্তি ফি ধরা আছে)", atForm: "আবেদন ফর্মের সাথে", atAdm: "ভর্তির সময়",
    test: "ভর্তি পরীক্ষার নম্বর বণ্টন", other: "অন্যান্য ফি", rules: "একাডেমিক নিয়ম", contact: "পিসিআইইউ-তে যোগাযোগ", lead: "নেতৃত্ব",
    notFound: "এই তথ্য আমার কাছে থাকা অফিসিয়াল পিসিআইইউ ডেটায় প্রকাশিত নয়, তাই নির্ভরযোগ্য উত্তর দিতে পারছি না।",
    callUs: "অনুগ্রহ করে পিসিআইইউ ভর্তি অফিসে যোগাযোগ করুন",
    confirm: "অনুগ্রহ করে পিসিআইইউ ভর্তি অফিস থেকে নিশ্চিত হয়ে নিন।",
    try: "আপনি জিজ্ঞাসা করতে পারেন: বিভাগ, ফি, যোগ্যতা, ভর্তির তারিখ, ভর্তি পরীক্ষা, কাগজপত্র, বৃত্তি, পেমেন্ট, মাস্টার্স, একাডেমিক নিয়ম বা ক্যাম্পাস সুবিধা সম্পর্কে।",
    perTerm: "প্রতি ট্রাইমেস্টার ও প্রতি বছরের মোট ফি প্রকাশিত নয় (পিসিআইইউ ট্রাইমেস্টার পদ্ধতিতে চলে), তাই আমি তা হিসাব করব না।",
    chairmen: "বিভাগীয় চেয়ারম্যানদের নাম অফিসিয়াল ডেটায় প্রকাশিত নয়; অনুগ্রহ করে সংশ্লিষ্ট বিভাগে যোগাযোগ করুন।",
    payNote: "অ্যাকাউন্ট নম্বরগুলো অফিসিয়াল পেমেন্ট পলিসি পেজ থেকে নেওয়া; টাকা পাঠানোর আগে পেজটি দেখে নিন",
  },
};

/** "Please contact ...: phones · link" in the student's language */
export function officeReferral(lang: Lang): string {
  const t = L[lang];
  const nums = [...contact.phones, ...contact.mobiles].map((n) => toLangDigits(n, lang)).join(", ");
  return `${t.callUs}: ${nums} · [${lang === "bn" ? "যোগাযোগ পেজ" : "Contact page"}](${links.contact})`;
}

export function fallbackAnswer(question: string, recent: string[], lang: Lang) {
  const t = L[lang];
  const r = retrieveContext(question, recent);
  const base = { topics: r.topics as Topic[], confirm: r.confirm };

  // "Is PCIU good?" / casual chat: balanced, fact-based reply instead of a data dump.
  const st = detectSmallTalk(question);
  if (st) return { topics: (st === "opinion" ? ["about"] : []) as Topic[], confirm: false, sourced: st === "opinion", text: smallTalkReply(st, lang) };

  // A close official FAQ match is the best quick answer.
  const top = r.faqMatches[0];
  if (top && top.score >= 0.6) {
    return { ...base, topics: ["faqs"] as Topic[], sourced: true, text: lang === "bn" ? top.item.a_bn : top.item.a_en };
  }
  if (!r.sourced) {
    return { ...base, sourced: false, confirm: false, text: ONLY_PCIU[lang] };
  }

  const d = (s: string | number) => toLangDigits(s, lang);
  const ids = r.programIds.length ? r.programIds : programs.map((p) => p.id);
  const pname = (id: string) => {
    const p = programs.find((x) => x.id === id)!;
    return lang === "bn" ? p.name_bn : p.name;
  };
  const money = (n: number | null) => (n == null ? t.na : bdt(n, lang));
  const tf = admission.tuition_fees;
  const out: string[] = [t.intro];
  const q = question.toLowerCase();
  const asks = (re: RegExp) => re.test(q);

  // teacher questions: show the teacher list first
  const ordered = [...r.topics].sort((a, b) => Number(b === "faculty_members") - Number(a === "faculty_members"));
  for (const s of ordered.slice(0, 3)) {
    switch (s) {
      case "tuition_fees":
        out.push(
          `### ${t.fees}`,
          `- ${t.admFee}: **${money(tf.admission_fee)}**`,
          `- ${t.form}: ${money(tf.admission_form_price)}`,
          ...ids.map((id) => {
            const f = fees[id];
            const dip = f.total_fee_diploma ? `; ${t.diploma}: **${money(f.total_fee_diploma)}**` : "";
            return `- **${pname(id)}**: ${d(f.total_credits)} ${t.credits}, ${money(f.tuition_per_credit)} ${t.perCredit}; ${t.total}: **${money(f.total_fee_hsc)}**${dip}`;
          })
        );
        if (ids.includes("bba")) out.push(`- ⚠ ${tf.by_program.bba.credits_conflict_note}`);
        if (asks(/semester|trimester|per year|yearly|monthly|সেমিস্টার|ট্রাইমেস্টার|বছর|মাসে/)) out.push(`- ${t.perTerm}`, `- ${officeReferral(lang)}`);
        break;
      case "eligibility":
        out.push(
          `### ${t.elig}`,
          ...ids.map((id) => {
            const e = eligibility[id];
            const gpa = e.min_ssc_gpa == null ? t.na : `${d(e.min_ssc_gpa.toFixed(2))} / ${d((e.min_hsc_gpa ?? 0).toFixed(2))}`;
            return `- **${pname(id)}**: ${t.minGpa} ${gpa}${e.published_text ? ` (${e.published_text})` : ""}`;
          }),
          `- ${t.direct}`
        );
        break;
      case "admission_dates":
        out.push(`### ${t.dates}`, ...Object.entries(admission.admission_dates.bachelors).map(([k, v]) => `- ${k.replace(/_/g, " ")}: **${v ?? t.na}**`));
        break;
      case "admission_procedure":
        out.push(`### ${t.steps}`, ...admission.admission_procedure.steps.map((st, i) => `${i + 1}. ${lang === "bn" ? st.bn : st.en}`));
        break;
      case "admission_test":
        out.push(`### ${t.test}`, ...admission.admission_extra.written_test_marks.map((m) => `- **${m.program_group}** (${d(m.total)}): ${Object.entries(m.parts).map(([k, v]) => `${k} ${d(v)}`).join(", ")}`), `- ${admission.admission_extra.written_test_exemption}`);
        break;
      case "required_documents": {
        const doc = admission.required_documents.bachelors;
        out.push(`### ${t.docs}`, `**${t.atForm}:**`, ...doc.at_form_submission.map((x) => `- ${x}`), `**${t.atAdm}:**`, ...doc.at_admission.map((x) => `- ${x}`));
        break;
      }
      case "masters":
        out.push(
          `### ${t.masters}`,
          ...admission.masters_programs_and_fees.programs.flatMap((p) => {
            const list = "fresh_graduates_by_background" in p ? p.fresh_graduates_by_background : "by_background" in p ? p.by_background : null;
            if (list) return list.map((b) => `- **${p.name}** (${b.background}): ${d(b.credits)} ${t.credits}, ${t.total} **${money(b.total_fee)}**`);
            const q = p as { credits: number; total_fee: number };
            return [`- **${p.name}**: ${d(q.credits)} ${t.credits}, ${t.total} **${money(q.total_fee)}**`];
          }),
          `- ${lang === "bn" ? "ফি প্রকাশিত নয়" : "Fee not published"}: ${admission.masters_programs_and_fees.fee_not_published.join(", ")}`
        );
        break;
      case "other_fees":
        out.push(`### ${t.other}`, ...admission.other_fees_and_charges.items.map((i) => `- ${i.name}: **${i.amount == null ? i.note ?? t.na : money(i.amount)}**${i.amount != null && i.note ? ` (${i.note})` : ""}`));
        break;
      case "payment_policy": {
        const pc = admission.payment_policy.payment_channels;
        out.push(
          `### ${t.pay}`,
          ...pc.banks.map((b) => `- **${b.bank}**: A/C ${b.account_no}, ${b.branch}`),
          `- **bKash**: ${pc.bkash.how}`,
          `- **Rocket**: ${pc.rocket.how}`,
          `- ${pc.bank_note}`,
          ...admission.payment_policy.rules.slice(1, 3).map((x) => `- ${x}`),
          `- ${t.payNote}: [Payment Policy](${links.payment_policy})`
        );
        break;
      }
      case "scholarships":
        out.push(`### ${t.sch}`, ...admission.scholarships.items.map((x) => `- ${x}`), `- ${admission.scholarship_extra.note}`);
        break;
      case "academic_rules": {
        const a = admission.academic_rules;
        out.push(`### ${t.rules}`, `- ${a.grading_scale.map((g) => `${g.letter} ${g.grade_point.toFixed(2)} (${g.marks})`).join("; ")}`, `- ${a.class_attendance_rule}`, `- ${a.academic_probation}`, `- ${a.improvement_policy}`);
        break;
      }
      case "student_services": {
        const sv = admission.student_services_faq;
        out.push(`### ${TOPIC_TITLE(lang, "Registration & results", "রেজিস্ট্রেশন ও ফলাফল")}`, `- ${sv.registration_existing_students}`, `- ${sv.change_add_drop_course}`, `- ${sv.check_result}`, `- ${admission.payment_policy_extra.admit_card}`);
        break;
      }
      case "campus_rules":
        out.push(`### ${TOPIC_TITLE(lang, "Rules for students", "শিক্ষার্থীদের নিয়ম")}`, `- ${admission.campus_rules.dress_code_avoid.join(", ")}`, `- ${admission.university_profile.campus_policies.join(", ")}`);
        break;
      case "facilities": {
        const f = admission.facilities;
        out.push(
          `### ${t.campus}`,
          `- **${f.library.name}**: ${f.library.hours}. ${f.library.borrowing}`,
          `- **Medical center**: ${f.medical_center.location}; emergency ${f.medical_center.emergency_phones.join(", ")}; 24h ${f.medical_center.urgent_care_24h.mobile}`,
          `- Forums & clubs: ${f.forums_and_clubs.join(", ")}`,
          `- Hostel / transport: ${t.na}`
        );
        if (asks(/hostel|transport|bus|হোস্টেল|বাস|যাতায়াত/)) out.push(`- ${officeReferral(lang)}`);
        break;
      }
      case "leadership": {
        const l = admission.leadership;
        out.push(`### ${t.lead}`, `- ${l.vice_chancellor.title}: **${l.vice_chancellor.name}**`, ...l.deans.map((x) => `- Dean, ${x.faculty}: ${x.name}`), ...facultyDepts.flatMap(([, dep]) => dep.teachers.filter((x) => x.designation === "Chairman").map((x) => `- Chairman, ${dep.department_name}: ${x.name}`)));
        break;
      }
      case "departments":
        out.push(
          `### ${t.programs}`,
          ...admission.faculties_and_departments.faculties.map((f) => `- **${f.name}**: ${f.departments.map((x) => x.name.replace("Department of ", "")).join(", ")}`),
          `- ${lang === "bn" ? "ব্যাচেলর" : "Bachelor's"}: ${programs.map((p) => (lang === "bn" ? p.name_bn : p.name)).join("; ")}`
        );
        break;
      case "about": {
        const u = admission.university_profile;
        out.push(`### ${t.uni}`, `- ${u.type}, ${u.location}. Founded ${u.founded} by ${u.founder}.`, `- ${u.vision}`, `- ${u.campus_policies.join(", ")}`);
        break;
      }
      case "contact":
        out.push(`### ${t.contact}`, `- ${contact.city_campus_address}`, `- ${contact.permanent_campus_address}`, `- ${officeReferral(lang)}`);
        break;
      case "news":
        out.push(...admission.recent_news_snapshot.items.map((n) => `- ${n.date}: ${n.title}`));
        break;
      case "faculty_members": {
        if (r.teacherHits.length) {
          out.push(...r.teacherHits.map((h) => `- **${h.name}**: ${h.designation}, ${h.department}`));
          break;
        }
        const want = facultyDeptKeys(q, r.programIds);
        for (const [k, dep] of facultyDepts.filter(([k]) => !want.length || want.includes(k))) {
          const groups = new Map<string, string[]>();
          for (const tch of dep.teachers) groups.set(tch.designation, [...(groups.get(tch.designation) ?? []), tch.name]);
          out.push(`### ${dep.department_name} (${d(dep.total_listed)})`, ...[...groups].map(([des, names]) => `- **${des}**: ${names.join(", ")}`), `- [${lang === "bn" ? "অফিসিয়াল শিক্ষক তালিকা" : "Official teacher list"}](${dep.source_url})`);
          if (!want.length && k === "natural_science") break;
        }
        break;
      }
      case "faqs":
        out.push(...r.faqMatches.map((m) => `**${lang === "bn" ? m.item.q_bn : m.item.q_en}**\n${lang === "bn" ? m.item.a_bn : m.item.a_en}`));
        break;
    }
  }
  if (r.confirm) out.push(`\n_${t.confirm}_`);
  return { ...base, sourced: true, text: out.join("\n") };
}

function TOPIC_TITLE(lang: Lang, en: string, bn: string) {
  return lang === "bn" ? bn : en;
}
