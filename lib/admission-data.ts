import raw from "@/data/admission-info.json";
import type { Lang, Program, ProgramEligibility, ProgramFee } from "@/types";

export const admission = raw;
export const programs: Program[] = raw.departments.programs;
export const fees = raw.tuition_fees.by_program as Record<string, ProgramFee>;
export const eligibility = raw.eligibility.by_program as Record<string, ProgramEligibility>;

export const detectLang = (text: string): Lang => (/[ঀ-৿]/.test(text) ? "bn" : "en");

const bnDigits = "০১২৩৪৫৬৭৮৯";
/** Format a BDT amount in the user's language, e.g. 3,17,000 / ৩,১৭,০০০ */
export function formatBDT(n: number, lang: Lang): string {
  const s = n.toLocaleString("en-IN");
  return lang === "bn" ? s.replace(/\d/g, (d) => bnDigits[+d]) : s;
}
export const toLangDigits = (s: string | number, lang: Lang) =>
  lang === "bn" ? String(s).replace(/\d/g, (d) => bnDigits[+d]) : String(s);

export const programName = (p: Program, lang: Lang) => (lang === "bn" ? p.name_bn : p.name);

/* ---------------- Retrieval ---------------- */

type SectionKey =
  | "university"
  | "departments"
  | "eligibility"
  | "tuition_fees"
  | "payment_policy"
  | "admission_dates"
  | "scholarships"
  | "admission_procedure"
  | "required_documents"
  | "campus_life"
  | "faqs";

const TOPIC_KEYWORDS: Record<SectionKey, string[]> = {
  university: ["pciu", "university", "about", "vision", "mission", "approved", "ugc", "address", "location", "where", "contact", "phone", "email", "website", "office", "ঠিকানা", "কোথায়", "যোগাযোগ", "ফোন", "ইমেইল", "ওয়েবসাইট", "অফিস", "বিশ্ববিদ্যালয়", "ভার্সিটি"],
  departments: ["department", "program", "subject", "course", "offer", "available", "master", "mba", "ll.m", "llm", "mcse", "m.sc", "m.a.", "m.s.s", "postgrad", "বিভাগ", "প্রোগ্রাম", "বিষয়", "সাবজেক্ট", "ডিপার্টমেন্ট", "কোর্স", "মাস্টার্স", "এমবিএ", "কী কী"],
  eligibility: ["eligib", "gpa", "requirement", "qualif", "ssc", "hsc", "o level", "o-level", "a level", "a-level", "diploma", "science", "commerce", "arts", "result", "can i", "যোগ্যতা", "জিপিএ", "এসএসসি", "এইচএসসি", "রেজাল্ট", "ফলাফল", "ডিপ্লোমা", "বিজ্ঞান", "পারব", "পারবো"],
  tuition_fees: ["fee", "cost", "tuition", "credit", "price", "money", "taka", "bdt", "semester", "trimester", "year", "hostel", "expens", "international", "খরচ", "ফি", "টাকা", "টিউশন", "ক্রেডিট", "সেমিস্টার", "ট্রাইমেস্টার", "বছর", "হোস্টেল"],
  payment_policy: ["pay", "installment", "bkash", "rocket", "bank", "deposit", "late fee", "due", "admit card", "পেমেন্ট", "পরিশোধ", "কিস্তি", "বিকাশ", "রকেট", "ব্যাংক", "জমা", "বকেয়া", "লেট ফি"],
  admission_dates: ["deadline", "date", "last day", "when", "schedule", "start", "exam", "test", "result", "orientation", "registration", "intake", "শেষ তারিখ", "তারিখ", "কবে", "সময়সীমা", "ডেডলাইন", "কখন", "পরীক্ষা", "ফলাফল", "ক্লাস শুরু", "রেজিস্ট্রেশন"],
  scholarships: ["scholarship", "waiver", "discount", "free", "financial", "বৃত্তি", "স্কলারশিপ", "ওয়েভার", "ছাড়", "মওকুফ"],
  admission_procedure: ["apply", "application", "procedure", "process", "how to", "step", "admission test", "written", "viva", "form", "online", "portal", "direct", "আবেদন", "প্রক্রিয়া", "কিভাবে", "কীভাবে", "ভর্তি পরীক্ষা", "লিখিত", "ভাইভা", "ফর্ম", "অনলাইন", "সরাসরি", "নিয়ম"],
  required_documents: ["document", "paper", "certificate", "transcript", "photo", "marksheet", "কাগজ", "ডকুমেন্ট", "সার্টিফিকেট", "সনদ", "ছবি", "মার্কশিট"],
  campus_life: ["campus", "facilit", "library", "lab", "medical", "club", "forum", "sport", "debate", "cultural", "hostel", "transport", "bus", "portal", "alumni", "news", "event", "career", "job", "cv", "convocation", "registrar", "controller", "ক্যাম্পাস", "সুবিধা", "লাইব্রেরি", "ল্যাব", "মেডিকেল", "ক্লাব", "ফোরাম", "খেলা", "বিতর্ক", "হোস্টেল", "বাস", "যাতায়াত", "পোর্টাল", "অ্যালামনাই", "খবর", "ইভেন্ট", "অনুষ্ঠান", "ক্যারিয়ার", "চাকরি", "সমাবর্তন"],
  faqs: ["faq", "question", "প্রশ্ন"],
};

