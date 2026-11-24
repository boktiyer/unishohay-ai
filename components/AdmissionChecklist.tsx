"use client";

import clsx from "clsx";
import { Check, ClipboardCheck, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { admission, toLangDigits } from "@/lib/admission-data";
import { Card } from "./PageShell";
import { useLang } from "./Providers";

const KEY = "unishohay-checklist";
const steps = admission.admission_procedure.steps;

export default function AdmissionChecklist() {
  const { t, lang } = useLang();
  const [done, setDone] = useState<boolean[]>(() => steps.map(() => false));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser-only state after mount so server and client HTML match
      if (Array.isArray(saved) && saved.length === steps.length) setDone(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const update = (next: boolean[]) => {
    setDone(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const count = done.filter(Boolean).length;
  const pct = Math.round((count / steps.length) * 100);

  return (
    <Card icon={ClipboardCheck} title={t("checklist")}>
      <div className="mb-5">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-semibold">{toLangDigits(pct, lang)}% {t("progress")}</span>
          <button onClick={() => update(steps.map(() => false))} className="inline-flex items-center gap-1 text-slate-500 hover:text-brand">
            <RotateCcw size={14} /> {t("reset")}
          </button>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
          <div className="bg-brand-gradient h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="space-y-2">
        {steps.map((s, i) => (
          <li key={i}>
            <button
              onClick={() => update(done.map((d, j) => (j === i ? !d : d)))}
              className={clsx(
                "flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition",
                done[i] ? "border-brand-violet/40 bg-brand/5" : "border-slate-200 hover:border-brand-violet/40 dark:border-white/10"
              )}
              aria-pressed={done[i]}
            >
              <span className={clsx("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border", done[i] ? "bg-brand-gradient border-transparent text-white" : "border-slate-300 dark:border-white/20")}>
                {done[i] && <Check size={13} strokeWidth={3} />}
              </span>
              <span className={clsx(done[i] && "text-slate-400 line-through")}>{lang === "bn" ? s.bn : s.en}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
