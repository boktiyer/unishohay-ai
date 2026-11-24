"use client";

import { ArrowRight, CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { admission, toLangDigits } from "@/lib/admission-data";
import { useLang } from "./Providers";

// End of the last day, Bangladesh time (UTC+6)
const DEADLINE = new Date(`${admission.admission_dates.bachelors.direct_admission_last_date}T23:59:59+06:00`).getTime();

/** Live countdown to the direct-admission deadline, computed from the visitor's current time. */
export default function Countdown() {
  const { t, lang } = useLang();
  const [now, setNow] = useState<number | null>(null); // null until mounted: avoids a server/client mismatch

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read browser-only state after mount so server and client HTML match
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const left = now == null ? null : DEADLINE - now;
  const passed = left != null && left <= 0;
  const parts =
    left != null && left > 0
      ? [
          [Math.floor(left / 86_400_000), t("cd_days")],
          [Math.floor((left % 86_400_000) / 3_600_000), t("cd_hours")],
          [Math.floor((left % 3_600_000) / 60_000), t("cd_mins")],
        ]
      : [];

  return (
    <div className="bg-brand-gradient text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2.5 text-sm sm:justify-between sm:px-6">
        <p className="flex items-center gap-2 font-medium">
          <CalendarClock size={17} className="shrink-0" />
          {passed ? t("cd_passed") : `${t("cd_title")}: ${t("cd_date")}`}
        </p>
        {!passed && (
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-live="polite">
              {(left == null ? [["–", t("cd_days")], ["–", t("cd_hours")], ["–", t("cd_mins")]] : parts).map(([v, label]) => (
                <span key={String(label)} className="rounded-lg bg-white/15 px-2 py-0.5 tabular-nums">
                  <b>{typeof v === "number" ? toLangDigits(String(v).padStart(2, "0"), lang) : v}</b> {label}
                </span>
              ))}
            </div>
            <a
              href={admission.university.online_admission_portal}
              target="_blank"
              rel="noreferrer"
              title={t("portal_note")}
              className="hidden items-center gap-1 rounded-lg bg-white px-3 py-1 font-semibold text-brand sm:inline-flex"
            >
              {t("cd_apply")} <ArrowRight size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
