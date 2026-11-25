/**
 * Friendly replies for casual chat ("hi", "how are you", "your name?") and opinion questions
 * ("is PCIU good?") so the bot sounds natural even when Gemini is unavailable.
 * Opinion answers list only verifiable facts from the dataset; no rankings or personal opinions.
 */
import { admission as A, links, toLangDigits } from "./admission-data";
import type { Lang } from "@/types";

export type SmallTalkKind = "greeting" | "how_are_you" | "identity" | "creator" | "thanks" | "bye" | "opinion" | "off_topic";

const PATTERNS: [SmallTalkKind, RegExp][] = [
  ["opinion", /(is|how).{0,25}(pciu|port city|university|it|this).{0,20}(good|bad|best|worth|quality|reputation)|should i (study|join|take admission|choose)|worth (it|joining)|ভালো না খারাপ|খারাপ না ভালো|ভালো হবে|খারাপ হবে|কেমন হবে|কেমন ভার্সিটি|কেমন ইউনিভার্সিটি|ভার্সিটি কেমন|ইউনিভার্সিটি কেমন|ভর্তি হওয়া (কি )?উচিত|ভালো কি না|মান কেমন|better than|worse than|vs.?|চেয়ে ভালো|থেকে ভালো|তুলনায় ভালো/i],
  ["creator", /who (made|built|created|developed|designed) (you|this|unishohay)|who('s| is| are) (your|the) (developers?|creators?|founders?|makers?|team)|who is behind|your (creators?|developers?|founder|makers?|team)\b|তোমাকে কে|তোকে কে|আপনাকে কে|কে বানিয়েছে|কে বানাইছে|কে তৈরি করেছে|নির্মাতা|ডেভেলপার কে|কার তৈরি|টিমে কারা|(chatbot|bot|ai|tomar|তোমার|চ্যাটবট|এআই).{0,15}(founder|ফাউন্ডার)|tomake ke|tomar (developer|creator|founder|maker)|bke (banai|create|toiri|tori|build|develop)|bkar toiri|team ?e kara|tomader team/i],
  ["identity", /your name|who are you|what are you|are you (a )?(bot|human|ai|chatgpt)|তোমার নাম|তোর নাম|আপনার নাম|তুমি কে|তুই কে|আপনি কে|তুমি কি মানুষ|তুমি কি রোবট/i],
  ["how_are_you", /how are you|how r u|how's it going|what's up|কেমন আছ|কেমন আছিস|কেমন আছেন|কি খবর|কী খবর|কি অবস্থা/i],
  ["thanks", /^(thanks|thank you|thx|tnx|ধন্যবাদ|থ্যাংক|থ্যাঙ্ক)/i],
  ["bye", /^(bye|goodbye|see you|বিদায়|আল্লাহ হাফেজ|আল্লাহ হাফিজ|টাটা)/i],
  ["greeting", /^((hi+|hello|hey|hlw|helo|assalamu\w*|salam|good (morning|afternoon|evening))([\s!,.?]|$)|হাই|হ্যালো|হেলো|আসসালামু|সালাম|শুভ সকাল)/i],
  ["off_topic", /\b(weather|cricket|football|movie|song|joke|recipe|bitcoin|politics)\b|অন্য (ভার্সিটি|ইউনিভার্সিটি)|আবহাওয়া|ক্রিকেট|গান|সিনেমা|কৌতুক/i],
];

/** Short casual messages only (long questions that merely start with "hi" go to normal retrieval). */
export function detectSmallTalk(text: string): SmallTalkKind | null {
  const q = text.trim();
  for (const [kind, re] of PATTERNS) {
    if (!re.test(q)) continue;
    if ((kind === "greeting" || kind === "thanks" || kind === "bye") && q.length > 40) continue;
    return kind;
  }
  return null;
}

export const ONLY_PCIU = {
  en: "I can only give you information about PCIU (Port City International University). What would you like to know about PCIU?",
  bn: "আমি শুধু পিসিআইইউ (পোর্ট সিটি ইন্টারন্যাশনাল ইউনিভার্সিটি) সম্পর্কে তথ্য দিতে পারি। আপনি পিসিআইইউ সম্পর্কে কী জানতে চান?",
};

const OFFER = {
  en: "Ask me anything about PCIU: departments, fees, eligibility, admission dates, scholarships or campus life.",
  bn: "পিসিআইইউ নিয়ে যেকোনো প্রশ্ন করুন: বিভাগ, ফি, যোগ্যতা, ভর্তির তারিখ, বৃত্তি বা ক্যাম্পাস জীবন।",
};

/** Creator answer: names and spellings are fixed, never change them. */
const CREATOR = {
  bn: `আমাকে তৈরি করেছেন **Boktiyer Hossen** (CSE 36 B, CR) এবং তাঁর সহযোগী **Iftekhar Bin Nasim** ও **Tridip Chakraborty**। আমরা PCIU শিক্ষার্থীদের সহায়তার উদ্দেশ্যে UniShohayAI তৈরি করেছি।\n\n- Founder & Lead Developer: Boktiyer Hossen (CSE, Batch 36 B, Class Representative)\n- Team Members & Collaborators: Iftekhar Bin Nasim, Tridip Chakraborty\n\n**UniShohayAI — Your Smart University Companion!**`,
  en: `I was created by **Boktiyer Hossen** (CSE 36 B, CR) along with his collaborators **Iftekhar Bin Nasim** and **Tridip Chakraborty**. We built UniShohayAI to help PCIU students.\n\n- Founder & Lead Developer: Boktiyer Hossen (CSE, Batch 36 B, Class Representative)\n- Team Members & Collaborators: Iftekhar Bin Nasim, Tridip Chakraborty\n\n**UniShohayAI — Your Smart University Companion!**`,
  banglish: `Amake toiri korechen **Boktiyer Hossen** (CSE 36 B, CR) ebong tar sohojogi **Iftekhar Bin Nasim** o **Tridip Chakraborty**. Amra PCIU students der help korar jonno UniShohayAI toiri korechi.\n\n- Founder & Lead Developer: Boktiyer Hossen (CSE, Batch 36 B, Class Representative)\n- Team Members & Collaborators: Iftekhar Bin Nasim, Tridip Chakraborty\n\n**UniShohayAI — Your Smart University Companion!**`,
};

const BANGLISH = /\b(ke|kar|kara|tomake|tomar|tomader|korse|koreche|banai\w*|toiri|tori|ache|ei|amake)\b/i;

export function smallTalkReply(kind: SmallTalkKind, lang: Lang, text = ""): string {
  const bn = lang === "bn";
  const d = (v: string | number) => toLangDigits(v, lang);
  switch (kind) {
    case "greeting":
      return bn ? `হ্যালো! আমি ইউনিসহায় এআই, পিসিআইইউ-এর ভর্তি সহকারী। ${OFFER.bn}` : `Hello! I'm UnishohayAI, an admission assistant for PCIU. ${OFFER.en}`;
    case "how_are_you":
      return bn ? `আমি ভালো আছি, জিজ্ঞাসা করার জন্য ধন্যবাদ! আপনাকে কীভাবে সাহায্য করতে পারি? ${OFFER.bn}` : `I'm doing well, thanks for asking! How can I help you today? ${OFFER.en}`;
    case "identity":
      return bn
        ? `আমার নাম **ইউনিসহায় এআই (UniShohayAI)**। আমি পিসিআইইউ কম্পিউটার ক্লাব হ্যাকাথনের জন্য তৈরি একটি এআই স্টুডেন্ট অ্যাসিস্ট্যান্ট (মানুষ নই, পিসিআইইউ-এর অফিসিয়াল সেবাও নই)। আমাকে তৈরি করেছেন Boktiyer Hossen ও তাঁর টিম। ${OFFER.bn}`
        : `I'm **UniShohayAI**, an AI-powered student assistant built for the PCIU Computer Club Hackathon (not a human, and not an official PCIU service). I was created by Boktiyer Hossen and his team. ${OFFER.en}`;
    case "creator":
      if (bn) return CREATOR.bn;
      return BANGLISH.test(text) ? CREATOR.banglish : CREATOR.en;
    case "thanks":
      return bn ? "আপনাকেও ধন্যবাদ! আর কোনো প্রশ্ন থাকলে নির্দ্বিধায় জিজ্ঞাসা করুন।" : "You're welcome! Feel free to ask if you have any other questions.";
    case "bye":
      return bn ? "ভালো থাকবেন! ভর্তির জন্য শুভকামনা। দরকার হলে আবার আসবেন।" : "Take care, and good luck with your admission! Come back anytime.";
    case "off_topic":
      return ONLY_PCIU[lang];
    case "opinion": {
      const p = A.university_profile;
      const facts = bn
        ? [
            `সরকার ও ইউজিসি অনুমোদিত বেসরকারি বিশ্ববিদ্যালয়, প্রতিষ্ঠা ${d("২০১২")}; ক্লাস শুরু ${d("২০১৩")} সালে।`,
            `${d(9)}টি ব্যাচেলর ও একাধিক মাস্টার্স প্রোগ্রাম, তিনটি অনুষদে।`,
            "ইউজিসি নির্দেশনা অনুযায়ী OBE কারিকুলাম; সিএসই বিভাগ BAETE দ্বারা মূল্যায়িত (ডিসেম্বর ২০২৩); IQAC আছে।",
            "মোট শিক্ষার্থীর ৬% বৃত্তি পায়, দরিদ্রদের জন্য আর্থিক সহায়তা আছে।",
            "লাইব্রেরি ও ই-লাইব্রেরি, অ্যাম্বুলেন্সসহ মেডিকেল সেন্টার, বিতর্ক, খেলা, আইটি ও সাংস্কৃতিক ফোরাম।",
            "রাজনীতিমুক্ত ও ধূমপানমুক্ত ক্যাম্পাস।",
          ]
        : [
            `${p.type}; founded ${p.founded.slice(0, 4)}, classes since 2013.`,
            "9 bachelor's and several master's programs across three faculties.",
            p.academic_quality.slice(0, 2).join(" "),
            "6% of students receive scholarships, plus need-based financial aid.",
            "Library and e-library, a medical center with ambulance, and debate, sports, IT and cultural forums.",
            p.campus_policies.slice(0, 2).join(", ") + ".",
          ];
      return bn
        ? `"ভালো" বা "খারাপ" নির্ভর করে আপনার লক্ষ্য, বিষয় ও বাজেটের ওপর। আমি নিজের মতামত বা র‍্যাংকিং দিই না, তবে অফিসিয়াল তথ্য অনুযায়ী:\n\n${facts.map((f) => `- ${f}`).join("\n")}\n\nর‍্যাংকিং, চাকরির হার, শিক্ষার্থীদের রিভিউ বা অন্য বিশ্ববিদ্যালয়ের তথ্য আমার ডেটায় নেই, তাই তুলনা করতে পারি না। সিদ্ধান্ত নিতে আপনার বিষয়ের ফি ও যোগ্যতা দেখুন, ক্যাম্পাস ঘুরে আসুন এবং বর্তমান শিক্ষার্থীদের সাথে কথা বলুন। [পিসিআইইউ পরিচিতি](${p.source_url})`
        : `Whether it's "good" depends on your goals, subject and budget. I don't give personal opinions or rankings, but here is what the official data shows:\n\n${facts.map((f) => `- ${f}`).join("\n")}\n\nRankings, job-placement rates, student reviews and data on other universities are not in my data, so I can't compare. To decide, compare the fees and requirements for your program, visit the campus, and talk to current students. [About PCIU](${p.source_url}) · [Contact](${links.contact})`;
    }
  }
}
