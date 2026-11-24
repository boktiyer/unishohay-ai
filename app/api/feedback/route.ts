/**
 * Thumbs up / down feedback. No database: entries are written to the server log
 * (visible with `vercel logs`) and kept in memory for a quick summary via GET.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Entry {
  at: string;
  rating: "up" | "down";
  question: string;
  answer: string;
  sources: string;
}

const entries: Entry[] = [];

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (b?.rating !== "up" && b?.rating !== "down") return Response.json({ ok: false }, { status: 400 });
    const entry: Entry = {
      at: new Date().toISOString(),
      rating: b.rating,
      question: String(b.question ?? "").slice(0, 300),
      answer: String(b.answer ?? "").slice(0, 300),
      sources: String(b.sources ?? "").slice(0, 100),
    };
    entries.push(entry);
    if (entries.length > 500) entries.shift();
    console.log("[feedback]", JSON.stringify(entry));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}

/** Counts since this server instance started (instances restart, so this is only a rough view). */
export async function GET() {
  const up = entries.filter((e) => e.rating === "up").length;
  return Response.json({ up, down: entries.length - up, recentDown: entries.filter((e) => e.rating === "down").slice(-10) });
}
