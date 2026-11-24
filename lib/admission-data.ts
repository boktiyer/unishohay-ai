import raw from "@/data/admission-info.json";
import type { Lang, Program, ProgramEligibility, ProgramFee } from "@/types";

export const admission = raw;
export const programs: Program[] = raw.departments.programs;
export const fees = raw.tuition_fees.by_program as Record<string, ProgramFee>;
export const eligibility = raw.eligibility.by_program as Record<string, ProgramEligibility>;
export const links = raw.useful_links;
export const contact = raw.contact;
export const VERIFIED = raw.university.last_verified; // all sections share the same verification date

export const detectLang = (text: string): Lang => (/[ঀ-৿]/.test(text) ? "bn" : "en");

const bnDigits = "০১২৩৪৫৬৭৮৯";
/** Format a BDT amount in the user's language, e.g. 3,17,000 / ৩,১৭,০০০ */
export function formatBDT(n: number, lang: Lang): string {
  const s = n.toLocaleString("en-IN");
  return lang === "bn" ? s.replace(/\d/g, (d) => bnDigits[+d]) : s;
}
export const toLangDigits = (s: string | number, lang: Lang) =>
  lang === "bn" ? String(s).replace(/\d/g, (d) => bnDigits[+d]) : String(s);
/** "BDT 3,76,800" / "৳৩,৭৬,৮০০" */
export const bdt = (n: number | null | undefined, lang: Lang) =>
  n == null ? "—" : `${lang === "bn" ? "৳" : "BDT "}${formatBDT(n, lang)}`;

export const programName = (p: Program, lang: Lang) => (lang === "bn" ? p.name_bn : p.name);

const MONTHS = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  bn: ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"],
};
/** "2026-11-25" -> "25 Nov 2026" / "২৫ নভেম্বর ২০২৬" */
export function formatDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return toLangDigits(`${d} ${MONTHS[lang][m - 1]} ${y}`, lang);
}

/* ---------------- Retrieval ---------------- */

type DataKey = keyof typeof raw;

interface TopicDef {
  keys: DataKey[];
  label: { en: string; bn: string };
  url: string;
  kw: string[];
}

