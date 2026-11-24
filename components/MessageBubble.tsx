"use client";

import clsx from "clsx";
import { Check, Copy, Database, Info, RefreshCw, TriangleAlert, User, Zap } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/types";
import { LogoMark } from "./Logo";
import { useLang } from "./Providers";

interface Props {
  message: ChatMessage;
  streaming: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
}

export default function MessageBubble({ message, streaming, canRegenerate, onRegenerate }: Props) {
  const { t } = useLang();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: ignore */
    }
  };

  return (
    <div
      className={clsx("anim-msg flex gap-3", isUser && "flex-row-reverse")}
    >
      {isUser ? (
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <User size={16} />
        </span>
      ) : (
        <LogoMark size={36} />
      )}

      <div className={clsx("min-w-0 max-w-[85%] sm:max-w-[75%]", isUser && "flex flex-col items-end")}>
        <div
          className={clsx(
            "rounded-2xl px-4 py-3 text-[15px] leading-relaxed",
            isUser
              ? "bg-brand-gradient whitespace-pre-wrap rounded-tr-md text-white"
              : message.error
                ? "rounded-tl-md border border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                : "glass rounded-tl-md"
          )}
        >
          {isUser ? (
            message.content
          ) : message.error ? (
            <span className="flex gap-2"><TriangleAlert size={17} className="mt-0.5 shrink-0" /> {message.content}</span>
          ) : message.content ? (
            <div className="md break-words">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: (p) => <a {...p} target="_blank" rel="noreferrer" /> }}>
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <span className="flex gap-1 py-1.5" aria-label="Typing">
              <span className="dot h-2 w-2 rounded-full bg-brand-violet" />
              <span className="dot h-2 w-2 rounded-full bg-brand-violet" />
              <span className="dot h-2 w-2 rounded-full bg-brand-violet" />
            </span>
          )}
        </div>

        {!isUser && message.content && !streaming && (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
            {message.sourced && !message.error && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 font-medium text-brand dark:text-brand-violet">
                <Database size={12} /> {t("source")}
              </span>
            )}
            {message.fallback && (
              <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                <Zap size={12} /> {t("fallback_note")}
              </span>
            )}
            {message.confirm && !message.error && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                <Info size={12} /> {t("confirm_note")}
              </span>
            )}
            {!message.error && (
              <button onClick={copy} className="inline-flex items-center gap-1 hover:text-brand" aria-label={t("copy")}>
                {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? t("copied") : t("copy")}
              </button>
            )}
            {canRegenerate && (
              <button onClick={onRegenerate} className="inline-flex items-center gap-1 hover:text-brand" aria-label={t("regenerate")}>
                <RefreshCw size={13} /> {t("regenerate")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