export interface RetrievalResult {
  context: string;
  sections: SectionKey[];
  programIds: string[];
  /** true when the answer can be grounded in a matched dataset section */
  sourced: boolean;
  /** true when the answer involves fees or eligibility */
  confirm: boolean;
}

const has = (text: string, kw: string) => text.includes(kw.toLowerCase());

export function findPrograms(text: string): string[] {
  const t = text.toLowerCase();
  return programs.filter((p) => p.keywords.some((k) => has(t, k))).map((p) => p.id);
}

/**
 * Pick the dataset sections relevant to the student's question.
 * `recent` holds the previous user messages so follow-ups ("what about the fee for that one?")
 * inherit the program mentioned earlier.
 */
export function retrieveContext(question: string, recent: string[] = []): RetrievalResult {
  const q = question.toLowerCase();
  const sections = (Object.keys(TOPIC_KEYWORDS) as SectionKey[]).filter((k) =>
    TOPIC_KEYWORDS[k].some((kw) => has(q, kw))
  );

  let programIds = findPrograms(q);
  if (programIds.length === 0) {
    for (const prev of [...recent].reverse()) {
      programIds = findPrograms(prev);
      if (programIds.length) break;
    }
  }
  // A program was asked about without a specific topic: give its fees + eligibility.
  if (programIds.length && sections.length === 0) sections.push("departments", "tuition_fees", "eligibility");
  // Eligibility questions usually also need the direct-admission rules.
  if (sections.includes("eligibility") && !sections.includes("admission_procedure")) sections.push("admission_procedure");

  const sourced = sections.length > 0;
  const chosen: SectionKey[] = sourced ? sections : ["university", "departments", "faqs"];

  const pick = <T,>(rec: Record<string, T>) =>
    programIds.length ? Object.fromEntries(programIds.map((id) => [id, rec[id]])) : rec;

  const ctx: Record<string, unknown> = {
    university: {
      name: raw.university.name,
      website: raw.university.website,
      online_admission_portal: raw.university.online_admission_portal,
    },
  };
  for (const key of chosen) {
    if (key === "departments") {
      ctx.departments = {
        ...raw.departments,
        programs: programs.map(({ id, name, name_bn }) => ({ id, name, name_bn })),
      };
    } else if (key === "tuition_fees") {
      ctx.tuition_fees = { ...raw.tuition_fees, by_program: pick(fees) };
    } else if (key === "eligibility") {
      ctx.eligibility = { ...raw.eligibility, by_program: pick(eligibility) };
    } else {
      ctx[key] = raw[key];
    }
  }
  if (programIds.length) ctx.programs_in_focus = programIds;

  return {
    context: JSON.stringify(ctx, null, 1),
    sections: chosen,
    programIds,
    sourced,
    confirm: sections.includes("tuition_fees") || sections.includes("eligibility"),
  };
}

/* ---------------- Eligibility checker (rule-based, no AI) ---------------- */

export type Background = "science" | "commerce" | "arts" | "diploma";

export interface EligibilityResult {
  status: "eligible" | "not_eligible" | "unknown";
  needsScienceConfirm: boolean;
  combined: number;
  directAdmission: boolean;
  directThreshold: number;
}

export function checkEligibility(programId: string, ssc: number, hsc: number, bg: Background): EligibilityResult {
  const rule = eligibility[programId];
  const combined = Math.round((ssc + hsc) * 100) / 100;
  const directThreshold =
    programId === "llb"
      ? raw.admission_procedure.direct_admission.min_combined_gpa_llb
      : raw.admission_procedure.direct_admission.min_combined_gpa;

  if (!rule || rule.min_ssc_gpa == null || rule.min_hsc_gpa == null) {
    return { status: "unknown", needsScienceConfirm: false, combined, directAdmission: false, directThreshold };
  }
  const meets = ssc >= rule.min_ssc_gpa && hsc >= rule.min_hsc_gpa;
  const needsScience = /science background/i.test(rule.published_text ?? "");
  return {
    status: meets ? "eligible" : "not_eligible",
    needsScienceConfirm: meets && needsScience && bg !== "science",
    combined,
    directAdmission: meets && combined >= directThreshold,
    directThreshold,
  };
}
