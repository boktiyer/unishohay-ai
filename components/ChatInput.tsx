"use client";

import clsx from "clsx";
import { Mic, MicOff, SendHorizontal, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLang } from "./Providers";

/* Minimal Web Speech API typings (not in lib.dom for all TS versions) */
interface SpeechRec {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SpeechRecCtor = new () => SpeechRec;

interface Props {
  onSend: (text: string) => void;
  onStop: () => void;
  loading: boolean;
}

export default function ChatInput({ onSend, onStop, loading }: Props) {
  const { t, lang } = useLang();
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const [speechCtor, setSpeechCtor] = useState<SpeechRecCtor | null>(null);
  const recRef = useRef<SpeechRec | null>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const w = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
    setSpeechCtor(() => w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null);
    return () => recRef.current?.stop();
  }, []);

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [text]);

  const submit = () => {
    if (!text.trim() || loading) return;
    recRef.current?.stop();
    onSend(text);
    setText("");
  };

  const toggleVoice = () => {
    if (!speechCtor) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new speechCtor();
    rec.lang = lang === "bn" ? "bn-BD" : "en-US";
    rec.interimResults = true;
    rec.continuous = false;
    const base = text ? text.trimEnd() + " " : "";
    rec.onresult = (e) => {
      const transcript = Array.from(e.results).map((r) => r[0].transcript).join("");
      setText(base + transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <div className="glass flex items-end gap-2 rounded-2xl p-2">
      {speechCtor && (
        <button
          type="button"
          onClick={toggleVoice}
          className={clsx(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition",
            listening ? "animate-pulse bg-red-500 text-white" : "text-slate-500 hover:bg-brand/10 hover:text-brand"
          )}
          aria-label={t("voice")}
          title={t("voice")}
        >
          {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
      )}
      <textarea
        ref={areaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        rows={1}
        maxLength={2000}
        placeholder={listening ? t("listening") : t("placeholder")}
        className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-slate-400"
        aria-label={t("placeholder")}
      />
      {loading ? (
        <button onClick={onStop} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-800 text-white dark:bg-white/15" aria-label={t("stop")} title={t("stop")}>
          <Square size={15} fill="currentColor" />
        </button>
      ) : (
        <button onClick={submit} disabled={!text.trim()} className="btn-primary h-10 w-10 shrink-0 !p-0" aria-label={t("send")} title={t("send")}>
          <SendHorizontal size={18} />
        </button>
      )}
    </div>
  );
}
