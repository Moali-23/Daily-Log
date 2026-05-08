import { Plus, Target as TargetIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAppState } from "../state";
import type { Goal } from "../types";
import { Btn, Card, SectionHeader } from "../components/UI";
import { ConfirmDialog, Modal } from "../components/Modals";

const ACCENTS: Record<string, { from: string; to: string; chip: string; text: string; ring: string }> = {
  violet: {
    from: "from-violet-500/20",
    to: "to-violet-500/0",
    chip: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    text: "text-violet-300",
    ring: "border-violet-500/30",
  },
  amber: {
    from: "from-amber-500/20",
    to: "to-amber-500/0",
    chip: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    text: "text-amber-300",
    ring: "border-amber-500/30",
  },
  emerald: {
    from: "from-emerald-500/20",
    to: "to-emerald-500/0",
    chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    text: "text-emerald-300",
    ring: "border-emerald-500/30",
  },
  cyan: {
    from: "from-cyan-500/20",
    to: "to-cyan-500/0",
    chip: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    text: "text-cyan-300",
    ring: "border-cyan-500/30",
  },
  rose: {
    from: "from-rose-500/20",
    to: "to-rose-500/0",
    chip: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    text: "text-rose-300",
    ring: "border-rose-500/30",
  },
};

export function TargetsPage({ api }: { api: ReturnType<typeof useAppState> }) {
  const { state, upsertGoal, removeGoal } = api;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Goal | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const confirmingGoal = state.goals.find((g) => g.id === confirmingId) ?? null;

  function newGoal() {
    setDraft({
      id: `g_${Date.now()}`,
      title: "",
      metric: "",
      targetDate: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10),
      category: "Trading",
      notes: "",
      accent: "violet",
    });
    setOpen(true);
  }

  function editGoal(g: Goal) {
    setDraft({ ...g });
    setOpen(true);
  }

  return (
    <>
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500">
            Targets
          </div>
          <h2 className="mt-1 text-2xl font-bold text-zinc-100">
            Long-range missions
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Big rocks. The numbers your daily discipline is building toward.
          </p>
        </div>
        <Btn variant="primary" icon={<Plus size={14} />} onClick={newGoal}>
          New target
        </Btn>
      </div>

      <div className="space-y-3">
        {state.goals.map((g) => {
          const a = ACCENTS[g.accent ?? "violet"];
          const target = new Date(g.targetDate + "T00:00:00");
          const now = new Date();
          const totalMs = target.getTime() - now.getTime();
          const days = Math.max(0, Math.round(totalMs / (1000 * 60 * 60 * 24)));
          return (
            <Card
              key={g.id}
              className={`relative overflow-hidden p-5 sm:p-6 ${a.ring}`}
            >
              <div
                className={`absolute -top-16 -right-12 w-56 h-56 rounded-full blur-3xl bg-gradient-to-br ${a.from} ${a.to}`}
              />
              <div className="relative flex flex-wrap items-start gap-3 justify-between">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                    {g.category} · {target.toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                  </div>
                  <div className={`mt-2 text-3xl sm:text-4xl font-bold tracking-tight tabular ${a.text}`}>
                    {g.metric}
                  </div>
                  <div className="text-base text-zinc-200 mt-1">{g.title}</div>
                  {g.notes && (
                    <div className="text-[12px] text-zinc-500 mt-2 max-w-prose">
                      {g.notes}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 rounded-full border text-[11px] tracking-wider uppercase ${a.chip}`}>
                    {days} days
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => editGoal(g)}
                      className="text-[11px] px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 border border-white/10"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmingId(g.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/15 text-rose-300 border border-rose-500/20 transition active:scale-95"
                      aria-label="Delete target"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
        {state.goals.length === 0 && (
          <Card className="p-8 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-white/5 grid place-items-center text-zinc-400">
              <TargetIcon size={20} />
            </div>
            <div className="mt-2 text-zinc-200 font-semibold">No targets yet</div>
            <div className="text-sm text-zinc-500 mt-1">
              Add your first long-range goal to anchor every daily decision.
            </div>
          </Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={draft?.id?.startsWith("g_") && state.goals.find(g => g.id === draft?.id) ? "Edit target" : "New target"}>
        {draft && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Title">
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="input"
                placeholder="e.g. Funded Trading Income"
              />
            </Field>
            <Field label="Metric">
              <input
                value={draft.metric}
                onChange={(e) => setDraft({ ...draft, metric: e.target.value })}
                className="input"
                placeholder="e.g. £10,000 / month"
              />
            </Field>
            <Field label="Target date">
              <input
                type="date"
                value={draft.targetDate}
                onChange={(e) => setDraft({ ...draft, targetDate: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Category">
              <input
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Accent">
              <select
                value={draft.accent}
                onChange={(e) => setDraft({ ...draft, accent: e.target.value as any })}
                className="input"
              >
                <option value="violet">Violet</option>
                <option value="amber">Amber</option>
                <option value="emerald">Emerald</option>
                <option value="cyan">Cyan</option>
                <option value="rose">Rose</option>
              </select>
            </Field>
            <Field label="Notes" full>
              <textarea
                value={draft.notes ?? ""}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                rows={3}
                className="input"
              />
            </Field>
          </div>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Btn variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Btn>
          <Btn
            variant="primary"
            onClick={() => {
              if (draft && draft.title.trim()) {
                upsertGoal(draft);
                setOpen(false);
              }
            }}
          >
            Save target
          </Btn>
        </div>
        <style>{`.input{width:100%;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:0.5rem 0.75rem;color:#e5e7eb;font-size:0.875rem;outline:none}.input:focus{border-color:rgb(var(--accent) / 0.5)}`}</style>
      </Modal>

      <ConfirmDialog
        open={!!confirmingGoal}
        title="Delete this target?"
        message={
          confirmingGoal ? (
            <>
              You're about to remove{" "}
              <span className="font-semibold text-zinc-200">
                {confirmingGoal.title || "this goal"}
              </span>
              . This cannot be undone, but you can always add it back later.
            </>
          ) : (
            "This cannot be undone."
          )
        }
        confirmLabel="Delete target"
        variant="danger"
        onCancel={() => setConfirmingId(null)}
        onConfirm={() => {
          if (confirmingId) removeGoal(confirmingId);
          setConfirmingId(null);
        }}
      />
    </>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}
