"use client";

import { ArrowUpRight, Eraser, PanelLeft } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { detectLang } from "@/lib/admission-data";
import { dict, quickQuestions, suggestions } from "@/lib/i18n";
import type { ChatMessage, Conversation } from "@/types";
import ChatInput from "./ChatInput";
import { LogoFull } from "./Logo";
import MessageBubble from "./MessageBubble";
import { useLang } from "./Providers";
import Sidebar from "./Sidebar";

const STORAGE_KEY = "unishohay-chats";
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function SuggestedQuestions({ onPick }: { onPick: (q: string) => void }) {
  const { t, lang } = useLang();
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-2 py-10 text-center">
      <div>
        <LogoFull width={220} priority className="h-auto w-44 sm:w-56" />
      </div>
      <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">{t("welcome_title")}</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">{t("welcome_sub")}</p>
      <div
        className="mt-8 grid w-full gap-3 sm:grid-cols-2"
      >
        {suggestions[lang].map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            className="glass group flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition hover:-translate-y-0.5 hover:border-brand-violet/40"
          >
            {q}
            <ArrowUpRight size={16} className="shrink-0 text-brand-violet transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow() {
  const { t, lang } = useLang();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loading = streamingId !== null;
  const active = convs.find((c) => c.id === activeId);
  const messages = active?.messages ?? [];

  // Load / persist history
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as Conversation[];
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser-only state after mount so server and client HTML match
      if (Array.isArray(saved)) setConvs(saved);
    } catch {
      /* corrupted storage: start fresh */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(convs.slice(0, 50)));
  }, [convs, loaded]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, messages[messages.length - 1]?.content]);

  const updateConv = (id: string, fn: (c: Conversation) => Conversation) =>
    setConvs((cs) => cs.map((c) => (c.id === id ? fn(c) : c)));

  const patchMsg = (convId: string, msgId: string, patch: (m: ChatMessage) => Partial<ChatMessage>) =>
    updateConv(convId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === msgId ? { ...m, ...patch(m) } : m)) }));

  /** Stream an assistant reply for `history` (which ends with a user message). */
  const run = useCallback(async (convId: string, history: ChatMessage[]) => {
    const aId = uid();
    const lastText = history[history.length - 1].content;
    updateConv(convId, (c) => ({ ...c, updatedAt: Date.now(), messages: [...history, { id: aId, role: "assistant", content: "" }] }));
    setStreamingId(aId);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.filter((m) => !m.error).slice(-12).map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || dict[detectLang(lastText)].network_error);
      }
      patchMsg(convId, aId, () => ({ sourced: res.headers.get("X-Sourced") === "1", confirm: res.headers.get("X-Confirm") === "1", fallback: res.headers.get("X-Fallback") === "1", sources: (res.headers.get("X-Sources") || "").split(",").filter(Boolean) }));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (chunk) patchMsg(convId, aId, (m) => ({ content: m.content + chunk }));
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        patchMsg(convId, aId, (m) => (m.content ? {} : { content: "…" }));
      } else {
        const msg = err instanceof TypeError ? dict[detectLang(lastText)].network_error : (err as Error).message;
        patchMsg(convId, aId, () => ({ content: msg, error: true, sourced: false, confirm: false }));
      }
    } finally {
      setStreamingId(null);
      abortRef.current = null;
    }
  }, []);

  const send = (text: string) => {
    const content = text.trim();
    if (!content || loading) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", content };
    let id = activeId;
    if (!id) {
      id = uid();
      const conv: Conversation = { id, title: content.slice(0, 48), messages: [], updatedAt: Date.now() };
      setConvs((cs) => [conv, ...cs]);
      setActiveId(id);
    }
    run(id, [...messages, userMsg]);
  };

  const rate = (msgId: string, rating: "up" | "down") => {
    if (!activeId) return;
    const idx = messages.findIndex((m) => m.id === msgId);
    const answer = messages[idx];
    const question = [...messages.slice(0, idx)].reverse().find((m) => m.role === "user");
    patchMsg(activeId, msgId, () => ({ rating }));
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, question: question?.content, answer: answer?.content, sources: answer?.sources?.join(",") }),
    }).catch(() => {});
  };

  const regenerate = () => {
    if (!activeId || loading) return;
    const lastUser = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUser >= 0) run(activeId, messages.slice(0, lastUser + 1));
  };

  const stop = () => abortRef.current?.abort();

  const newChat = () => {
    stop();
    setActiveId(null);
    setSidebarOpen(false);
  };

  // Deep link: /chat?q=question (used by the Tools page)
  useEffect(() => {
    if (!loaded) return;
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      window.history.replaceState(null, "", "/chat");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser-only state after mount so server and client HTML match
      send(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <div className="flex h-[calc(100dvh-4rem)]">
      <Sidebar
        conversations={[...convs].sort((a, b) => b.updatedAt - a.updatedAt)}
        activeId={activeId}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNew={newChat}
        onSelect={(id) => {
          if (loading) stop();
          setActiveId(id);
          setSidebarOpen(false);
        }}
        onRename={(id, title) => updateConv(id, (c) => ({ ...c, title }))}
        onDelete={(id) => {
          if (id === activeId) newChat();
          setConvs((cs) => cs.filter((c) => c.id !== id));
        }}
      />

      <section className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 px-3 py-2 dark:border-white/5">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost h-9 px-3 text-sm md:hidden" aria-label={t("history")}>
            <PanelLeft size={16} /> {t("history")}
          </button>
          <p className="hidden truncate text-sm font-semibold md:block">{active?.title ?? t("new_chat")}</p>
          <button
            onClick={() => activeId && updateConv(activeId, (c) => ({ ...c, messages: [] }))}
            disabled={!messages.length || loading}
            className="btn-ghost h-9 px-3 text-sm disabled:pointer-events-none disabled:opacity-40"
          >
            <Eraser size={15} /> <span className="hidden sm:inline">{t("clear")}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-6 sm:px-6">
          {messages.length === 0 ? (
            <SuggestedQuestions onPick={send} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              <>
                {messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    message={m}
                    streaming={m.id === streamingId}
                    canRegenerate={m.id === lastAssistantId && !loading}
                    onRegenerate={regenerate}
                    onRate={(r) => rate(m.id, r)}
                  />
                ))}
              </>
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl px-3 pb-3 sm:px-6 sm:pb-5">
          <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
            {quickQuestions[lang].map((q) => (
              <button
                key={q.label}
                onClick={() => send(q.question)}
                disabled={loading}
                className="shrink-0 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-violet/50 hover:text-brand disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              >
                {q.label}
              </button>
            ))}
          </div>
          <ChatInput onSend={send} onStop={stop} loading={loading} />
          <p className="mt-2 text-center text-[11px] text-slate-400">{t("disclaimer")}</p>
        </div>
      </section>
    </div>
  );
}
