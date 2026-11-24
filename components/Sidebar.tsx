"use client";

import clsx from "clsx";
import { Check, MessageSquare, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Conversation } from "@/types";
import { useLang } from "./Providers";

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

export default function Sidebar({ conversations, activeId, open, onClose, onSelect, onNew, onRename, onDelete }: Props) {
  const { t } = useLang();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  const saveRename = () => {
    if (editing && draft.trim()) onRename(editing, draft.trim());
    setEditing(null);
  };

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200/70 bg-white/95 p-3 backdrop-blur-xl transition-transform dark:border-white/5 dark:bg-night/95",
          "md:static md:z-0 md:translate-x-0 md:bg-white/40 md:dark:bg-white/[0.02]",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-3 flex items-center gap-2">
          <button onClick={onNew} className="btn-primary flex-1 py-2.5 text-sm">
            <Plus size={17} /> {t("new_chat")}
          </button>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl md:hidden" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{t("history")}</p>
        <div className="-mx-1 flex-1 space-y-1 overflow-y-auto px-1">
          {conversations.length === 0 && <p className="px-2 text-sm text-slate-400">{t("no_history")}</p>}
          {conversations.map((c) => (
            <div
              key={c.id}
              className={clsx(
                "group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm transition",
                c.id === activeId ? "bg-brand/10 text-brand dark:text-brand-violet" : "hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              <MessageSquare size={15} className="shrink-0 opacity-70" />
              {editing === c.id ? (
                <>
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename();
                      if (e.key === "Escape") setEditing(null);
                    }}
                    className="min-w-0 flex-1 rounded-md border border-brand-violet/40 bg-transparent px-1.5 py-0.5 outline-none"
                  />
                  <button onClick={saveRename} aria-label={t("rename")}><Check size={15} /></button>
                </>
              ) : (
                <>
                  <button onClick={() => onSelect(c.id)} className="min-w-0 flex-1 truncate text-left">{c.title}</button>
                  <span className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                    <button onClick={() => { setEditing(c.id); setDraft(c.title); }} className="p-1 hover:text-brand" aria-label={t("rename")} title={t("rename")}>
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(c.id)} className="p-1 hover:text-red-500" aria-label={t("delete")} title={t("delete")}>
                      <Trash2 size={13} />
                    </button>
                  </span>
                </>
              )}
            </div>
          ))}
        </div>
      </aside>
    </>
  );
}
