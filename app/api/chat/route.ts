import { streamText } from "ai";
import { detectLang, retrieveContext } from "@/lib/admission-data";
import { fallbackAnswer } from "@/lib/fallback";
import { buildSystemInstruction, MODELS } from "@/lib/ai";
import type { Lang } from "@/types";

export const runtime = "nodejs";
export const preferredRegion = "sin1"; // Singapore: closest Vercel region to Bangladesh
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_HISTORY = 12;
const MAX_CHARS = 2000;

const ERR = {
  empty: { en: "Please type a question first.", bn: "অনুগ্রহ করে আগে একটি প্রশ্ন লিখুন।" },
  long: { en: "Your message is too long. Please keep it under 2000 characters.", bn: "আপনার বার্তাটি অনেক বড়। অনুগ্রহ করে ২০০০ অক্ষরের মধ্যে রাখুন।" },
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
  while (messages.length && messages[0].role !== "user") messages.shift(); // history must start with a user turn

  const last = messages[messages.length - 1];
  const lang = last ? detectLang(last.content) : "en";
  if (!last || last.role !== "user") return fail("empty", lang, 400);
  if (last.content.length > MAX_CHARS) return fail("long", lang, 400);

  const previousUser = messages.slice(0, -1).filter((m) => m.role === "user").slice(-3).map((m) => m.content);
  const retrieval = retrieveContext(last.content, previousUser);

  // Open-weight models via AI Gateway. Fallback models are tried by the gateway itself.
  // Wait at most ~10s for the first token; after that, answer straight from the dataset.
  let stream: AsyncIterable<string> | null = null;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10_000);
    const result = streamText({
      model: MODELS[0],
      system: buildSystemInstruction(retrieval.context, lang, retrieval.confirm),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.3,
      maxOutputTokens: 1200,
      abortSignal: ctrl.signal,
      providerOptions: { gateway: { models: MODELS.slice(1) } },
    });
    const iterator = result.textStream[Symbol.asyncIterator]();
    const first = await iterator.next();
    clearTimeout(timer);
    if (!first.done) {
      stream = (async function* () {
        yield first.value;
        while (true) {
          const next = await iterator.next();
          if (next.done) return;
          yield next.value;
        }
      })();
    }
  } catch (err) {
    console.error("AI Gateway error:", (err as Error)?.message?.slice(0, 200));
  }

  if (!stream) {
    // Models busy / unavailable / too slow: answer directly from the official dataset.
    const fb = fallbackAnswer(last.content, previousUser, lang);
    return new Response(fb.text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "X-Sourced": fb.sourced ? "1" : "0",
        "X-Confirm": fb.confirm ? "1" : "0",
        "X-Fallback": "1",
        "X-Sources": fb.sourced ? fb.topics.slice(0, 3).join(",") : "contact",
      },
    });
  }

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const text of stream) {
          if (text) controller.enqueue(encoder.encode(text));
        }
      } catch (err) {
        console.error("AI stream error:", (err as Error)?.message);
        controller.enqueue(encoder.encode(`\n\n> ${ERR.generic[lang]}`));
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
      "X-Sources": retrieval.sourced ? retrieval.topics.slice(0, 3).join(",") : "",
    },
  });
}