/** Each topic: which dataset sections it pulls in, its official source page and its BN+EN keywords. */
export const TOPICS = {
  tuition_fees: {
    keys: ["tuition_fees"],
    label: { en: "Tuition & Fees", bn: "টিউশন ও ফি" },
    url: links.tuition_fees,
    kw: ["fee", "cost", "tuition", "credit", "price", "money", "taka", "bdt", "semester", "trimester", "year", "expens", "international", "খরচ", "ফি", "টাকা", "টিউশন", "ক্রেডিট", "সেমিস্টার", "ট্রাইমেস্টার", "বছর"],
  },
  eligibility: {
    keys: ["eligibility", "admission_procedure"],
    label: { en: "Admission Requirements", bn: "ভর্তির যোগ্যতা" },
    url: links.admission_requirement,
    kw: ["eligib", "gpa", "requirement", "qualif", "ssc", "hsc", "o level", "o-level", "a level", "a-level", "diploma", "science", "commerce", "arts", "can i", "যোগ্যতা", "জিপিএ", "এসএসসি", "এইচএসসি", "ডিপ্লোমা", "বিজ্ঞান", "পারব", "পারবো"],
  },
  admission_dates: {
    keys: ["admission_dates"],
    label: { en: "Admission Schedule", bn: "ভর্তির সময়সূচি" },
    url: links.admission_schedule,
    kw: ["deadline", "date", "last day", "when", "schedule", "start", "orientation", "intake", "শেষ তারিখ", "তারিখ", "কবে", "সময়সীমা", "ডেডলাইন", "কখন", "ক্লাস শুরু"],
  },
  admission_procedure: {
    keys: ["admission_procedure"],
    label: { en: "Direct Admission & Procedure", bn: "সরাসরি ভর্তি ও প্রক্রিয়া" },
    url: links.direct_admission,
    kw: ["apply", "application", "procedure", "process", "how to", "step", "form ", "forms", "admission form", "online", "portal", "direct", "আবেদন", "প্রক্রিয়া", "কিভাবে", "কীভাবে", "ফর্ম", "অনলাইন", "সরাসরি"],
  },
  admission_test: {
    keys: ["admission_extra"],
    label: { en: "Admission Test", bn: "ভর্তি পরীক্ষা" },
    url: links.admission_test,
    kw: ["admission test", "written", "viva", "placement", "marks", "syllabus", "question pattern", "ভর্তি পরীক্ষা", "লিখিত", "ভাইভা", "নম্বর বণ্টন", "সিলেবাস", "প্লেসমেন্ট"],
  },
  required_documents: {
    keys: ["required_documents"],
    label: { en: "Required Documents", bn: "প্রয়োজনীয় কাগজপত্র" },
    url: raw.required_documents.source_url,
    kw: ["document", "paper", "photo", "marksheet", "testimonial", "nid", "কাগজ", "ডকুমেন্ট", "সনদ", "ছবি", "মার্কশিট"],
  },
  masters: {
    keys: ["masters_programs_and_fees", "admission_extra"],
    label: { en: "Master's Programs & Fees", bn: "মাস্টার্স প্রোগ্রাম ও ফি" },
    url: raw.masters_programs_and_fees.source_url,
    kw: ["master", "mba", "ll.m", "llm", "mcse", "m.sc", "m.a.", "m.s.s", "postgrad", "executive", "মাস্টার্স", "এমবিএ", "স্নাতকোত্তর"],
  },
  other_fees: {
    keys: ["other_fees_and_charges"],
    label: { en: "Other Fees & Charges", bn: "অন্যান্য ফি" },
    url: raw.other_fees_and_charges.source_url,
    kw: ["transcript", "certificate", "improvement", "re-exam", "scrutiny", "incomplete", "fine ", "fines", "provisional", "urgent", "ট্রান্সক্রিপ্ট", "সার্টিফিকেট", "ইমপ্রুভমেন্ট", "জরিমানা", "প্রভিশনাল"],
  },
  payment_policy: {
    keys: ["payment_policy", "payment_policy_extra"],
    label: { en: "Payment Policy", bn: "পেমেন্ট নীতি" },
    url: links.payment_policy,
    kw: ["pay", "installment", "bkash", "rocket", "bank", "deposit", "late fee", "due", "clearance", "পেমেন্ট", "পরিশোধ", "কিস্তি", "বিকাশ", "রকেট", "ব্যাংক", "জমা", "বকেয়া", "লেট ফি"],
  },
  scholarships: {
    keys: ["scholarships", "scholarship_extra"],
    label: { en: "Scholarship & Financial Aid", bn: "বৃত্তি ও আর্থিক সহায়তা" },
    url: links.scholarship,
    kw: ["scholarship", "waiver", "discount", "financial", "freedom fighter", "বৃত্তি", "স্কলারশিপ", "ওয়েভার", "ছাড়", "মওকুফ", "মুক্তিযোদ্ধা"],
  },
  academic_rules: {
    keys: ["academic_rules"],
    label: { en: "Academic Rules & Grading", bn: "একাডেমিক নিয়ম ও গ্রেডিং" },
    url: raw.academic_rules.source_url,
    kw: ["grade", "grading", "cgpa", "attendance", "probation", "repeat", "retake", "improve", "incomplete", "exam rule", "unfair", "credit transfer", "pass mark", "গ্রেড", "উপস্থিতি", "প্রবেশন", "রিপিট", "ইমপ্রুভ", "পরীক্ষার নিয়ম", "পাস মার্ক"],
  },
  student_services: {
    keys: ["student_services_faq", "payment_policy_extra"],
    label: { en: "Registration & Student Services", bn: "রেজিস্ট্রেশন ও স্টুডেন্ট সার্ভিস" },
    url: raw.student_services_faq.source_url,
    kw: ["registration", "register", "add course", "drop", "result", "admit card", "transcript", "verify", "verification", "student portal", "রেজিস্ট্রেশন", "ড্রপ", "ফলাফল", "রেজাল্ট", "এডমিট", "অ্যাডমিট", "যাচাই", "পোর্টাল"],
  },
  campus_rules: {
    keys: ["campus_rules"],
    label: { en: "Rules for Students", bn: "শিক্ষার্থীদের নিয়মাবলি" },
    url: raw.campus_rules.source_url,
    kw: ["dress", "rule", "discipline", "offense", "offence", "smok", "id card", "punish", "suspend", "expel", "ড্রেস", "পোশাক", "নিয়ম", "শৃঙ্খলা", "শাস্তি", "আইডি কার্ড", "ধূমপান"],
  },
  facilities: {
    keys: ["facilities", "campus_life"],
    label: { en: "Campus & Facilities", bn: "ক্যাম্পাস ও সুবিধা" },
    url: raw.campus_life.source_url,
    kw: ["campus", "facilit", "library", "lab ", "labs", "laborator", "medical", "doctor", "ambulance", "club", "forum", "sport", "debate", "robotic", "hostel", "transport", "bus ", "buses", "alumni", "career", "job", "cv", "ক্যাম্পাস", "সুবিধা", "লাইব্রেরি", "ল্যাব", "মেডিকেল", "ডাক্তার", "ক্লাব", "ফোরাম", "খেলা", "বিতর্ক", "হোস্টেল", "বাস", "যাতায়াত", "অ্যালামনাই", "ক্যারিয়ার", "চাকরি"],
  },
  about: {
    keys: ["university", "university_profile", "history_timeline"],
    label: { en: "About PCIU", bn: "পিসিআইইউ পরিচিতি" },
    url: raw.university_profile.source_url,
    kw: ["about pciu", "history", "found", "establish", "vision", "mission", "value", "ugc", "approved", "political", "foreign", "international student", "convocation", "accredit", "baete", "ইতিহাস", "প্রতিষ্ঠা", "ভিশন", "মিশন", "পরিচিতি", "বিদেশি", "রাজনীতি", "সমাবর্তন"],
  },
  leadership: {
    keys: ["leadership"],
    label: { en: "Leadership", bn: "নেতৃত্ব" },
    url: raw.leadership.source_url,
    kw: ["vice chancellor", "vc", "dean", "chairman", "chairmen", "head of department", "trustee", "registrar", "founder", "ভিসি", "উপাচার্য", "ভাইস চ্যান্সেলর", "ডিন", "চেয়ারম্যান", "বিভাগীয় প্রধান", "প্রতিষ্ঠাতা"],
  },
  departments: {
    keys: ["departments", "faculties_and_departments"],
    label: { en: "Faculties & Departments", bn: "অনুষদ ও বিভাগ" },
    url: raw.faculties_and_departments.source_url,
    kw: ["department", "faculty", "program", "subject", "course", "offer", "available", "বিভাগ", "অনুষদ", "প্রোগ্রাম", "বিষয়", "সাবজেক্ট", "ডিপার্টমেন্ট", "কোর্স", "কী কী"],
  },
  contact: {
    keys: ["contact"],
    label: { en: "Contact Us", bn: "যোগাযোগ" },
    url: links.contact,
    kw: ["contact", "phone", "mobile", "number", "call", "email", "address", "location", "where", "office hour", "permanent campus", "যোগাযোগ", "ফোন", "মোবাইল", "নম্বর", "ইমেইল", "ঠিকানা", "কোথায়", "স্থায়ী ক্যাম্পাস"],
  },
  news: {
    keys: ["recent_news_snapshot"],
    label: { en: "News & Events", bn: "খবর ও ইভেন্ট" },
    url: links.official_site,
    kw: ["news", "event", "workshop", "tournament", "খবর", "ইভেন্ট", "অনুষ্ঠান", "কর্মশালা"],
  },
  faculty_members: {
    keys: ["faculty_members"],
    label: { en: "Teacher List", bn: "শিক্ষক তালিকা" },
    url: raw.faculties_and_departments.source_url,
    kw: ["teacher", "faculty member", "faculty list", "lecturer", "professor", "instructor", "sir", "madam", "chairman", "chairperson", "head of", "শিক্ষক", "টিচার", "স্যার", "ম্যাডাম", "লেকচারার", "প্রফেসর", "অধ্যাপক", "প্রভাষক", "চেয়ারম্যান", "বিভাগীয় প্রধান"],
  },
  faqs: {
    keys: ["faqs", "faq_additions"],
    label: { en: "Admission FAQ", bn: "ভর্তি সংক্রান্ত প্রশ্নোত্তর" },
    url: links.faq,
    kw: ["faq", "question", "প্রশ্নোত্তর"],
  },
} satisfies Record<string, TopicDef>;

