/**
 * Rule-based answers built straight from data/admission-info.json.
 * Used when Gemini is overloaded, out of quota or too slow, so the student always gets an answer.
 * Only copies values from the dataset; never calculates or guesses.
 */
import { admission, eligibility, fees, formatBDT, programs, retrieveContext, toLangDigits } from "./admission-data";
import type { Lang } from "@/types";

const L = {
  en: {
    intro: "Here is what the official PCIU admission data says:",
    fees: "Fees", programs: "Programs", elig: "Eligibility", dates: "Admission schedule (January 2027 intake)",
    steps: "How to apply", docs: "Required documents", sch: "Scholarships", pay: "How to pay", uni: "About PCIU", campus: "Campus life",
    credits: "credits", perCredit: "per credit", total: "Total", diploma: "Diploma background", admFee: "Admission fee (non-refundable)",
    form: "Admission form", minGpa: "Minimum GPA (SSC / HSC)", na: "not available in the official data",
    direct: "Direct admission: combined SSC + HSC GPA 7.00 or above (8.00 for LL.B.); written test exempted, viva may be required.",
    masters: "Master's programs", atForm: "With the application form", atAdm: "At admission",
    notFound: "Sorry, I couldn't find this in the official PCIU admission data. Please contact the PCIU Admission Office or visit [portcity.edu.bd](https://www.portcity.edu.bd).",
    confirm: "Please confirm with the PCIU Admission Office.",
    try: "You can ask about: departments, fees, eligibility, admission dates, documents, scholarships, payment or campus life.",
  },
  bn: {
    intro: "অফিসিয়াল পিসিআইইউ ভর্তি ডেটা অনুযায়ী:",
    fees: "ফি", programs: "প্রোগ্রামসমূহ", elig: "ভর্তির যোগ্যতা", dates: "ভর্তির সময়সূচি (জানুয়ারি ২০২৭ ইনটেক)",
    steps: "আবেদনের ধাপ", docs: "প্রয়োজনীয় কাগজপত্র", sch: "বৃত্তি", pay: "ফি পরিশোধের উপায়", uni: "পিসিআইইউ পরিচিতি", campus: "ক্যাম্পাস জীবন",
    credits: "ক্রেডিট", perCredit: "প্রতি ক্রেডিট", total: "মোট", diploma: "ডিপ্লোমা ব্যাকগ্রাউন্ড", admFee: "ভর্তি ফি (অফেরতযোগ্য)",
    form: "ভর্তি ফর্ম", minGpa: "ন্যূনতম জিপিএ (এসএসসি / এইচএসসি)", na: "অফিসিয়াল ডেটায় নেই",
    direct: "সরাসরি ভর্তি: এসএসসি + এইচএসসি মিলিয়ে জিপিএ ৭.০০ বা বেশি (এলএল.বি-র জন্য ৮.০০); লিখিত পরীক্ষা লাগবে না, ভাইভা লাগতে পারে।",
    masters: "মাস্টার্স প্রোগ্রাম", atForm: "আবেদন ফর্মের সাথে", atAdm: "ভর্তির সময়",
    notFound: "দুঃখিত, এই তথ্য অফিসিয়াল পিসিআইইউ ভর্তি ডেটায় পাইনি। অনুগ্রহ করে পিসিআইইউ ভর্তি অফিসে যোগাযোগ করুন বা [portcity.edu.bd](https://www.portcity.edu.bd) দেখুন।",
    confirm: "অনুগ্রহ করে পিসিআইইউ ভর্তি অফিস থেকে নিশ্চিত হয়ে নিন।",
    try: "আপনি জিজ্ঞাসা করতে পারেন: বিভাগ, ফি, যোগ্যতা, ভর্তির তারিখ, কাগজপত্র, বৃত্তি, পেমেন্ট বা ক্যাম্পাস জীবন সম্পর্কে।",
  },
};

