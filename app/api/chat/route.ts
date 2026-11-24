import { detectLang, retrieveContext } from "@/lib/admission-data";
import { buildSystemInstruction, getGemini, MODELS } from "@/lib/gemini";
import type { Lang } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_HISTORY = 12;
const MAX_CHARS = 2000;

const ERR = {
  empty: { en: "Please type a question first.", bn: "অনুগ্রহ করে আগে একটি প্রশ্ন লিখুন।" },
  long: { en: "Your message is too long. Please keep it under 2000 characters.", bn: "আপনার বার্তাটি অনেক বড়। অনুগ্রহ করে ২০০০ অক্ষরের মধ্যে রাখুন।" },
  key: { en: "The AI service is not configured yet (missing GEMINI_API_KEY). Please contact the site administrator.", bn: "এআই সার্ভিস এখনো কনফিগার করা হয়নি (GEMINI_API_KEY নেই)। অনুগ্রহ করে সাইট অ্যাডমিনের সাথে যোগাযোগ করুন।" },
  rate: { en: "Too many requests right now. Please wait a minute and try again.", bn: "এই মুহূর্তে অনেক বেশি অনুরোধ আসছে। এক মিনিট অপেক্ষা করে আবার চেষ্টা করুন।" },
  busy: { en: "The AI service is very busy right now. Please try again in a few moments.", bn: "এআই সার্ভিস এই মুহূর্তে খুব ব্যস্ত। কিছুক্ষণ পর আবার চেষ্টা করুন।" },
  generic: { en: "Sorry, something went wrong while generating the answer. Please try again.", bn: "দুঃখিত, উত্তর তৈরি করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" },
};

const fail = (key: keyof typeof ERR, lang: Lang, status: number) =>
  Response.json({ error: ERR[key][lang] }, { status });

interface InMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  let messages: InMessage[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.messages)) messages = body.messages;
  } catch {
    /* handled below */
  }
  messages = messages
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_HISTORY);
  while (messages.length && messages[0].role !== "user") messages.shift(); // Gemini history must start with user

  const last = messages[messages.length - 1];
  const lang = last ? detectLang(last.content) : "en";
  if (!last || last.role !== "user") return fail("empty", lang, 400);
  if (last.content.length > MAX_CHARS) return fail("long", lang, 400);

  const ai = getGemini();
  if (!ai) return fail("key", lang, 500);

  const previousUser = messages.slice(0, -1).filter((m) => m.role === "user").slice(-3).map((m) => m.content);
  const retrieval = retrieveContext(last.content, previousUser);

  const contents = messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] }));
  const config = { systemInstruction: buildSystemInstruction(retrieval.context, lang, retrieval.confirm), temperature: 0.2 };

  // Free-tier Gemini often returns 503 (overloaded) or 429 (per-model quota).
  // Go through all models, up to 3 rounds with backoff; drop models that are out of quota or missing.
  let stream: AsyncGenerator<{ text?: string }> | null = null;
  let lastStatus: number | undefined;
  let candidates = [...MODELS];
  outer: for (let round = 0; round < 3 && candidates.length; round++) {
    if (round) await new Promise((r) => setTimeout(r, 1500 * round));
    for (const model of [...candidates]) {
      try {
        stream = await ai.models.generateContentStream({ model, contents, config });
        break outer;
      } catch (err) {
        lastStatus = (err as { status?: number })?.status;
        console.error(`Gemini error [${model}]:`, lastStatus, (err as Error)?.message?.slice(0, 200));
        if (lastStatus === 400 || lastStatus === 401 || lastStatus === 403) break outer; // bad key / request
        if (lastStatus === 404 || lastStatus === 429) candidates = candidates.filter((m) => m !== model);
      }
    }
  }
  if (!stream) {
    if (lastStatus === 429) return fail("rate", lang, 429);
    if (lastStatus === 503) return fail("busy", lang, 503);
    return fail("generic", lang, 502);
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
        }
      } catch (err) {
        console.error("Gemini stream error:", (err as Error)?.message);
        const key = (err as { status?: number })?.status === 429 ? "rate" : "generic";
        controller.enqueue(encoder.encode(`\n\n> ${ERR[key][lang]}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Sourced": retrieval.sourced ? "1" : "0",
      "X-Confirm": retrieval.confirm ? "1" : "0",
    },
  });
}