export type Topic = keyof typeof TOPICS;

const has = (text: string, kw: string) => text.includes(kw.toLowerCase());

export function findPrograms(text: string): string[] {
  const t = text.toLowerCase();
  return programs.filter((p) => p.keywords.some((k) => has(t, k))).map((p) => p.id);
}

/* ---- Teachers (faculty_members) ---- */

type FacultyDept = (typeof raw.faculty_members.departments)[keyof typeof raw.faculty_members.departments];
export const facultyDepts = Object.entries(raw.faculty_members.departments) as [string, FacultyDept][];

const cleanName = (n: string) =>
  n.toLowerCase().replace(/\(.*?\)/g, " ").replace(/\b(mr|mrs|ms|dr|prof|engr|md|mohammad|muhammad)\b\.?/g, " ").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ").trim();

/** Teachers whose (cleaned) full name appears in the question, e.g. "Who is Farzina Akther?" */
export function findTeachers(question: string) {
  const q = " " + question.toLowerCase().replace(/\b(mr|mrs|ms|dr|prof|engr|md|mohammad|muhammad)\b\.?/g, " ").replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ") + " ";
  const hits: { department: string; name: string; designation: string }[] = [];
  for (const [, dep] of facultyDepts) {
    for (const t of dep.teachers) {
      const n = cleanName(t.name);
      if (n.split(" ").length >= 2 && q.includes(" " + n + " ")) hits.push({ department: dep.department_name, name: t.name, designation: t.designation });
    }
  }
  return hits;
}

