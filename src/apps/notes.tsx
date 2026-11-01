"use client";

import { NotePencil, Plus, Trash } from "@phosphor-icons/react";
import { useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppFrame } from "@/components/app-frame";
import { Empty } from "@/components/kit";
import { profile } from "@/data/portfolio";
import { useNow } from "@/hooks/use-now";
import { ago } from "@/lib/format";

interface Note {
  id: string;
  body: string;
  updated: number;
}

interface NotesState {
  notes: Note[];
  add: () => string;
  edit: (id: string, body: string) => void;
  remove: (id: string) => void;
}

const WELCOME = `Welcome 👋

This is a real notes app. Anything you write here is saved in this browser only. It never leaves your device.

Things to try on this site:
• Open the terminal and type "help"
• Change the wallpaper and accent colour in Settings
• Restart to boot a different operating system
• Shrink the window: every system turns into its phone

Want to reach ${profile.firstName}? Open Contact.`;

const useNotes = create<NotesState>()(
  persist(
    (set) => ({
      notes: [{ id: "welcome", body: WELCOME, updated: 0 }],
      add: () => {
        const id = `n${Date.now().toString(36)}`;
        set((s) => ({ notes: [{ id, body: "", updated: Date.now() }, ...s.notes] }));
        return id;
      },
      edit: (id, body) =>
        set((s) => ({
          notes: s.notes.map((n) => (n.id === id ? { ...n, body, updated: Date.now() } : n)).sort((a, b) => b.updated - a.updated),
        })),
      remove: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
    }),
    { name: "os-portfolio:notes", version: 1 },
  ),
);

const titleOf = (n: Note) => n.body.trim().split("\n")[0].slice(0, 60) || "New note";
const previewOf = (n: Note) => n.body.trim().split("\n").slice(1).join(" ").trim().slice(0, 80) || "No additional text";

export default function Notes() {
  const notes = useNotes((s) => s.notes);
  const { add, edit, remove } = useNotes.getState();
  const now = useNow(60_000);
  const [openId, setOpenId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const current = notes.find((n) => n.id === openId) ?? notes[0] ?? null;

  const create_ = () => {
    setOpenId(add());
    setEditing(true);
  };

  return (
    <AppFrame
      title={editing && current ? titleOf(current) : undefined}
      subtitle={`${notes.length} ${notes.length === 1 ? "note" : "notes"}`}
      onBack={editing ? () => setEditing(false) : null}
      compact
      flush
      actions={[
        { id: "new", label: "New note", icon: Plus, onClick: create_ },
        {
          id: "delete",
          label: "Delete note",
          icon: Trash,
          disabled: !current,
          onClick: () => {
            if (!current) return;
            remove(current.id);
            setOpenId(null);
            setEditing(false);
          },
        },
      ]}
    >
      <div className="flex h-full">
        <div
          className={`os-notes-list w-full shrink-0 overflow-y-auto border-line @min-[600px]:block @min-[600px]:w-[240px] @min-[600px]:border-r ${editing ? "hidden" : "block"}`}
        >
          {notes.length === 0 && (
            <Empty icon={NotePencil} title="No notes">
              Create one with the + button.
            </Empty>
          )}
          {notes.map((n) => (
            <button
              key={n.id}
              type="button"
              className="os-note block w-full px-3.5 py-2.5 text-left"
              data-on={current?.id === n.id}
              onClick={() => {
                setOpenId(n.id);
                setEditing(true);
              }}
            >
              <span className="block truncate text-[13.5px] font-semibold">{titleOf(n)}</span>
              <span className="mt-0.5 flex gap-2 text-[12px] text-fg3">
                <span className="shrink-0">{n.updated ? ago(n.updated, now) : "pinned"}</span>
                <span className="truncate">{previewOf(n)}</span>
              </span>
            </button>
          ))}
        </div>
        <div className={`min-w-0 flex-1 @min-[600px]:block ${editing ? "block" : "hidden"}`}>
          {current ? (
            <textarea
              key={current.id}
              name="note"
              className="os-note-editor selectable h-full w-full resize-none bg-transparent p-4 text-[14.5px] leading-relaxed outline-none @min-[600px]:p-5"
              value={current.body}
              onChange={(e) => edit(current.id, e.target.value)}
              placeholder="Start writing…"
              aria-label="Note"
            />
          ) : (
            <Empty icon={NotePencil} title="No note selected" />
          )}
        </div>
      </div>
    </AppFrame>
  );
}