export function fallbackAnswer(question: string, recent: string[], lang: Lang): { text: string; sourced: boolean; confirm: boolean } {
  const t = L[lang];
  const r = retrieveContext(question, recent);
  if (!r.sourced) return { text: `${t.notFound}\n\n${t.try}`, sourced: false, confirm: false };

  const bdt = (n: number) => `${lang === "bn" ? "৳" : "BDT "}${formatBDT(n, lang)}`;
  const d = (s: string | number) => toLangDigits(s, lang);
  const ids = r.programIds.length ? r.programIds : programs.map((p) => p.id);
  const pname = (id: string) => {
    const p = programs.find((x) => x.id === id)!;
    return lang === "bn" ? p.name_bn : p.name;
  };
  const tf = admission.tuition_fees;
  const out: string[] = [t.intro];

  for (const s of r.sections.slice(0, 3)) {
    if (s === "tuition_fees") {
      const rows = ids.map((id) => {
        const f = fees[id];
        const dip = f.total_fee_diploma ? `; ${t.diploma}: **${bdt(f.total_fee_diploma)}**` : "";
        return `- **${pname(id)}**: ${d(f.total_credits)} ${t.credits}, ${bdt(f.tuition_per_credit)} ${t.perCredit}; ${t.total}: **${bdt(f.total_fee_hsc)}**${dip}`;
      });
      out.push(`### ${t.fees}`, `- ${t.admFee}: **${bdt(tf.admission_fee)}**`, `- ${t.form}: ${bdt(tf.admission_form_price)}`, ...rows);
    } else if (s === "eligibility") {
      const rows = ids.map((id) => {
        const e = eligibility[id];
        const gpa = e.min_ssc_gpa == null ? t.na : `${d(e.min_ssc_gpa.toFixed(2))} / ${d((e.min_hsc_gpa ?? 0).toFixed(2))}`;
        return `- **${pname(id)}**: ${t.minGpa} ${gpa}${e.published_text ? ` (${e.published_text})` : ""}`;
      });
      out.push(`### ${t.elig}`, ...rows, `- ${t.direct}`);
    } else if (s === "admission_dates") {
      const b = admission.admission_dates.bachelors;
      out.push(
        `### ${t.dates}`,
        ...Object.entries(b).map(([k, v]) => `- ${k.replace(/_/g, " ")}: **${v ?? t.na}**`)
      );
    } else if (s === "admission_procedure") {
      out.push(`### ${t.steps}`, ...admission.admission_procedure.steps.map((st, i) => `${i + 1}. ${lang === "bn" ? st.bn : st.en}`));
    } else if (s === "required_documents") {
      const doc = admission.required_documents.bachelors;
      out.push(`### ${t.docs}`, `**${t.atForm}:**`, ...doc.at_form_submission.map((x) => `- ${x}`), `**${t.atAdm}:**`, ...doc.at_admission.map((x) => `- ${x}`));
    } else if (s === "scholarships") {
      out.push(`### ${t.sch}`, ...admission.scholarships.items.map((x) => `- ${x}`));
    } else if (s === "payment_policy") {
      const pc = admission.payment_policy.payment_channels;
      out.push(
        `### ${t.pay}`,
        ...pc.banks.map((b) => `- **${b.bank}**: A/C ${b.account_no}, ${b.branch}`),
        `- **bKash**: ${pc.bkash.how}`,
        `- **Rocket**: ${pc.rocket.how}`,
        `- ${pc.bank_note}`,
        ...admission.payment_policy.rules.slice(1, 3).map((x) => `- ${x}`)
      );
    } else if (s === "departments") {
      out.push(`### ${t.programs}`, ...programs.map((p) => `- ${lang === "bn" ? p.name_bn : p.name}`), `**${t.masters}:** ${admission.departments.masters_programs.join(", ")}`);
    } else if (s === "university") {
      const u = admission.university;
      out.push(`### ${t.uni}`, `- ${u.description}`, `- ${u.address}`, `- [${u.website}](${u.website})`, `- [Online admission](${u.online_admission_portal})`);
    } else if (s === "campus_life") {
      const c = admission.campus_life;
      out.push(
        `### ${t.campus}`,
        `- Library: [${c.facilities.library.name}](${c.facilities.library.url}) · [E-library](${c.facilities.library.e_library_url})`,
        `- Forums: ${c.facilities.student_forums.map((f) => f.name).join(", ")}`,
        `- ${c.facilities.other.map((o) => o.title).join(", ")}`,
        `- [Student portal](${c.useful_links.student_portal}) · [Career](${c.useful_links.career})`
      );
    } else if (s === "faqs") {
      out.push(...admission.faqs.items.slice(0, 3).map((f) => `**${lang === "bn" ? f.q_bn : f.q_en}**\n${lang === "bn" ? f.a_bn : f.a_en}`));
    }
  }
  if (r.confirm) out.push(`\n_${t.confirm}_`);
  return { text: out.join("\n"), sourced: true, confirm: r.confirm };
}