const NATURAL_SCIENCE = ["natural science", "math", "physics", "chemistry", "statistics", "ন্যাচারাল সায়েন্স", "গণিত", "পদার্থ", "রসায়ন"];

/** Department keys for the programs/subjects in the question (empty = all departments). */
export function facultyDeptKeys(question: string, programIds: string[]): string[] {
  const keys = facultyDepts.filter(([, d]) => d.program_ids.some((p) => programIds.includes(p))).map(([k]) => k);
  if (NATURAL_SCIENCE.some((k) => question.toLowerCase().includes(k))) keys.push("natural_science");
  return keys;
}

/* ---- FAQ matching (used as retrieval examples and quick answers) ---- */

export interface FaqItem { q_en: string; q_bn: string; a_en: string; a_bn: string }
export const allFaqs: FaqItem[] = [...raw.faqs.items, ...raw.faq_additions];

const STOP = new Set(["the", "what", "how", "is", "are", "for", "can", "does", "and", "pciu", "who", "where", "when", "which", "there", "any", "you", "your", "about", "university", "কী", "কি", "কত", "কোন", "আছে", "এর", "করে", "হয়", "কীভাবে", "কিভাবে", "পিসিআইইউ", "পিসিআইইউ-এর", "করব", "পাব", "লাগে", "লাগবে", "হবে", "দিতে", "যায়", "পারি", "পারব", "আমি", "আমার", "need", "get", "have"]);
const tokens = (s: string) =>
  new Set(
    s.toLowerCase().replace(/[?,.!:;()'"“”‘’/]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w))
  );

export function matchFaqs(question: string, limit = 2): { item: FaqItem; score: number }[] {
  const q = tokens(question);
  if (!q.size) return [];
  const scored = allFaqs.map((item) => {
    const score = Math.max(
      ...[item.q_en, item.q_bn].map((fq) => {
        const f = tokens(fq);
        let hit = 0;
        f.forEach((w) => q.has(w) && hit++);
        // need 2+ meaningful words in common (or every word of a very short FAQ question)
        if (hit < 2 && !(f.size <= 2 && hit === f.size)) return 0;
        return f.size ? hit / f.size : 0;
      })
    );
    return { item, score };
  });
  return scored.filter((s) => s.score >= 0.5).sort((a, b) => b.score - a.score).slice(0, limit);
}

/* ---- Main retrieval ---- */

export interface RetrievalResult {
  context: string;
  topics: Topic[];
  programIds: string[];
  /** true when the answer can be grounded in a matched dataset section */
  sourced: boolean;
  /** true when the answer involves fees or eligibility */
  confirm: boolean;
  faqMatches: { item: FaqItem; score: number }[];
  teacherHits: { department: string; name: string; designation: string }[];
}

/**
 * Pick the dataset sections relevant to the student's question.
 * `recent` holds the previous user messages so follow-ups ("what about the fee for that one?")
 * inherit the program mentioned earlier.
 */
export function retrieveContext(question: string, recent: string[] = []): RetrievalResult {
  const q = question.toLowerCase();
  const topics = (Object.keys(TOPICS) as Topic[]).filter((k) => TOPICS[k].kw.some((kw) => has(q, kw)));

  let programIds = findPrograms(q);
  if (programIds.length === 0) {
    for (const prev of [...recent].reverse()) {
      programIds = findPrograms(prev);
      if (programIds.length) break;
    }
  }
  // A program was asked about without a specific topic: give its fees + eligibility.
  if (programIds.length && topics.length === 0) topics.push("departments", "tuition_fees", "eligibility");

  const teacherHits = findTeachers(question);
  if (teacherHits.length && !topics.includes("faculty_members")) topics.push("faculty_members");

  const faqMatches = matchFaqs(question);
  if (faqMatches.length && !topics.includes("faqs")) topics.push("faqs");

  const sourced = topics.length > 0;
  const chosen: Topic[] = sourced ? topics : ["about", "departments", "contact"];

  const pick = <T,>(rec: Record<string, T>) =>
    programIds.length ? Object.fromEntries(programIds.map((id) => [id, rec[id]])) : rec;

  // Always available to the model: rules, contact for referrals, links, known gaps and conflicts.
  const ctx: Record<string, unknown> = {
    chatbot_rules: raw.chatbot_rules,
    contact: raw.contact,
    useful_links: raw.useful_links,
    not_found: raw.not_found,
    data_conflicts: raw.data_conflicts,
  };
  for (const topic of chosen) {
    for (const key of TOPICS[topic].keys) {
      if (key in ctx) continue;
      if (key === "tuition_fees") ctx.tuition_fees = { ...raw.tuition_fees, by_program: pick(fees) };
      else if (key === "eligibility") ctx.eligibility = { ...raw.eligibility, by_program: pick(eligibility) };
      else if (key === "faqs" || key === "faq_additions") continue; // only the matching FAQs are added below
      else if (key === "faculty_members") {
        const want = facultyDeptKeys(q, programIds);
        const deps = facultyDepts.filter(([k]) => !want.length || want.includes(k));
        ctx.faculty_members = {
          source_note: raw.faculty_members.source_note,
          departments: Object.fromEntries(deps.map(([k, d]) => [k, { department_name: d.department_name, source_url: d.source_url, total_listed: d.total_listed, teachers: d.teachers.map((t) => `${t.name} | ${t.designation}`) }])),
        };
      }
      else ctx[key] = raw[key];
    }
  }
  if (teacherHits.length) ctx.teacher_name_matches = teacherHits;
  if (faqMatches.length) ctx.closest_official_faqs = faqMatches.map((m) => m.item);
  if (programIds.length) ctx.programs_in_focus = programIds;

  return {
    context: JSON.stringify(ctx),
    topics: chosen,
    programIds,
    sourced,
    confirm: topics.some((t) => t === "tuition_fees" || t === "eligibility" || t === "masters" || t === "other_fees"),
    faqMatches,
    teacherHits,
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

/* ---------------- Comparable programs (bachelor's + master's) for calculators ---------------- */

export interface ComparableProgram {
  id: string;
  level: "bachelor" | "master";
  name: { en: string; bn: string };
  credits: number;
  perCredit: number;
  total: number;
  totalDiploma: number | null;
  minGpa: string | null;
  note?: string;
}

const mf = raw.masters_programs_and_fees;

export const comparablePrograms: ComparableProgram[] = [
  ...programs.map((p) => {
    const f = fees[p.id];
    const e = eligibility[p.id];
    return {
      id: p.id,
      level: "bachelor" as const,
      name: { en: p.name, bn: p.name_bn },
      credits: f.total_credits,
      perCredit: f.tuition_per_credit,
      total: f.total_fee_hsc,
      totalDiploma: f.total_fee_diploma,
      minGpa: e.min_ssc_gpa == null ? null : `${e.min_ssc_gpa.toFixed(2)} / ${(e.min_hsc_gpa ?? 0).toFixed(2)}`,
      note: "credits_conflict_note" in f ? (f as { credits_conflict_note?: string }).credits_conflict_note : undefined,
    };
  }),
  ...mf.programs.flatMap((p, i) => {
    const rows =
      "fresh_graduates_by_background" in p && p.fresh_graduates_by_background
        ? p.fresh_graduates_by_background.map((b) => ({ bg: b.background, credits: b.credits, total: b.total_fee }))
        : "by_background" in p && p.by_background
          ? p.by_background.map((b) => ({ bg: b.background, credits: b.credits, total: b.total_fee }))
          : [{ bg: "", credits: (p as { credits: number }).credits, total: (p as { total_fee: number }).total_fee }];
    return rows.map((r, j) => ({
      id: `m${i}-${j}`,
      level: "master" as const,
      name: { en: r.bg ? `${p.name} (${r.bg})` : p.name, bn: r.bg ? `${p.name} (${r.bg})` : p.name },
      credits: r.credits,
      perCredit: p.tuition_per_credit,
      total: r.total,
      totalDiploma: null,
      minGpa: null,
      note: "job_experience_note" in p ? (p as { job_experience_note?: string }).job_experience_note : undefined,
    }));
  }),
];
