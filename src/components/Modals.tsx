import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { CATEGORIES, CATEGORY_ORDER, STATUS_META } from "../constants";
import {
  calculateCompletion,
  calculateStatus,
  calculateXPForDate,
  categoryStats,
  getTasksForDate,
  prettyDate,
  quoteOfDay,
} from "../helpers";
import { useAppState } from "../state";
import type { CategoryKey, Task } from "../types";
import { Btn, Card, KV, Meter, ProgressRing, StatusBadge, Tag } from "./UI";
import { TaskCard } from "./TaskCard";

/* ---------------- Modal frame ---------------- */
export function Modal({
  open,
  onClose,
  children,
  title,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const widths: Record<string, string> = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 360, damping: 30 }}
            className={`relative w-full ${widths[size]} max-h-[92vh] overflow-y-auto bg-ink-900 border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl`}
          >
            {title !== undefined && (
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/5 bg-ink-900/95 backdrop-blur">
                <h2 className="text-base font-semibold text-zinc-100">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Daily Summary Modal ---------------- */
export function DailySummaryModal({
  date,
  open,
  onClose,
  api,
  onEdit,
}: {
  date: string;
  open: boolean;
  onClose: () => void;
  api: ReturnType<typeof useAppState>;
  onEdit: () => void;
}) {
  const { state } = api;
  const tasks = getTasksForDate(state, date);
  const record = state.records[date];
  const completions = record?.completions ?? {};
  const { done, total, pct } = calculateCompletion(tasks, completions);
  const status = record ? calculateStatus(tasks, completions) : "missed";
  const xpEarned = record ? calculateXPForDate(tasks, completions) : 0;
  const cats = categoryStats(state, date);
  const quote = quoteOfDay(date);
  const meta = STATUS_META[status];

  return (
    <Modal open={open} onClose={onClose} title={prettyDate(date)} size="md">
      <div className="grid sm:grid-cols-[auto_1fr] gap-5 items-center">
        <ProgressRing
          value={pct}
          size={110}
          stroke={9}
          color={meta.hex}
          label={<span className="text-2xl">{pct}%</span>}
          sublabel="Complete"
        />
        <div>
          <StatusBadge status={status} />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                Tasks
              </div>
              <div className="text-xl font-bold tabular text-zinc-100">
                {done}/{total}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest">
                XP earned
              </div>
              <div className="text-xl font-bold tabular text-cyan-300">
                +{xpEarned}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-2">
          Category breakdown
        </div>
        <div className="space-y-2">
          {CATEGORY_ORDER.map((k) => {
            const c = CATEGORIES[k];
            const s = cats[k];
            const p = s.total === 0 ? 0 : Math.round((s.done / s.total) * 100);
            return (
              <div key={k} className="flex items-center gap-3">
                <span className="w-20 text-[11px] uppercase tracking-wider text-zinc-400">
                  {c.label}
                </span>
                <div className="flex-1">
                  <Meter value={p} color={`from-zinc-300 to-zinc-300`} />
                </div>
                <span className="w-14 text-right text-[11px] tabular text-zinc-400">
                  {s.done}/{s.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="mt-5 p-4 bg-zinc-900/40 border-amber-500/15">
        <div className="text-sm italic text-zinc-300">"{quote.text}"</div>
        <div className="text-[11px] uppercase tracking-widest text-amber-300/80 mt-2">
          — {quote.by}
        </div>
      </Card>

      {record?.review && (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {record.review.mood && <KV label="Mood" value={`${record.review.mood}/5`} />}
          {record.review.energy && <KV label="Energy" value={`${record.review.energy}/5`} />}
          {record.review.focus && <KV label="Focus" value={`${record.review.focus}/5`} />}
          {record.review.notes && (
            <div className="col-span-2 text-sm text-zinc-300 mt-1">
              <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1">
                Notes
              </div>
              {record.review.notes}
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <Btn onClick={onClose} variant="ghost">
          Close
        </Btn>
        <Btn onClick={onEdit} variant="primary">
          Edit record
        </Btn>
      </div>
    </Modal>
  );
}

/* ---------------- Edit Record Modal ---------------- */
export function EditRecordModal({
  date,
  open,
  onClose,
  api,
}: {
  date: string;
  open: boolean;
  onClose: () => void;
  api: ReturnType<typeof useAppState>;
}) {
  const { state, toggleTask, removeCustomTask, updateReview, addCustomTask } = api;
  const record = state.records[date];
  const tasks = getTasksForDate(state, date);
  const review = record?.review ?? {};
  const [showAdd, setShowAdd] = useState(false);

  return (
    <Modal open={open} onClose={onClose} title={`Edit · ${prettyDate(date)}`} size="lg">
      <div className="space-y-2">
        {tasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            checked={!!record?.completions[t.id]}
            onToggle={() => toggleTask(date, t.id)}
            onRemove={t.isCustom ? () => removeCustomTask(date, t.id) : undefined}
          />
        ))}
      </div>

      <div className="mt-4">
        {showAdd ? (
          <AddCustomTaskInline
            onAdd={(task) => {
              addCustomTask(date, task);
              setShowAdd(false);
            }}
            onCancel={() => setShowAdd(false)}
          />
        ) : (
          <Btn variant="ghost" onClick={() => setShowAdd(true)}>
            + Add custom task
          </Btn>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <RatingInput
          label="Mood"
          value={review.mood ?? 0}
          onChange={(v) => updateReview(date, { mood: v as any })}
        />
        <RatingInput
          label="Energy"
          value={review.energy ?? 0}
          onChange={(v) => updateReview(date, { energy: v as any })}
        />
        <RatingInput
          label="Focus"
          value={review.focus ?? 0}
          onChange={(v) => updateReview(date, { focus: v as any })}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ReviewField
          label="What went well today?"
          value={review.wentWell ?? ""}
          onChange={(v) => updateReview(date, { wentWell: v })}
        />
        <ReviewField
          label="What needs improvement?"
          value={review.needsImprovement ?? ""}
          onChange={(v) => updateReview(date, { needsImprovement: v })}
        />
      </div>

      <div className="mt-3">
        <ReviewField
          label="Notes"
          rows={3}
          value={review.notes ?? ""}
          onChange={(v) => updateReview(date, { notes: v })}
        />
      </div>

      <div className="mt-5 flex justify-end">
        <Btn onClick={onClose} variant="primary">
          Save & close
        </Btn>
      </div>
    </Modal>
  );
}

function RatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(value === n ? 0 : n)}
            className={`flex-1 py-2 rounded-lg border text-sm font-semibold tabular ${
              value >= n
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                : "bg-white/[0.02] text-zinc-500 border-white/5 hover:bg-white/5"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewField({
  label,
  value,
  onChange,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full rounded-xl bg-white/[0.03] border border-white/10 focus:border-cyan-400/40 focus:outline-none px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
        placeholder="Type here…"
      />
    </label>
  );
}

function AddCustomTaskInline({
  onAdd,
  onCancel,
}: {
  onAdd: (t: Task) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CategoryKey>("work");
  const [xp, setXp] = useState(5);
  const [priority, setPriority] = useState<"low" | "med" | "high">("med");
  const [time, setTime] = useState("");

  return (
    <Card className="p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. 30 min mobility"
            className="input"
          />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryKey)}
            className="input"
          >
            {CATEGORY_ORDER.map((k) => (
              <option key={k} value={k}>
                {CATEGORIES[k].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="XP value">
          <input
            type="number"
            min={1}
            max={50}
            value={xp}
            onChange={(e) => setXp(parseInt(e.target.value || "5"))}
            className="input"
          />
        </Field>
        <Field label="Priority">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="input"
          >
            <option value="low">Low</option>
            <option value="med">Medium</option>
            <option value="high">High</option>
          </select>
        </Field>
        <Field label="Time (optional)">
          <input
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="e.g. 7:00 PM"
            className="input"
          />
        </Field>
        <Field label="Description (optional)">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2">
        <Btn variant="ghost" onClick={onCancel}>
          Cancel
        </Btn>
        <Btn
          variant="primary"
          onClick={() => {
            if (!title.trim()) return;
            onAdd({
              id: `c_${Date.now()}`,
              title: title.trim(),
              description: description.trim() || undefined,
              category,
              xp,
              priority,
              time: time.trim() || undefined,
              isCustom: true,
            });
          }}
        >
          Add task
        </Btn>
      </div>
      <style>{`.input{width:100%;border-radius:0.75rem;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:0.5rem 0.75rem;color:#e5e7eb;font-size:0.875rem;outline:none}.input:focus{border-color:rgba(34,211,238,0.4)}`}</style>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-widest text-zinc-500 mb-1.5">
        {label}
      </div>
      {children}
    </label>
  );
}

/* ---------------- Achievement Toast ---------------- */
export function AchievementToast({
  open,
  title,
  desc,
  onClose,
}: {
  open: boolean;
  title: string;
  desc: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <Card className="px-4 py-3 flex items-center gap-3 border-amber-500/30">
            <div className="w-9 h-9 rounded-full bg-amber-500/15 grid place-items-center text-amber-300">
              ✦
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-300">
                Achievement unlocked
              </div>
              <div className="font-semibold text-zinc-100">{title}</div>
              <div className="text-[11px] text-zinc-400">{desc}</div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
